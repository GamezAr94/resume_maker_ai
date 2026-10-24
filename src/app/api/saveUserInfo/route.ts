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
    jobOfferSchema,
} from '@/utils/zod_schemas';
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

function formatZodError(error: ZodError): string {
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

    if (!user) {
        return new Response(
            JSON.stringify({
                message:
                    'Error accessing your account. Please close your session and login again',
            }),
            {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    const { id, message, status } = await updatePerType(
        requestBody.type,
        requestBody.data,
        supabase,
        user.id,
    );

    return new Response(JSON.stringify({ message: message, id: id }), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let schema: z.ZodType<any>;

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

    const validationResult = schema.safeParse(requestBodyData);

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
                if (validatedData.experience_id) {
                    validatedData.education_id = null;
                } else if (validatedData.education_id) {
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
