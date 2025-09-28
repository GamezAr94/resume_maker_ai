'use server';

import { ZodError, z } from 'zod';
import { SectionTypes } from '@/utils/enums';
import {
    FormEducationStructure,
    FormExperienceStructure,
    FormPersonalStructure,
    FormSkillStructure,
    FormProjectStructure,
    FormJobOfferDataStructure,
} from '@/utils/interfaces';
import {
    personalInfoSchema,
    experienceSchema,
    educationSchema,
    skillSchema,
    projectSchema,
    jobOfferSchema, // Assuming you created this one as well
} from '@/utils/zod_schemas';
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { PROFILE_RECORD_LIMITS } from '@/app/config/profile.config';

// Helper function to format Zod errors into a user-friendly string
function formatZodError(error: ZodError): string {
    // returns only the first error message
    const firstError = error.errors[0];
    if (firstError) {
        return `${firstError.path.join('.')}: ${firstError.message}`;
    }
    return 'Invalid data submitted.';
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const requestBody = await req.json();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If the user is not authenticated, return an error response:
    if (!user) {
        return new Response(
            JSON.stringify({
                message:
                    'Error accessing your account. Please close your session and login again',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    // Save the user data in the supabase database
    const { id, message, status } = await updatePerType(
        requestBody.type,
        requestBody.data,
        supabase,
        user.id,
    );

    // Return a response with the message and status: (either success or error)
    return new Response(JSON.stringify({ message: message, id: id }), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// Function to update the user data in the database depending on the section type
async function updatePerType(
    type: SectionTypes,
    requestBodyData:
        | FormEducationStructure
        | FormExperienceStructure
        | FormPersonalStructure
        | FormSkillStructure
        | FormProjectStructure
        | FormJobOfferDataStructure,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: SupabaseClient<any, 'public', any>,
    user_id: string,
): Promise<{ id: string | null; message: string; status: number }> {
    // Get the user id from the database
    const { data: userData, error: userError } = await supabase
        .from('user')
        .select(`id`)
        .eq('supabase_id', user_id)
        .single();

    if (userError || !userData) {
        return {
            id: null,
            message: 'Failed to process data: ' + (userError as Error).message,
            status: 500,
        };
    }

    // This check applies only when creating a NEW record (no ID is present)
    if (type !== SectionTypes.Personal && !('id' in requestBodyData)) {
        const { count, error: countError } = await supabase
            .from(type)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userData.id);

        if (countError) {
            return {
                id: null,
                message: 'Could not verify record count.',
                status: 500,
            };
        }

        const limits = {
            [SectionTypes.Experience]: PROFILE_RECORD_LIMITS.EXPERIENCE,
            [SectionTypes.Education]: PROFILE_RECORD_LIMITS.EDUCATION,
            [SectionTypes.Skill]: PROFILE_RECORD_LIMITS.SKILLS,
            [SectionTypes.Project]: PROFILE_RECORD_LIMITS.PROJECTS,
        };

        const limit = limits[type as keyof typeof limits];

        if (limit !== undefined && count !== null && count >= limit) {
            return {
                id: null,
                message: `You have reached the maximum of ${limit} records for this section.`,
                status: 403, // 403 Forbidden is a good status code here
            };
        }
    }

    let validationResult;
    let schema: z.ZodType<any>;

    // Select the correct schema based on the type
    switch (type) {
        case SectionTypes.Personal:
            schema = personalInfoSchema;
            break;
        case SectionTypes.Experience:
            schema = experienceSchema;
            break;
        case SectionTypes.Education:
            schema = educationSchema;
            break;
        case SectionTypes.Skill:
            schema = skillSchema;
            break;
        case SectionTypes.Project:
            schema = projectSchema;
            break;
        case SectionTypes.JobOffer:
            schema = jobOfferSchema;
            break;
        default:
            return {
                id: null,
                message: 'Invalid section type provided.',
                status: 400,
            };
    }

    // Validate the incoming data using the selected schema
    validationResult = schema.safeParse(requestBodyData);

    if (!validationResult.success) {
        console.error(
            'Zod validation failed:',
            validationResult.error.flatten(),
        );
        return {
            id: null,
            message: formatZodError(validationResult.error),
            status: 400,
        };
    }

    // The data is valid, proceed with the database operation
    const validatedData = validationResult.data;

    try {
        let dbResponse;
        if (type === SectionTypes.Personal) {
            dbResponse = await supabase
                .from('user')
                .update(validatedData)
                .eq('supabase_id', user_id)
                .select('id');
        } else {
            // For all other types, we upsert into their respective tables
            if (type === SectionTypes.Experience && validatedData.is_current) {
                validatedData.end_date = null;
            }
            if (type === SectionTypes.Education && validatedData.is_current) {
                validatedData.end_date = null;
            }
            if (type === SectionTypes.Education && !validatedData.grades) {
                validatedData.grades = null;
            }
            if (type === SectionTypes.Project) {
                // If an experience_id is provided, nullify education_id
                if (validatedData.experience_id) {
                    validatedData.education_id = null;
                }
                // If an education_id is provided, nullify experience_id
                else if (validatedData.education_id) {
                    validatedData.experience_id = null;
                } else {
                    validatedData.experience_id = null;
                    validatedData.education_id = null;
                }
            }
            dbResponse = await supabase
                .from(type)
                .upsert({ ...validatedData, user_id: userData.id })
                .select('id');
        }

        const { data, error } = dbResponse;

        if (error) {
            return {
                id: null,
                message: 'Database error: ' + error.message,
                status: 500,
            };
        }

        return {
            id: data && data[0] ? data[0].id : null,
            message: `${type} section was stored successfully.`,
            status: 200,
        };
    } catch (error) {
        return {
            id: null,
            message:
                'An unexpected error occurred: ' + (error as Error).message,
            status: 500,
        };
    }
}
