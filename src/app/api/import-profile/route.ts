import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Helper to ensure URLs pass Zod validation
function fixUrl(url?: string): string {
    if (!url) return "";
    const clean = url.trim();
    if (clean.length === 0) return "";
    if (!/^https?:\/\//i.test(clean)) {
        return `https://${clean}`;
    }
    return clean;
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return new Response(JSON.stringify({ message: "Not authenticated" }), {
            status: 401,
        });
    }

    const { text } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ message: "API Config Error" }), {
            status: 500,
        });
    }

    const { data: userData, error: userError } = await supabase
        .from("user")
        .select("id")
        .eq("supabase_id", user.id)
        .single();

    if (userError || !userData) {
        return new Response(
            JSON.stringify({ message: "User profile not found" }),
            { status: 404 },
        );
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            // 🆕 1. SYSTEM INSTRUCTIONS: The "Contract"
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
                                    start_date: {
                                        type: SchemaType.STRING,
                                        description: "Format YYYY-MM-DD",
                                    },
                                    end_date: {
                                        type: SchemaType.STRING,
                                        description:
                                            "Format YYYY-MM-DD or null if current",
                                    },
                                    is_current: { type: SchemaType.BOOLEAN },
                                    details: {
                                        type: SchemaType.OBJECT,
                                        properties: {
                                            summary: {
                                                type: SchemaType.STRING,
                                            },
                                            responsibilities: {
                                                type: SchemaType.ARRAY,
                                                items: {
                                                    type: SchemaType.STRING,
                                                },
                                            },
                                            achievements: {
                                                type: SchemaType.ARRAY,
                                                items: {
                                                    type: SchemaType.STRING,
                                                },
                                            },
                                            skills_used: {
                                                type: SchemaType.ARRAY,
                                                items: {
                                                    type: SchemaType.STRING,
                                                },
                                            },
                                        },
                                        required: [
                                            "summary",
                                            "responsibilities",
                                            "achievements",
                                        ],
                                    },
                                },
                                required: [
                                    "company_name",
                                    "job_title",
                                    "start_date",
                                    "details",
                                ],
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
                                    start_date: {
                                        type: SchemaType.STRING,
                                        description: "Format YYYY-MM-DD",
                                    },
                                    end_date: {
                                        type: SchemaType.STRING,
                                        description: "Format YYYY-MM-DD",
                                    },
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
                                            problem_solved: {
                                                type: SchemaType.STRING,
                                            },
                                            key_features: {
                                                type: SchemaType.ARRAY,
                                                items: {
                                                    type: SchemaType.STRING,
                                                },
                                            },
                                            tech_stack: {
                                                type: SchemaType.ARRAY,
                                                items: {
                                                    type: SchemaType.STRING,
                                                },
                                            },
                                            url: { type: SchemaType.STRING },
                                        },
                                        required: [
                                            "problem_solved",
                                            "tech_stack",
                                        ],
                                    },
                                },
                                required: ["project_name", "details"],
                            },
                        },
                    },
                },
            },
        });

        // 🆕 2. USER PROMPT: Just the data (The "Task")
        const prompt = `
        Here is the resume text to process:
        ${text}
        `;

        const result = await model.generateContent(prompt);
        // Log Token Usage DEBUG
        const usageMetadata = result.response.usageMetadata;
        if (usageMetadata) {
            console.log("------------------------------------------------");
            console.log("💰 GEMINI IMPORT PDF TOKEN USAGE:");
            console.log(`- Prompt Tokens: ${usageMetadata.promptTokenCount}`);
            console.log(
                `- Response Tokens: ${usageMetadata.candidatesTokenCount}`,
            );
            console.log(`- Total Tokens: ${usageMetadata.totalTokenCount}`);
            console.log("------------------------------------------------");
        }
        // END - Log Token Usage DEBUG

        const extraction = JSON.parse(result.response.text());

        // response DEBUG
        console.log("🤖 EXTRACTED JSON:");
        console.log(JSON.stringify(extraction, null, 2)); // Pretty print
        console.log("------------------------------------------------");
        // END - response DEBUG

        // 4. Database Transaction

        // A. Update User Info
        const userUpdates: any = {};
        if (extraction.personal_info?.first_name)
            userUpdates.first_name = extraction.personal_info.first_name;
        if (extraction.personal_info?.last_name)
            userUpdates.last_name = extraction.personal_info.last_name;
        if (extraction.personal_info?.phone)
            userUpdates.phone = extraction.personal_info.phone;
        if (extraction.personal_info?.linkedin_url)
            userUpdates.linkedin_url = fixUrl(
                extraction.personal_info.linkedin_url,
            );
        if (extraction.personal_info?.github_url)
            userUpdates.github_url = fixUrl(
                extraction.personal_info.github_url,
            );
        if (extraction.personal_info?.portfolio_url)
            userUpdates.portfolio_url = fixUrl(
                extraction.personal_info.portfolio_url,
            );

        if (Object.keys(userUpdates).length > 0) {
            await supabase
                .from("user")
                .update(userUpdates)
                .eq("id", userData.id);
        }

        // B. Insert Experience
        if (extraction.experience && extraction.experience.length > 0) {
            const expData = extraction.experience.map((item: any) => ({
                user_id: userData.id,
                company_name:
                    item.company_name?.substring(0, 100) || "Unknown Company",
                job_title: item.job_title?.substring(0, 100) || "Unknown Title",

                // 🆕 UPDATE THESE TWO LINES:
                start_date:
                    sanitizeDate(item.start_date) || new Date().toISOString(),
                end_date: sanitizeDate(item.end_date),

                is_current: item.is_current || false,
                details: item.details || {},
            }));

            // 🆕 ADD THIS LOGGING BLOCK:
            const { error: expError } = await supabase
                .from("experience")
                .insert(expData);

            // DEBUG any error adding the experience
            /*
            if (expError) {
                console.error("❌ EXPERIENCE INSERT ERROR:", expError);
            } else {
                console.log("✅ Experience inserted successfully");
            }
            */
            // END - DEBUG any error adding the experience
        }

        // C. Insert Education
        if (extraction.education && extraction.education.length > 0) {
            const eduData = extraction.education.map((item: any) => ({
                user_id: userData.id,
                school_name:
                    item.school_name?.substring(0, 100) || "Unknown School",
                degree: item.degree?.substring(0, 100) || "Degree",
                field_of_study:
                    item.field_of_study?.substring(0, 100) || "General",
                start_date: item.start_date || new Date().toISOString(),
                end_date: item.end_date,
                is_current: item.is_current || false,
            }));
            await supabase.from("education").insert(eduData);
        }

        // D. Insert Skills
        if (extraction.skills && extraction.skills.length > 0) {
            const skillData = extraction.skills.map((skillName: string) => ({
                user_id: userData.id,
                skill_name: skillName.substring(0, 50),
                skill_level: 2,
            }));
            await supabase.from("skill").insert(skillData);
        }

        // E. Insert Projects
        if (extraction.projects && extraction.projects.length > 0) {
            const projData = extraction.projects.map((item: any) => {
                if (item.details && item.details.url) {
                    item.details.url = fixUrl(item.details.url);
                }

                return {
                    user_id: userData.id,
                    project_name:
                        item.project_name?.substring(0, 100) || "Project",
                    details: item.details || {},
                };
            });
            await supabase.from("project").insert(projData);
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

function sanitizeDate(dateStr?: string | null): string | null {
    if (!dateStr) return null;
    const clean = dateStr.trim().toLowerCase();
    // Convert AI's "null" string to actual null
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
