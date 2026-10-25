import { z } from "zod";
import { CHARACTER_LIMITS } from "@/utils/configLimits";

const flexibleId = z.union([z.string(), z.number()]).optional().nullable();

export const personalInfoSchema = z.object({
    id: flexibleId,
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

export const experienceSchema = z
    .object({
        id: flexibleId,
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
                    .or(z.literal("")),
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
            .default({
                responsibilities: [],
                achievements: [],
                skills_used: [],
            }),
    })
    .refine(
        (data) =>
            data.is_current || (data.end_date && data.end_date.length > 0),
        {
            message: "End date is required unless this is your current role.",
            path: ["end_date"],
        },
    );

export const educationSchema = z
    .object({
        id: flexibleId,
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

export const skillSchema = z.object({
    id: flexibleId,
    skill_name: z
        .string()
        .min(1, { message: "Skill name is required." })
        .max(CHARACTER_LIMITS.skill),
    skill_level: z.string().optional().nullable(),
    skill_category: z.string().optional().nullable(),
});

export const projectSchema = z.object({
    id: flexibleId,
    project_name: z
        .string()
        .min(1, { message: "Project name is required." })
        .max(CHARACTER_LIMITS.title),
    experience_id: flexibleId,
    education_id: flexibleId,
    details: z
        .object({
            my_role: z
                .string()
                .max(CHARACTER_LIMITS.title)
                .optional()
                .or(z.literal("")),
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
            impact_metrics: z
                .array(
                    z.string().max(CHARACTER_LIMITS.bulletPoint, {
                        message: `Metric cannot exceed ${CHARACTER_LIMITS.bulletPoint} chars.`,
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
            keywords: z
                .array(
                    z.string().max(CHARACTER_LIMITS.techItem, {
                        message: `Keyword cannot exceed ${CHARACTER_LIMITS.techItem} chars.`,
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
        .default({
            key_features: [],
            impact_metrics: [],
            tech_stack: [],
            keywords: [],
        }),
});

export const jobOfferSchema = z.object({
    id: flexibleId,
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
    resume_generated: z.object({}).passthrough(),
});
