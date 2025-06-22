'use server';
import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { NextResponse } from 'next/server';

import { ClassicResumeTemplate } from '@/lib/pdf-templates/ClassicResume';

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
        const stream = await ReactPDF.renderToStream(
            <ClassicResumeTemplate dataResume={pdfData} />,
        );

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
