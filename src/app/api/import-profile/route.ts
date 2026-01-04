import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

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

    // 1. Get User ID (Internal DB ID)
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
        // 2. Configure Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
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
                                    description: { type: SchemaType.STRING },
                                },
                                required: [
                                    "company_name",
                                    "job_title",
                                    "description",
                                    "start_date",
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
                                    project_description: {
                                        type: SchemaType.STRING,
                                    },
                                },
                                required: [
                                    "project_name",
                                    "project_description",
                                ],
                            },
                        },
                    },
                },
            },
        });

        // 3. Prompting
        const prompt = `
        Extract the following resume text into a structured JSON object.
        - For dates, ALWAYS try to convert to YYYY-MM-DD (e.g. "May 2020" -> "2020-05-01").
        - If a job is "Present" or "Current", set is_current to true and end_date to null.
        - Clean up the text descriptions to be bullet points or paragraphs, removing artifacts.

        RESUME TEXT:
        ${text}
        `;

        const result = await model.generateContent(prompt);
        const extraction = JSON.parse(result.response.text());

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
            userUpdates.linkedin_url = extraction.personal_info.linkedin_url;
        if (extraction.personal_info?.github_url)
            userUpdates.github_url = extraction.personal_info.github_url;
        if (extraction.personal_info?.portfolio_url)
            userUpdates.portfolio_url = extraction.personal_info.portfolio_url;

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
                start_date: item.start_date || new Date().toISOString(),
                end_date: item.end_date,
                is_current: item.is_current || false,
                description: item.description || "",
            }));
            await supabase.from("experience").insert(expData);
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
            const projData = extraction.projects.map((item: any) => ({
                user_id: userData.id,
                project_name: item.project_name?.substring(0, 100) || "Project",
                project_description: item.project_description || "",
            }));
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
