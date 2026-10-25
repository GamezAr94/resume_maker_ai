import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { renderResumeTemplate } from '@/lib/pdf-templates/skinRegistry';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const dataResume = body.data;

        if (!dataResume || !dataResume.resume_generated) {
            return NextResponse.json(
                { message: 'Missing resume data' },
                { status: 400 },
            );
        }

        const documentElement = renderResumeTemplate(dataResume);
        const stream = await renderToStream(documentElement);

        return new NextResponse(stream as unknown as ReadableStream, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="resume.pdf"',
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to generate PDF',
            },
            { status: 500 },
        );
    }
}
