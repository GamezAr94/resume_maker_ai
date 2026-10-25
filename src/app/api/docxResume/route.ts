import { NextResponse } from 'next/server';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    TabStopType,
    TabStopPosition,
} from 'docx';
import { FormJobOfferDataStructure } from '@/utils/interfaces';

export async function buildDocxBuffer(
    dataResume: FormJobOfferDataStructure,
): Promise<Buffer> {
    const { resume_generated, job_position } = dataResume;
    const contact = resume_generated.contact_info;

    const children: Paragraph[] = [];

    // 1. Header Name & Target Title
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: contact.name || 'Candidate',
                    bold: true,
                    size: 36, // 18pt
                    font: 'Calibri',
                }),
            ],
        }),
    );

    if (job_position) {
        children.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [
                    new TextRun({
                        text: job_position,
                        bold: true,
                        size: 24, // 12pt
                        color: '2563EB',
                        font: 'Calibri',
                    }),
                ],
            }),
        );
    }

    const contactParts = [
        contact.email,
        contact.phone,
        contact.linkedin,
        contact.github,
        contact.portfolio,
    ].filter(Boolean);

    if (contactParts.length > 0) {
        children.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: contactParts.join('  |  '),
                        size: 19,
                        color: '4B5563',
                        font: 'Calibri',
                    }),
                ],
            }),
        );
    }

    // 2. Dynamic Sections
    for (const section of resume_generated.layout || []) {
        if (section.display === false) continue;

        children.push(
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 180, after: 80 },
                border: {
                    bottom: {
                        color: '2563EB',
                        space: 2,
                        style: BorderStyle.SINGLE,
                        size: 6,
                    },
                },
                children: [
                    new TextRun({
                        text: (section.title || '').toUpperCase(),
                        bold: true,
                        size: 22,
                        color: '1E293B',
                        font: 'Calibri',
                    }),
                ],
            }),
        );

        if (section.id === 'narrative') {
            children.push(
                new Paragraph({
                    spacing: { after: 120 },
                    children: [
                        new TextRun({
                            text: String(section.items || ''),
                            size: 20,
                            font: 'Calibri',
                        }),
                    ],
                }),
            );
        } else if (section.id === 'experience') {
            for (const exp of section.items) {
                if (exp.display === false) continue;
                children.push(
                    new Paragraph({
                        tabStops: [
                            {
                                type: TabStopType.RIGHT,
                                position: TabStopPosition.MAX,
                            },
                        ],
                        spacing: { before: 100, after: 40 },
                        children: [
                            new TextRun({
                                text: `${exp.title} — ${exp.company}`,
                                bold: true,
                                size: 21,
                                font: 'Calibri',
                            }),
                            new TextRun({
                                text: `\t${exp.start_end_dates || ''}`,
                                italics: true,
                                size: 19,
                                color: '4B5563',
                                font: 'Calibri',
                            }),
                        ],
                    }),
                );

                const bullets = (exp.responsabilities || '')
                    .split('\n')
                    .map((b) => b.replace(/^[-•*]\s*/, '').trim())
                    .filter(Boolean);

                for (const bullet of bullets) {
                    children.push(
                        new Paragraph({
                            bullet: { level: 0 },
                            spacing: { after: 40 },
                            children: [
                                new TextRun({
                                    text: bullet,
                                    size: 20,
                                    font: 'Calibri',
                                }),
                            ],
                        }),
                    );
                }
            }
        } else if (section.id === 'projects') {
            for (const pro of section.items) {
                if (pro.display === false) continue;
                children.push(
                    new Paragraph({
                        tabStops: [
                            {
                                type: TabStopType.RIGHT,
                                position: TabStopPosition.MAX,
                            },
                        ],
                        spacing: { before: 100, after: 40 },
                        children: [
                            new TextRun({
                                text: pro.name,
                                bold: true,
                                size: 21,
                                font: 'Calibri',
                            }),
                            new TextRun({
                                text: pro.start_end_dates
                                    ? `\t${pro.start_end_dates}`
                                    : '',
                                italics: true,
                                size: 19,
                                color: '4B5563',
                                font: 'Calibri',
                            }),
                        ],
                    }),
                );

                const bullets = (pro.description || '')
                    .split('\n')
                    .map((b) => b.replace(/^[-•*]\s*/, '').trim())
                    .filter(Boolean);

                for (const bullet of bullets) {
                    children.push(
                        new Paragraph({
                            bullet: { level: 0 },
                            spacing: { after: 40 },
                            children: [
                                new TextRun({
                                    text: bullet,
                                    size: 20,
                                    font: 'Calibri',
                                }),
                            ],
                        }),
                    );
                }
            }
        } else if (section.id === 'education') {
            for (const edu of section.items) {
                if (edu.display === false) continue;
                children.push(
                    new Paragraph({
                        tabStops: [
                            {
                                type: TabStopType.RIGHT,
                                position: TabStopPosition.MAX,
                            },
                        ],
                        spacing: { before: 80, after: 60 },
                        children: [
                            new TextRun({
                                text: `${edu.degree} | ${edu.school}`,
                                bold: true,
                                size: 20,
                                font: 'Calibri',
                            }),
                            new TextRun({
                                text: `\t${edu.start_end_dates || ''}`,
                                italics: true,
                                size: 19,
                                color: '4B5563',
                                font: 'Calibri',
                            }),
                        ],
                    }),
                );
            }
        } else if (section.id === 'skills') {
            children.push(
                new Paragraph({
                    spacing: { after: 100 },
                    children: [
                        new TextRun({
                            text: (section.items || [])
                                .filter(Boolean)
                                .join('  •  '),
                            size: 20,
                            font: 'Calibri',
                        }),
                    ],
                }),
            );
        }
    }

    const doc = new Document({
        creator: contact.name || 'Resume Maker AI',
        title: `${contact.name || 'Candidate'} - ${job_position || 'Resume'}`,
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 720, // 0.5 inch
                            right: 720,
                            bottom: 720,
                            left: 720,
                        },
                    },
                },
                children,
            },
        ],
    });

    return await Packer.toBuffer(doc);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const dataResume = body.data as FormJobOfferDataStructure;

        if (!dataResume || !dataResume.resume_generated) {
            return NextResponse.json(
                { message: 'Missing resume data' },
                { status: 400 },
            );
        }

        const buffer = await buildDocxBuffer(dataResume);

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type':
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': 'attachment; filename="resume.docx"',
            },
        });
    } catch (error) {
        console.error('Error generating DOCX:', error);
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to generate DOCX',
            },
            { status: 500 },
        );
    }
}
