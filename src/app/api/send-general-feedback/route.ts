import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@/utils/supabase/server';

const MAX_MESSAGE_LENGTH = 1500; // A reasonable limit for general feedback

export async function POST(req: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { message: 'Not authenticated' },
            { status: 401 },
        );
    }

    try {
        const { feedbackType, message, userEmail } = await req.json();

        // --- Server-side Validation ---
        if (!feedbackType || typeof feedbackType !== 'string') {
            return NextResponse.json(
                { message: 'Feedback type is required.' },
                { status: 400 },
            );
        }
        if (
            !message ||
            typeof message !== 'string' ||
            message.length > MAX_MESSAGE_LENGTH
        ) {
            return NextResponse.json(
                {
                    message: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`,
                },
                { status: 400 },
            );
        }
        if (userEmail && typeof userEmail !== 'string') {
            return NextResponse.json(
                { message: 'Invalid email format.' },
                { status: 400 },
            );
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT),
            secure: process.env.EMAIL_SERVER_PORT === '465',
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Fazume General Feedback" <${process.env.EMAIL_SERVER_USER}>`,
            to: process.env.EMAIL_TO,
            replyTo: userEmail || process.env.EMAIL_FROM,
            subject: `Fazume Feedback: ${feedbackType}`, // e.g., "Fazume Feedback: Bug Report"
            html: `
                <div style="font-family: sans-serif; line-height: 1.6;">
                    <h2>New General Feedback Received</h2>
                    <p><strong>User ID:</strong> ${user.id}</p>
                    <p><strong>User Email (Provided):</strong> ${
                        userEmail || '<em>Not provided</em>'
                    }</p>
                    <p><strong>Feedback Type:</strong> ${feedbackType}</p>
                    <h3>Message:</h3>
                    <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 12px;">
                        <p>${message}</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Feedback sent successfully!' });
    } catch (error) {
        console.error('Failed to send general feedback email:', error);
        return NextResponse.json(
            { message: 'Internal Server Error. Could not send feedback.' },
            { status: 500 },
        );
    }
}
