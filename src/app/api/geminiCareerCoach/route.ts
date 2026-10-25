import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import {
    getAllProfileSections,
    getApplicationById,
    saveSectionRecord,
} from "@/lib/db";
import { SectionTypes } from "@/utils/enums";
import { AI_CONFIG } from "@/app/config/ai.config";
import { generateNetworkingLinks } from "@/utils/utils";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { applicationId } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { message: "GEMINI_API_KEY is not configured on the server." },
                { status: 500 },
            );
        }

        if (!applicationId) {
            return NextResponse.json(
                { message: "applicationId is required." },
                { status: 400 },
            );
        }

        const appRecord = getApplicationById(applicationId) as Record<
            string,
            unknown
        > | null;
        if (!appRecord) {
            return NextResponse.json(
                { message: `Application #${applicationId} not found in database.` },
                { status: 404 },
            );
        }

        const fullVault = getAllProfileSections();
        const genAI = new GoogleGenerativeAI(apiKey);

        const coachModel = genAI.getGenerativeModel({
            model: AI_CONFIG.models.careerCoach,
            systemInstruction: `
You are an elite Engineering Hiring Manager, Executive Career Coach, and Technical Recruiter.
Analyze the Candidate's Master Profile, their Generated Resume, and the Target Job Description.

Your task is to generate two high-value coaching assets:
1. **feedback**:
   - **candidateFit**: Honest numerical score (0-100) and a sharp 2-sentence executive summary explaining why they match and what their #1 edge or gap is.
   - **masterProfileSuggestions**: 2-3 specific, actionable improvements the candidate should add to their Master Profile vault to score even higher for roles like this.
   - **interviewPrep**:
     - **companyFocus**: Specific strategic advice on what this company cares about based on the job description.
     - **technicalTopics**: 4-5 concrete technical interview topics or system design questions the candidate should prepare for, referencing their actual projects where applicable.

2. **outreachMessages**:
   - Write 4 copy-pasteable outreach messages tailored to THIS exact company, role, and the candidate's REAL projects/metrics.
   - **CRITICAL:** DO NOT leave generic placeholders like "[mention a skill]" or "[your metric]". Fill in the candidate's ACTUAL top skills and quantified achievements from their profile! Only use "[Name]" for the recipient's first name.
   - **recruiterConnectionNote** MUST be under 280 characters (fits LinkedIn's free connection note limit).
   - **hiringManagerNote** MUST be under 280 characters (fits LinkedIn's free connection note limit).
   - **teammateNote** MUST be under 280 characters (fits LinkedIn's free connection note limit).
   - **recruiterFullMessage** can be 4-6 sentences (for LinkedIn InMail or cold email).

   FORMATTING RULE FOR OUTREACH MESSAGES:
   You MUST use explicit newline characters (\n\n) to format the messages with proper spacing. 
   Always separate the greeting, the main body paragraphs, and the sign-off with \n\n.
   
   Example of expected output format:
   "Hi [Name],\n\nI am reaching out regarding the Shopify Developer role.\n\nBest,\n[My Name]"
`,
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        feedback: {
                            type: SchemaType.OBJECT,
                            properties: {
                                candidateFit: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        score: { type: SchemaType.INTEGER },
                                        summary: { type: SchemaType.STRING },
                                    },
                                    required: ["score", "summary"],
                                },
                                masterProfileSuggestions: {
                                    type: SchemaType.ARRAY,
                                    items: {
                                        type: SchemaType.OBJECT,
                                        properties: {
                                            suggestion: { type: SchemaType.STRING },
                                            example: { type: SchemaType.STRING },
                                        },
                                        required: ["suggestion"],
                                    },
                                },
                                interviewPrep: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        companyFocus: { type: SchemaType.STRING },
                                        technicalTopics: {
                                            type: SchemaType.ARRAY,
                                            items: { type: SchemaType.STRING },
                                        },
                                    },
                                    required: ["companyFocus", "technicalTopics"],
                                },
                            },
                            required: [
                                "candidateFit",
                                "masterProfileSuggestions",
                                "interviewPrep",
                            ],
                        },
                        outreachMessages: {
                            type: SchemaType.OBJECT,
                            properties: {
                                recruiterConnectionNote: { type: SchemaType.STRING },
                                recruiterFullMessage: { type: SchemaType.STRING },
                                hiringManagerNote: { type: SchemaType.STRING },
                                teammateNote: { type: SchemaType.STRING },
                            },
                            required: [
                                "recruiterConnectionNote",
                                "recruiterFullMessage",
                                "hiringManagerNote",
                                "teammateNote",
                            ],
                        },
                    },
                    required: ["feedback", "outreachMessages"],
                },
            },
        });

        const prompt = `
Target Company: ${appRecord.company_name}
Target Job Position: ${appRecord.job_position}
Target Job Description:
${appRecord.job_description}

Candidate Master Profile Summary:
${JSON.stringify({
    userInfo: fullVault.userInfo,
    experiences: fullVault.experienceInfo,
    projects: fullVault.projectInfo,
    skills: fullVault.skillInfo,
})}

Generated Resume Layout:
${JSON.stringify(appRecord.resume_generated)}
`;

        const result = await coachModel.generateContent(prompt);
        const generatedCoachData = JSON.parse(result.response.text());

        const companyName = String(appRecord.company_name || "Company");
        const jobPosition = String(appRecord.job_position || "Role");
        const networkingLinks = generateNetworkingLinks(companyName, jobPosition);

        const existingResume =
            (appRecord.resume_generated as Record<string, unknown>) || {};
        const updatedResumeGenerated = {
            ...existingResume,
            feedback: generatedCoachData.feedback,
            outreachMessages: generatedCoachData.outreachMessages,
            networkingLinks,
        };

        // Auto-save directly into SQLite so the user never loses it!
        saveSectionRecord(SectionTypes.JobOffer, {
            id: Number(applicationId),
            company_name: companyName,
            job_position: jobPosition,
            job_description: String(appRecord.job_description || ""),
            resume_generated: updatedResumeGenerated,
        });

        return NextResponse.json(
            {
                feedback: generatedCoachData.feedback,
                outreachMessages: generatedCoachData.outreachMessages,
                networkingLinks,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error in geminiCareerCoach:", error);
        const errMsg =
            error instanceof Error ? error.message : "Unexpected AI error";
        return NextResponse.json(
            {
                message: `Failed to generate AI Feedback & Networking: ${errMsg}`,
                details: errMsg,
            },
            { status: 500 },
        );
    }
}
