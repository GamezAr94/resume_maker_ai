import { getAllProfileSections } from "@/lib/db";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: Request) {
    const requestJobDescBody = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set.");
        return new Response(
            JSON.stringify({
                message: "API configuration error. Please set GEMINI_API_KEY.",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    const fullVault = getAllProfileSections();
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // ============================================================================
        // STAGE 1: THE SCOUT (Fast Retrieval & JD Keyword Extraction)
        // Builds a lightweight index so the AI can cherry-pick the best projects/jobs
        // without drowning in a wall of text.
        // ============================================================================
        const lightweightIndex = {
            experiences: fullVault.experienceInfo.map((exp) => ({
                id: exp.id,
                job_title: exp.job_title,
                company_name: exp.company_name,
                start_date: exp.start_date,
                end_date: exp.is_current ? "Present" : exp.end_date,
                summary: exp.details?.summary || "",
                skills_used: exp.details?.skills_used || [],
                linked_project_names: (exp.linked_projects || []).map((p) => p.project_name),
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
            model: "gemini-flash-latest",
            systemInstruction: `
You are an expert technical recruiter and career strategist.
Analyze the Target Job Offer and the Candidate's Lightweight Career Index.
Your job is to:
1. Define the "coreNarrativeAngle" (the single strongest engineering identity for this specific job).
2. Extract the most important ATS "targetKeywords" from the job description.
3. Select up to 4 "selectedExperienceIds" and up to 5 "selectedProjectIds" from the candidate's index that provide the strongest proof for this specific job offer.
`,
            generationConfig: {
                temperature: 0.2,
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
${JSON.stringify(requestJobDescBody)}

Candidate Career Index:
${JSON.stringify(lightweightIndex)}
`;
        const scoutResult = await scoutModel.generateContent(scoutPrompt);
        const scoutPlan = JSON.parse(scoutResult.response.text());

        // Filter the full vault down to the winning experiences and projects
        // (Fallback to all if the user has very few items or IDs didn't match)
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

        // ============================================================================
        // STAGE 2: THE MASTER RESUME WRITER (Deep Synthesis & Bullet Reframing)
        // ============================================================================
        const writerModel = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: `
You are a world-class AI-powered career counselor and master technical resume writer.

⭐ GOLDEN RULES ⭐
1. **NEVER INVENT DATA:** You are strictly prohibited from inventing companies, projects, metrics, or skills not present in the user's profile.
2. **DATES:** Always format dates as 'MMM YYYY' (e.g., 'Jul 2023' or 'Jul 2023 - Present'). Skip the day.
3. **HOW TO USE THE 4-PILLAR STAR DATA & LINKED PROJECTS:**
   * Work Experiences contain 'details.summary', 'details.responsibilities', 'details.achievements', 'details.skills_used', AND 'linked_projects' (projects the candidate built while working at that specific company).
   * Projects contain 'details.my_role', 'details.problem_solved', 'details.key_features' (technical actions), 'details.impact_metrics' (quantifiable wins), 'details.tech_stack', and 'company_name'/'school_name'.
   * You may use 'linked_projects' to craft high-impact, metric-driven bullet points under their parent Work Experience entry, AND/OR feature top standalone/work projects in the 'projects' section!
4. **BULLET POINT FORMULA:**
   * Align every bullet with the provided 'strategicPlan.coreNarrativeAngle' and naturally weave in 'strategicPlan.priorityAtsKeywords' where truthful.
   * Priority #1: [Action Verb] + [Technical Action / Feature Built] + [using Specific Tech Stack] + [to achieve Quantifiable Impact/Metric].
   * Format 'responsabilities' (in experience) and 'description' (in projects) as newline-separated bullet strings (e.g. "- Built X...\\n- Reduced Y...").
`,
        });

        const generationConfig = {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 4000,
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    keywords: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING },
                    },
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
                required: ["keywords", "feedback", "layout"],
            },
        };

        const writerPrompt = `
Curated Candidate Profile & Strategic Plan:
${JSON.stringify(curatedProfileData)}

Target Job Offer:
${JSON.stringify(requestJobDescBody)}
`;

        const chatSession = writerModel.startChat({
            generationConfig,
            history: [],
        });

        const result = await chatSession.sendMessage(writerPrompt);

        return new Response(
            JSON.stringify({
                message: result.response.text(),
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    } catch (error) {
        console.error("Critical Error during resume generation:", error);
        return new Response(
            JSON.stringify({
                message:
                    "An unexpected error occurred while generating the resume. Please try again later.",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
