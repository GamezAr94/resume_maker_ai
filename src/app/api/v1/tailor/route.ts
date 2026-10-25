import { NextResponse } from 'next/server';
import { getAllProfileSections, saveSectionRecord } from '@/lib/db';
import { SectionTypes } from '@/utils/enums';
import {
    runScoutStage,
    runWriterStage,
} from '@/app/api/geminiResumeInteraction/route';
import {
    ensureLayoutIsOrderedArray,
    generateNetworkingLinks,
} from '@/utils/utils';
import {
    GeminiResponse,
    ResumeLayoutItem,
    FormJobOfferDataStructure,
    ResumeThemeId,
} from '@/utils/interfaces';
import { renderToStream } from '@react-pdf/renderer';
import { renderResumeTemplate } from '@/lib/pdf-templates/skinRegistry';
import { buildDocxBuffer } from '@/app/api/docxResume/route';

export const maxDuration = 60;

export async function POST(req: Request) {
    const startTime = Date.now();
    let currentStage = 'initialization';

    try {
        // Optional API Key Security Check if HOMELAB_API_KEY is set in .env
        const expectedApiKey = process.env.HOMELAB_API_KEY;
        if (expectedApiKey) {
            const authHeader =
                req.headers.get('x-api-key') ||
                req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
            if (authHeader !== expectedApiKey) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Unauthorized: Invalid or missing X-API-Key header.',
                    },
                    { status: 401 },
                );
            }
        }

        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            return NextResponse.json(
                {
                    success: false,
                    failedStage: 'config',
                    error: 'GEMINI_API_KEY is not configured on the server.',
                },
                { status: 500 },
            );
        }

        const body = await req.json();
        const company_name = String(body.company_name || '').trim();
        const job_position = String(body.job_position || '').trim();
        const job_description = String(body.job_description || '').trim();
        const theme: ResumeThemeId = body.theme || 'modern';
        const outputFormat: 'json' | 'pdf' | 'docx' =
            body.output || 'json';

        if (!company_name || !job_position || job_description.length < 30) {
            return NextResponse.json(
                {
                    success: false,
                    failedStage: 'validation',
                    error: 'company_name, job_position, and job_description (min 30 chars) are required.',
                },
                { status: 400 },
            );
        }

        currentStage = 'fetching_profile_from_sqlite';
        const fullVault = getAllProfileSections();
        if (
            fullVault.experienceInfo.length === 0 &&
            fullVault.projectInfo.length === 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    failedStage: currentStage,
                    error: 'Master Profile is empty in SQLite. Please add experiences or projects first.',
                },
                { status: 400 },
            );
        }

        const jobPayload = { company_name, job_position, job_description };

        // Stage 1: AI Scout
        currentStage = 'stage_1_ai_scout';
        const scoutPlan = await runScoutStage(geminiKey, jobPayload, fullVault);

        // Stage 2: AI Writer
	// Stage 2: AI Writer
        currentStage = 'stage_2_ai_writer';
        const rawResumeJson = await runWriterStage(
            geminiKey,
            jobPayload,
            scoutPlan,
            fullVault,
        );

        // Normalize Layout & Contact Info
        currentStage = 'normalizing_and_saving_to_sqlite';
        const desiredSectionsOrder = {
            narrative: 0,
            experience: 1,
            projects: 2,
            education: 3,
            skills: 4,
        };
        const orderedLayout = ensureLayoutIsOrderedArray(
            rawResumeJson.layout,
            desiredSectionsOrder,
            'id',
        );
        const networkingLinks = generateNetworkingLinks(
            company_name,
            job_position,
        );

        const user = fullVault.userInfo;
	const fullResumeGenerated: GeminiResponse = {
            layout: orderedLayout as ResumeLayoutItem[],
            keywords: rawResumeJson.keywords || scoutPlan.targetKeywords || [],
            networkingLinks,
            feedback: null,
            outreachMessages: null,
            contact_info: {
                name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                email: String(user.email || ''),
                phone: String(user.phone || ''),
                linkedin: String(user.linkedin_url || ''),
                github: String(user.github_url || ''),
                portfolio: String(user.portfolio_url || ''),
            },
            styles: {
                theme,
                fontSize: body.fontSize || 'medium',
                lineSpacing: body.lineSpacing || 'normal',
                pageMargin: body.pageMargin || 'normal',
            },
        };

        const savedId = saveSectionRecord(SectionTypes.JobOffer, {
            company_name,
            job_position,
            job_description,
            resume_generated: fullResumeGenerated,
        });

        const completeRecord: FormJobOfferDataStructure = {
            id: savedId,
            company_name,
            job_position,
            job_description,
            created_at: new Date().toISOString(),
            was_downloaded: false,
            resume_generated: fullResumeGenerated,
        };

        // If n8n requested the binary PDF directly
        if (outputFormat === 'pdf') {
            currentStage = 'rendering_pdf';
            const docElement = renderResumeTemplate(completeRecord);
            const stream = await renderToStream(docElement);
            return new NextResponse(stream as unknown as ReadableStream, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'X-Application-Id': String(savedId),
                    'Content-Disposition': `attachment; filename="Resume_${company_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
                },
            });
        }

        // If n8n requested the binary Word .docx directly
        if (outputFormat === 'docx') {
            currentStage = 'rendering_docx';
            const buffer = await buildDocxBuffer(completeRecord);
            return new NextResponse(new Uint8Array(buffer), {
                status: 200,
                headers: {
                    'Content-Type':
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'X-Application-Id': String(savedId),
                    'Content-Disposition': `attachment; filename="Resume_${company_name.replace(/[^a-zA-Z0-9]/g, '_')}.docx"`,
                },
            });
        }

        // Default: Return rich JSON response for n8n / webhooks
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';

        return NextResponse.json(
            {
                success: true,
                applicationId: savedId,
                durationMs: Date.now() - startTime,
                editorUrl: `${protocol}://${host}/resume/${savedId}`,
                strategicPlan: scoutPlan,
                networkingLinks,
                resume: fullResumeGenerated,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(`[/api/v1/tailor] Failed at stage ${currentStage}:`, error);
        const errMsg =
            error instanceof Error ? error.message : 'Unexpected server error';
        return NextResponse.json(
            {
                success: false,
                failedStage: currentStage,
                durationMs: Date.now() - startTime,
                error: `Resume generation failed during [${currentStage}]: ${errMsg}`,
            },
            { status: 500 },
        );
    }
}
