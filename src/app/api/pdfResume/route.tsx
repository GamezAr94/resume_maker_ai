'use server';
import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { NextResponse } from 'next/server';

import { ClassicResumeTemplate } from '@/lib/pdf-templates/ClassicResume';
import { ModernResumeTemplate } from '@/lib/pdf-templates/ModernResume';
import { MinimalistResumeTemplate } from '@/lib/pdf-templates/MinimalistResume';

export async function POST(req: Request) {
    const requestBody = await req.json();
    const pdfData = requestBody.data;

    // verify that the data is not empty
    if (!pdfData) {
        return NextResponse.json(
            {
                message: 'PDF Resume Handler POST: Missing data',
            },
            { status: 400 },
        );
    }

    try {
        let resumeTemplate;
        // Logic to select the correct template component based on the theme
        switch (pdfData.resume_generated.styles.theme) {
            case 'classic':
                resumeTemplate = <ClassicResumeTemplate dataResume={pdfData} />;
                break;
            case 'minimalist':
                resumeTemplate = (
                    <MinimalistResumeTemplate dataResume={pdfData} />
                );
                break;
            case 'modern':
            default:
                resumeTemplate = <ModernResumeTemplate dataResume={pdfData} />;
        }

        const stream = await ReactPDF.renderToStream(resumeTemplate);

        return new NextResponse(stream as unknown as ReadableStream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=resume.pdf', // Trigger download
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { message: 'Error generating PDF' },
            { status: 500 },
        );
    }
}
