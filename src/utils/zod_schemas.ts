import { z } from "zod";
import { CHARACTER_LIMITS } from "@/utils/configLimits";

// --- Schema for Personal Information Form ---
export const personalInfoSchema = z.object({
    id: z.string().optional().nullable(),
    first_name: z
        .string()
        .min(1, { message: "First name is required." })
        .max(CHARACTER_LIMITS.name, {
            message: `First name cannot exceed ${CHARACTER_LIMITS.name} characters.`,
        }),
    last_name: z
        .string()
        .min(1, { message: "Last name is required." })
        .max(CHARACTER_LIMITS.name, {
            message: `Last name cannot exceed ${CHARACTER_LIMITS.name} characters.`,
        }),
    email: z.string().email({ message: "A valid email is required." }),
    phone: z
        .string()
        .max(CHARACTER_LIMITS.phone, {
            message: `Phone cannot exceed ${CHARACTER_LIMITS.phone} characters.`,
        })
        .optional()
        .or(z.literal(""))
        .nullable(),
    linkedin_url: z
        .string()
        .url({ message: "Please enter a valid LinkedIn URL." })
        .max(CHARACTER_LIMITS.url)
        .or(z.literal(""))
        .nullable(),
    github_url: z
        .string()
        .url({ message: "Please enter a valid GitHub URL." })
        .max(CHARACTER_LIMITS.url)
        .or(z.literal(""))
        .nullable(),
    portfolio_url: z
        .string()
        .url({ message: "Please enter a valid Portfolio URL." })
        .max(CHARACTER_LIMITS.url)
        .or(z.literal(""))
        .nullable(),
});

// --- Schema for Work Experience Form ---
export const experienceSchema = z
    .object({
        id: z.number().optional().nullable(),
        job_title: z
            .string()
            .min(1, { message: "Job title is required." })
            .max(CHARACTER_LIMITS.title),
        company_name: z
            .string()
            .min(1, { message: "Company name is required." })
            .max(CHARACTER_LIMITS.company),
        start_date: z.string().min(1, { message: "Start date is required." }),
        end_date: z.string().optional().nullable(),
        is_current: z.boolean().optional(),
        details: z
            .object({
                summary: z
                    .string()
                    .max(CHARACTER_LIMITS.description, {
                        message: `Summary cannot exceed ${CHARACTER_LIMITS.description} characters.`,
                    })
                    .optional()
                    .or(z.literal("")), // Allow empty initially
                responsibilities: z
                    .array(
                        z.string().max(CHARACTER_LIMITS.bulletPoint, {
                            message: `Responsibility cannot exceed ${CHARACTER_LIMITS.bulletPoint} chars.`,
                        }),
                    )
                    .default([]),

                achievements: z
                    .array(
                        z.string().max(CHARACTER_LIMITS.bulletPoint, {
                            message: `Achievement cannot exceed ${CHARACTER_LIMITS.bulletPoint} chars.`,
                        }),
                    )
                    .default([]),

                skills_used: z
                    .array(
                        z.string().max(CHARACTER_LIMITS.techItem, {
                            message: `Skill cannot exceed ${CHARACTER_LIMITS.techItem} chars.`,
                        }),
                    )
                    .default([]),
            })
            .default({}),
    })
    .refine(
        (data) =>
            data.is_current || (data.end_date && data.end_date.length > 0),
        {
            message: "End date is required unless this is your current role.",
            path: ["end_date"],
        },
    );

// --- Schema for Education Form ---
export const educationSchema = z
    .object({
        id: z.number().optional().nullable(),
        school_name: z
            .string()
            .min(1, { message: "School name is required." })
            .max(CHARACTER_LIMITS.school),
        degree: z
            .string()
            .min(1, { message: "Degree is required." })
            .max(CHARACTER_LIMITS.degree),
        field_of_study: z
            .string()
            .min(1, { message: "Field of study is required." })
            .max(CHARACTER_LIMITS.fieldOfStudy),
        grades: z
            .string()
            .max(CHARACTER_LIMITS.grades)
            .optional()
            .or(z.literal(""))
            .nullable(),
        start_date: z.string().min(1, { message: "Start date is required." }),
        end_date: z.string().optional().nullable(),
        is_current: z.boolean().optional(),
    })
    .refine(
        (data) =>
            data.is_current || (data.end_date && data.end_date.length > 0),
        {
            message: "End date is required unless you are currently studying.",
            path: ["end_date"],
        },
    );

// --- Schema for Skills Form ---
export const skillSchema = z.object({
    id: z.string().optional().nullable(),
    skill_name: z
        .string()
        .min(1, { message: "Skill name is required." })
        .max(CHARACTER_LIMITS.skill),
    skill_level: z
        .string() // The form sends the value as a string '1', '2', etc.
        .optional()
        .nullable(),
});

// --- Schema for Projects Form ---
export const projectSchema = z.object({
    id: z.union([z.string(), z.number()]).optional().nullable(),
    project_name: z
        .string()
        .min(1, { message: "Project name is required." })
        .max(CHARACTER_LIMITS.title),
    experience_id: z.union([z.string(), z.number()]).optional().nullable(),
    education_id: z.union([z.string(), z.number()]).optional().nullable(),
    details: z
        .object({
            problem_solved: z
                .string()
                .max(CHARACTER_LIMITS.description, {
                    message: `Problem description cannot exceed ${CHARACTER_LIMITS.description} characters.`,
                })
                .optional()
                .or(z.literal("")),

            key_features: z
                .array(
                    z.string().max(CHARACTER_LIMITS.bulletPoint, {
                        message: `Feature cannot exceed ${CHARACTER_LIMITS.bulletPoint} chars.`,
                    }),
                )
                .default([]),

            tech_stack: z
                .array(
                    z.string().max(CHARACTER_LIMITS.techItem, {
                        message: `Tech item cannot exceed ${CHARACTER_LIMITS.techItem} chars.`,
                    }),
                )
                .default([]),

            url: z
                .string()
                .url({
                    message:
                        "Invalid format. Please start with 'https://' (e.g., https://www.mysite.com)",
                })
                .max(CHARACTER_LIMITS.url, {
                    message: `URL cannot exceed ${CHARACTER_LIMITS.url} chars.`,
                })
                .optional()
                .or(z.literal("")),
        })
        .default({}),
});

// --- Schema for the Job Offer Form ---
export const jobOfferSchema = z.object({
    id: z.string().or(z.number()).optional().nullable(),
    company_name: z
        .string()
        .min(1, { message: "Company name is required." })
        .max(CHARACTER_LIMITS.company),
    job_position: z
        .string()
        .min(1, { message: "Job position is required." })
        .max(CHARACTER_LIMITS.title),
    job_description: z
        .string()
        .min(50, { message: "Job description must be at least 50 characters." })
        .max(CHARACTER_LIMITS.jobDescription),
    // We also include resume_generated here to validate the whole object before saving
    resume_generated: z.object({}).passthrough(), // Validate that it's an object, allow any structure inside
});
