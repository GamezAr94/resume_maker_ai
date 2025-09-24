import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@/utils/supabase/server';

const MAX_MESSAGE_LENGTH = 500;

export async function POST(req: Request) {
    const supabase = await createClient();

    // Get the user from the request
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Check if the user is authenticated
    if (!user) {
        return new Response(JSON.stringify({ message: 'Not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { userEmail, rating, message, resumeID } = await req.json();

        // --- Server-side Validation ---
        if (!userEmail || typeof userEmail !== 'string') {
            return NextResponse.json(
                { message: 'User email is required.' },
                { status: 400 },
            );
        }
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json(
                { message: 'Invalid rating. Must be between 1 and 5.' },
                { status: 400 },
            );
        }
        if (
            message &&
            (typeof message !== 'string' || message.length > MAX_MESSAGE_LENGTH)
        ) {
            return NextResponse.json(
                {
                    message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
                },
                { status: 400 },
            );
        }

        // --- Nodemailer Transport Configuration ---
        const transporter = nodemailer.createTransport({
            // process.env.EMAIL_SERVER_HOST reads the value from your .env.local file
            host: process.env.EMAIL_SERVER_HOST,

            // Environment variables are always strings, so we convert PORT to a number
            port: Number(process.env.EMAIL_SERVER_PORT),

            secure: process.env.EMAIL_SERVER_PORT === '465',

            auth: {
                // Reads the username/email
                user: process.env.EMAIL_SERVER_USER,

                // Reads the secret password
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        // --- Email Content ---
        const mailOptions = {
            from: `"Fazume Feedback" <${process.env.EMAIL_SERVER_USER}>`,
            to: process.env.EMAIL_TO,
            replyTo: process.env.EMAIL_FROM,
            subject: `Fazume Feedback - ${rating} Stars`, // Subject line for easy filtering
            html: `
                <div style="font-family: sans-serif; line-height: 1.6;">
                    <h2>New Feedback Received</h2>
                    <p><strong>User Email:</strong> ${userEmail}</p>
                    <p><strong>Resume ID:</strong> ${resumeID}</p>
                    <p><strong>Rating:</strong> <span style="color: #ffc107; font-size: 24px;">${'★'.repeat(
                        rating,
                    )}</span><span style="color: #e0e0e0; font-size: 24px;">${'☆'.repeat(
                5 - rating,
            )}</span></p>
                    <h3>Message:</h3>
                    <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 12px;">
                        <p>${message || '<em>No message provided.</em>'}</p>
                    </div>
                </div>
            `,
        };

        // --- Send Email ---
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Feedback sent successfully!' });
    } catch (error) {
        console.error('Failed to send feedback email:', error);
        return NextResponse.json(
            { message: 'Internal Server Error. Could not send feedback.' },
            { status: 500 },
        );
    }
}
