import { getAllProfileSections } from "@/lib/db";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AI_CONFIG } from "@/app/config/ai.config";

export const maxDuration = 60;

// Helper exported so /api/v1/tailor can also call it directly
export async function runScoutStage(
    apiKey: string,
    jobOfferData: Record<string, unknown>,
    fullVault: ReturnType<typeof getAllProfileSections>,
) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const lightweightIndex = {
        experiences: fullVault.experienceInfo.map((exp) => ({
            id: exp.id,
            job_title: exp.job_title,
            company_name: exp.company_name,
            start_date: exp.start_date,
            end_date: exp.is_current ? "Present" : exp.end_date,
            summary: exp.details?.summary || "",
            skills_used: exp.details?.skills_used || [],
            linked_project_names: (exp.linked_projects || []).map(
                (p) => p.project_name,
            ),
        })),
        projects: fullVault.projectInfo.map((proj) => ({
            id: proj.id,
            project_name: proj.project_name,
            my_role: proj.details?.my_role || "",
            built_at_company: proj.company_name || null,
            built_at_school: proj.school_name || null,
            problem_solved: proj.details?.problem_solved || "",
            tech_stack: proj.details?.tech_stack || [],
            keywords: proj.details?.keywords || [],
        })),
    };

    const scoutModel = genAI.getGenerativeModel({
        model: AI_CONFIG.models.scout,
        systemInstruction: `
You are an expert technical recruiter and career strategist.
Analyze the Target Job Offer and the Candidate's Lightweight Career Index.
Your job is to:
1. Define the "coreNarrativeAngle" (the single strongest engineering identity for this specific job).
2. Extract the 10-15 most important ATS "targetKeywords" from the job description.
3. Select up to 3 "selectedExperienceIds" and up to 3 "selectedProjectIds" from the candidate's index that provide the strongest proof for this specific job offer.
`,
        generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    coreNarrativeAngle: { type: SchemaType.STRING },
                    targetKeywords: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING },
                    },
                    selectedExperienceIds: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING },
                    },
                    selectedProjectIds: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING },
                    },
                },
                required: [
                    "coreNarrativeAngle",
                    "targetKeywords",
                    "selectedExperienceIds",
                    "selectedProjectIds",
                ],
            },
        },
    });

    const scoutPrompt = `
Target Job Offer:
${JSON.stringify(jobOfferData)}

Candidate Career Index:
${JSON.stringify(lightweightIndex)}
`;
    const scoutResult = await scoutModel.generateContent(scoutPrompt);
    return JSON.parse(scoutResult.response.text());
}

