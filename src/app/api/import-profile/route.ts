import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { getUserProfile, saveSectionRecord } from "@/lib/db";
import { SectionTypes } from "@/utils/enums";

function fixUrl(url?: string): string {
    if (!url) return "";
    const clean = url.trim();
    if (clean.length === 0) return "";
    if (!/^https?:\/\//i.test(clean)) {
        return `https://${clean}`;
    }
    return clean;
}

function sanitizeDate(dateStr?: string | null): string | null {
    if (!dateStr) return null;
    const clean = dateStr.trim().toLowerCase();
    if (
        clean === "null" ||
        clean === "present" ||
        clean === "current" ||
        clean === ""
    ) {
        return null;
    }
    return dateStr;
}

export async function POST(req: Request) {
    const { text } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ message: "API Config Error" }), {
            status: 500,
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: `
            Analyze the following input text. It may be a full resume OR a partial update (e.g., just a single project description, or a new job).
            Your job is to extract data from raw text into a structured JSON format.

            ⭐⭐ CRITICAL RULES ⭐⭐
            1. ONLY extract information that is explicitly present in the text.
            2. DATES: ALWAYS convert to YYYY-MM-DD (e.g. "May 2020" -> "2020-05-01").
               - IF no start date is defined then use today's date
               - IF no end date is defined then use the 'is_current' set to 'true'
            3. CURRENT ROLES: If a job is "Present" or "Current", set is_current=true and end_date=null.
            4. EXPERIENCE:
               - Separate 'responsibilities' (routine tasks) from 'achievements' (wins, metrics, impact).
               - 'summary': A 1-sentence overview of the role.
               - 'skills_used': Extract specific tools/languages mentioned in this role block.
            5. PROJECTS:
               - 'problem_solved': What did the project do?
               - 'key_features': List specific functionality.
               - 'tech_stack': List tools used.
            6. EXPERIENCE vs PROJECTS: Use your best judgment. If it describes a software product the user built, put it in 'projects'. If it describes a role at a company, put it in 'experience'.
            7. IMPORTANT! DO NOT invent or hallucinate missing sections. If the text only contains a specific section ONLY for example "project", return empty arrays for the rest of sections.
            `,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        personal_info: {
                            type: SchemaType.OBJECT,
                            properties: {
                                first_name: { type: SchemaType.STRING },
                                last_name: { type: SchemaType.STRING },
                                email: { type: SchemaType.STRING },
                                phone: { type: SchemaType.STRING },
                                linkedin_url: { type: SchemaType.STRING },
                                github_url: { type: SchemaType.STRING },
                                portfolio_url: { type: SchemaType.STRING },
                            },
                        },
                        experience: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    company_name: { type: SchemaType.STRING },
                                    job_title: { type: SchemaType.STRING },
                                    start_date: { type: SchemaType.STRING },
                                    end_date: { type: SchemaType.STRING },
                                    is_current: { type: SchemaType.BOOLEAN },
                                    details: {
                                        type: SchemaType.OBJECT,
                                        properties: {
                                            summary: { type: SchemaType.STRING },
                                            responsibilities: {
                                                type: SchemaType.ARRAY,
                                                items: { type: SchemaType.STRING },
                                            },
                                            achievements: {
                                                type: SchemaType.ARRAY,
                                                items: { type: SchemaType.STRING },
                                            },
                                            skills_used: {
                                                type: SchemaType.ARRAY,
                                                items: { type: SchemaType.STRING },
                                            },
                                        },
                                        required: ["summary", "responsibilities", "achievements"],
                                    },
                                },
                                required: ["company_name", "job_title", "start_date", "details"],
                            },
                        },
                        education: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    school_name: { type: SchemaType.STRING },
                                    degree: { type: SchemaType.STRING },
                                    field_of_study: { type: SchemaType.STRING },
                                    start_date: { type: SchemaType.STRING },
                                    end_date: { type: SchemaType.STRING },
                                    is_current: { type: SchemaType.BOOLEAN },
                                },
                                required: ["school_name", "degree"],
                            },
                        },
                        skills: {
                            type: SchemaType.ARRAY,
                            items: { type: SchemaType.STRING },
                        },
                        projects: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    project_name: { type: SchemaType.STRING },
                                    details: {
                                        type: SchemaType.OBJECT,
                                        properties: {
                                            problem_solved: { type: SchemaType.STRING },
                                            key_features: {
                                                type: SchemaType.ARRAY,
                                                items: { type: SchemaType.STRING },
                                            },
                                            tech_stack: {
                                                type: SchemaType.ARRAY,
                                                items: { type: SchemaType.STRING },
                                            },
                                            url: { type: SchemaType.STRING },
                                        },
                                        required: ["problem_solved", "tech_stack"],
                                    },
                                },
                                required: ["project_name", "details"],
                            },
                        },
                    },
                },
            },
        });

        const prompt = `Here is the resume text to process:\n${text}`;
        const result = await model.generateContent(prompt);
        const extraction = JSON.parse(result.response.text());

        // A. Update Personal Info
        if (extraction.personal_info) {
            const current = getUserProfile();
            saveSectionRecord(SectionTypes.Personal, {
                first_name: extraction.personal_info.first_name || current.first_name || "",
                last_name: extraction.personal_info.last_name || current.last_name || "",
                email: extraction.personal_info.email || current.email || "",
                phone: extraction.personal_info.phone || current.phone || "",
                linkedin_url: fixUrl(extraction.personal_info.linkedin_url) || current.linkedin_url || "",
                github_url: fixUrl(extraction.personal_info.github_url) || current.github_url || "",
                portfolio_url: fixUrl(extraction.personal_info.portfolio_url) || current.portfolio_url || "",
                other_url: current.other_url || "",
            });
        }

        // B. Insert Experience
        if (Array.isArray(extraction.experience)) {
            for (const item of extraction.experience) {
                saveSectionRecord(SectionTypes.Experience, {
                    company_name: item.company_name?.substring(0, 70) || "Company",
                    job_title: item.job_title?.substring(0, 90) || "Role",
                    start_date: sanitizeDate(item.start_date) || new Date().toISOString().split("T")[0],
                    end_date: sanitizeDate(item.end_date),
                    is_current: Boolean(item.is_current),
                    details: item.details || {},
                });
            }
        }

        // C. Insert Education
        if (Array.isArray(extraction.education)) {
            for (const item of extraction.education) {
                saveSectionRecord(SectionTypes.Education, {
                    school_name: item.school_name?.substring(0, 60) || "School",
                    degree: item.degree?.substring(0, 60) || "Degree",
                    field_of_study: item.field_of_study?.substring(0, 60) || "General",
                    start_date: sanitizeDate(item.start_date) || new Date().toISOString().split("T")[0],
                    end_date: sanitizeDate(item.end_date),
                    is_current: Boolean(item.is_current),
                });
            }
        }

        // D. Insert Skills
        if (Array.isArray(extraction.skills)) {
            for (const skillName of extraction.skills) {
                if (skillName) {
                    saveSectionRecord(SectionTypes.Skill, {
                        skill_name: String(skillName).substring(0, 20),
                        skill_level: "2",
                    });
                }
            }
        }

        // E. Insert Projects
        if (Array.isArray(extraction.projects)) {
            for (const item of extraction.projects) {
                if (item.details?.url) {
                    item.details.url = fixUrl(item.details.url);
                }
                saveSectionRecord(SectionTypes.Project, {
                    project_name: item.project_name?.substring(0, 90) || "Project",
                    details: item.details || {},
                });
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Gemini Import Error:", error);
        return new Response(
            JSON.stringify({
                message: "Failed to process resume data.",
                error: error instanceof Error ? error.message : String(error),
            }),
            { status: 500 },
        );
    }
}
