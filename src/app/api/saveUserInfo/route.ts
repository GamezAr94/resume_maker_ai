'use server';

import { SectionTypes } from '@/utils/enums';
import {
    FormEducationStructure,
    FormExperienceStructure,
    FormPersonalStructure,
    FormSkillStructure,
    FormProjectStructure,
} from '@/utils/interfaces';
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

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
        | FormProjectStructure,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: SupabaseClient<any, 'public', any>,
    user_id: string,
): Promise<{ id: string | null; message: string; status: number }> {
    let error: string | null = null;
    let data: { id: string }[] | null = null;

    // Get the user id from the database
    const { data: userData, error: userError } = await supabase
        .from('user')
        .select(`id`)
        .eq('supabase_id', user_id);

    if (userError) {
        return {
            id: null,
            message: 'Failed to process data: ' + (userError as Error).message,
            status: 500,
        };
    }

    try {
        switch (type) {
            case SectionTypes.Personal:
                // Save the user data in the supabase database
                const { data: savedPersonalData, error: personalError } =
                    await supabase
                        .from('user')
                        .update({
                            //email: user?.email,
                            ...requestBodyData,
                        })
                        .eq('supabase_id', user_id)
                        .select();

                data = savedPersonalData;
                error = personalError ? personalError.message : null;
                break;
            case SectionTypes.Experience:
                // If 'is_current' is true, force end_date to be null
                if (
                    'is_current' in requestBodyData &&
                    requestBodyData.is_current
                ) {
                    (requestBodyData as FormExperienceStructure).end_date =
                        null;
                }
                // Save the user experience data in the supabase database
                const { data: savedExperienceData, error: experienceError } =
                    await supabase
                        .from(type)
                        .upsert({
                            user_id: userData[0].id,
                            ...requestBodyData,
                        })
                        .select();

                data = savedExperienceData;
                error = experienceError ? experienceError.message : null;
                break;
            case SectionTypes.Education:
                // If 'is_current' is true, force end_date to be null
                if (
                    'is_current' in requestBodyData &&
                    requestBodyData.is_current
                ) {
                    (requestBodyData as FormEducationStructure).end_date = null;
                }
                // Save the user experience data in the supabase database
                const { data: savedEducationData, error: educationError } =
                    await supabase
                        .from(type)
                        .upsert({
                            user_id: userData[0].id,
                            ...requestBodyData,
                        })
                        .select();

                data = savedEducationData;
                error = educationError ? educationError.message : null;
                break;
            case SectionTypes.Skill:
                // Save the user experience data in the supabase database
                const { data: savedSkillData, error: skillError } =
                    await supabase
                        .from(type)
                        .upsert({
                            user_id: userData[0].id,
                            ...requestBodyData,
                            skill_level:
                                !('skill_level' in requestBodyData) ||
                                requestBodyData.skill_level == ''
                                    ? null
                                    : requestBodyData.skill_level,
                        })
                        .select();

                data = savedSkillData;
                error = skillError ? skillError.message : null;
                break;
            case SectionTypes.Project:
                // First, assert the type so we can safely access project-specific properties
                const projectData = requestBodyData as FormProjectStructure;

                // Next, create a new, clean object for the upsert operation
                const dataToUpsert = {
                    ...projectData,
                    user_id: userData[0].id,
                    // Explicitly set foreign keys to null if they are missing
                    experience_id: projectData.experience_id || null,
                    education_id: projectData.education_id || null,
                };

                const { data: savedProjectData, error: projectError } =
                    await supabase.from(type).upsert(dataToUpsert).select();

                data = savedProjectData;
                error = projectError ? projectError.message : null;
                break;
            case SectionTypes.JobOffer:
                const { data: dataResumeSaved, error: jobOfferError } =
                    await supabase
                        .from(type)
                        .upsert({
                            user_id: userData[0].id,
                            ...requestBodyData,
                        })
                        .select();
                data = dataResumeSaved;
                error = jobOfferError ? jobOfferError.message : null;
                break;
            default:
                data = null;
                error = 'Invalid section type';
                break;
        }

        // If there is an error, return an error response:
        if (error) {
            return {
                id: null,
                message:
                    'Data was not stored, please make sure the data is correct and try again: ' +
                    error,
                status: 400,
            };
        }

        // Return a success response
        return {
            id: data && data[0] ? data[0].id : null,
            message: `${type} section was stored successfully`,
            status: 200,
        };
    } catch (error) {
        // Return an error response:
        return {
            id: null,
            message: 'Failed to process data: ' + (error as Error).message,
            status: 500,
        };
    }
}