export async function runWriterStage(
    apiKey: string,
    jobOfferData: Record<string, unknown>,
    scoutPlan: {
        coreNarrativeAngle: string;
        targetKeywords: string[];
        selectedExperienceIds: string[];
        selectedProjectIds: string[];
    },
    fullVault: ReturnType<typeof getAllProfileSections>,
) {
    const genAI = new GoogleGenerativeAI(apiKey);

    const filteredExperiences = fullVault.experienceInfo.filter((e) =>
        scoutPlan.selectedExperienceIds?.includes(String(e.id)),
    );
    const filteredProjects = fullVault.projectInfo.filter((p) =>
        scoutPlan.selectedProjectIds?.includes(String(p.id)),
    );

    const curatedProfileData = {
        userInfo: fullVault.userInfo,
        strategicPlan: {
            coreNarrativeAngle: scoutPlan.coreNarrativeAngle,
            priorityAtsKeywords: scoutPlan.targetKeywords,
        },
        experienceInfo:
            filteredExperiences.length > 0
                ? filteredExperiences
                : fullVault.experienceInfo,
        projectInfo:
            filteredProjects.length > 0
                ? filteredProjects
                : fullVault.projectInfo,
        educationInfo: fullVault.educationInfo,
        skillInfo: fullVault.skillInfo,
    };

    const writerModel = genAI.getGenerativeModel({
        model: AI_CONFIG.models.writer,
        systemInstruction: `
You are a world-class AI-powered technical resume writer.

⭐ GOLDEN RULES ⭐
1. **NEVER INVENT DATA:** Never invent companies, projects, metrics, or skills not present in the candidate's profile.
2. **DATES:** Format all dates as 'MMM YYYY' (e.g., 'Jul 2023' or 'Jul 2023 - Present').
3. **HOW TO USE THE 4-PILLAR STAR DATA & LINKED PROJECTS:**
   * Work Experiences contain 'details.summary', 'details.responsibilities', 'details.achievements', 'details.skills_used', AND 'linked_projects' (projects built at that company).
   * Projects contain 'details.my_role', 'details.problem_solved', 'details.key_features', 'details.impact_metrics', 'details.tech_stack', and 'company_name'/'school_name'.
   * Use 'linked_projects' to craft high-impact, metric-driven bullet points under their parent Work Experience entry, AND/OR feature top standalone/work projects in the 'projects' section!
4. **BULLET POINT FORMULA:**
   * Align every bullet with 'strategicPlan.coreNarrativeAngle' and naturally weave in 'strategicPlan.priorityAtsKeywords' where truthful.
   * Priority #1: [Action Verb] + [Technical Action / Feature Built] + [using Specific Tech Stack] + [to achieve Quantifiable Impact/Metric].
   * Format 'responsabilities' (in experience) and 'description' (in projects) as newline-separated bullet strings (e.g. "- Architected X...\\n- Reduced Y by 40%...").
`,
        generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            //maxOutputTokens: 3500,
	    maxOutputTokens: 6192,
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    keywords: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING },
                    },
                    layout: {
                        type: SchemaType.OBJECT,
                        properties: {
                            narrative: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    title: { type: SchemaType.STRING },
                                    display: { type: SchemaType.BOOLEAN },
                                    items: { type: SchemaType.STRING },
                                },
                                required: ["display", "items"],
                            },
                            experience: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    title: { type: SchemaType.STRING },
                                    display: { type: SchemaType.BOOLEAN },
                                    items: {
                                        type: SchemaType.ARRAY,
                                        items: {
                                            type: SchemaType.OBJECT,
                                            properties: {
                                                company: { type: SchemaType.STRING },
                                                display: { type: SchemaType.BOOLEAN },
                                                start_end_dates: { type: SchemaType.STRING },
                                                title: { type: SchemaType.STRING },
                                                responsabilities: { type: SchemaType.STRING },
                                            },
                                            required: [
                                                "company",
                                                "display",
                                                "start_end_dates",
                                                "title",
                                                "responsabilities",
                                            ],
                                        },
                                    },
                                },
                                required: ["display", "items"],
                            },
                            education: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    title: { type: SchemaType.STRING },
                                    display: { type: SchemaType.BOOLEAN },
                                    items: {
                                        type: SchemaType.ARRAY,
                                        items: {
                                            type: SchemaType.OBJECT,
                                            properties: {
                                                degree: { type: SchemaType.STRING },
                                                school: { type: SchemaType.STRING },
                                                start_end_dates: { type: SchemaType.STRING },
                                                display: { type: SchemaType.BOOLEAN },
                                            },
                                            required: ["degree", "school", "display"],
                                        },
                                    },
                                },
                                required: ["display", "items"],
                            },
                            skills: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    title: { type: SchemaType.STRING },
                                    display: { type: SchemaType.BOOLEAN },
                                    items: {
                                        type: SchemaType.ARRAY,
                                        items: { type: SchemaType.STRING },
                                    },
                                },
                                required: ["display", "items"],
                            },
                            projects: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    title: { type: SchemaType.STRING },
                                    display: { type: SchemaType.BOOLEAN },
                                    items: {
                                        type: SchemaType.ARRAY,
                                        items: {
                                            type: SchemaType.OBJECT,
                                            properties: {
                                                name: { type: SchemaType.STRING },
                                                description: { type: SchemaType.STRING },
                                                display: { type: SchemaType.BOOLEAN },
                                                start_end_dates: { type: SchemaType.STRING },
                                            },
                                            required: [
                                                "name",
                                                "description",
                                                "display",
                                                "start_end_dates",
                                            ],
                                        },
                                    },
                                },
                                required: ["display", "items"],
                            },
                        },
                        required: [
                            "narrative",
                            "experience",
                            "education",
                            "skills",
                            "projects",
                        ],
                    },
                },
                required: ["keywords", "layout"],
            },
        },
    });

    const writerPrompt = `
Curated Candidate Profile & Strategic Plan:
${JSON.stringify(curatedProfileData)}

Target Job Offer:
${JSON.stringify(jobOfferData)}
`;

    const result = await writerModel.generateContent(writerPrompt);
    return JSON.parse(result.response.text());
}

export async function POST(req: Request) {
    const body = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return new Response(
            JSON.stringify({
                message: "GEMINI_API_KEY is missing in your .env configuration.",
                failedStep: "config",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }

    const fullVault = getAllProfileSections();
    const step = body.step || "all";
    const jobData = body.data || body;

    try {
        // Step 1 only: Fast Scout
        if (step === "scout") {
            const scoutPlan = await runScoutStage(apiKey, jobData, fullVault);
            return new Response(JSON.stringify({ scoutPlan }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Step 2 only: Deep Writer using Scout Plan
        if (step === "writer") {
            const scoutPlan = body.scoutPlan;
            const resumeJson = await runWriterStage(
                apiKey,
                jobData,
                scoutPlan,
                fullVault,
            );
            return new Response(
                JSON.stringify({ message: JSON.stringify(resumeJson) }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        }

        // Fallback: Run both stages sequentially
        const scoutPlan = await runScoutStage(apiKey, jobData, fullVault);
        const resumeJson = await runWriterStage(
            apiKey,
            jobData,
            scoutPlan,
            fullVault,
        );

        return new Response(
            JSON.stringify({
                message: JSON.stringify(resumeJson),
                scoutPlan,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (error) {
        console.error(`Error during resume generation (step=${step}):`, error);
        const errMsg =
            error instanceof Error ? error.message : "Unknown AI error occurred.";
        return new Response(
            JSON.stringify({
                message: `AI Generation Failed during [${step.toUpperCase()}]: ${errMsg}`,
                failedStep: step,
                details: errMsg,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
}
