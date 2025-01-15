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
    supabase: any,
    user_id: string,
): Promise<{ id: string | null; message: string; status: number }> {
    let error: string | null = null;
    let data: any = null;

    // Get the user id from the database
    const { data: userData, error: userError } = await supabase
        .from('user')
        .select(`id`)
        .eq('supabase_id', user_id);

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
                if (!('skill_level' in requestBodyData)) {
                    error = 'Invalid data for skill section';
                    break;
                }
                const { data: savedSkillData, error: skillError } =
                    await supabase
                        .from(type)
                        .upsert({
                            user_id: userData[0].id,
                            ...requestBodyData,
                            skill_level:
                                requestBodyData.skill_level == ''
                                    ? null
                                    : requestBodyData.skill_level,
                        })
                        .select();

                data = savedSkillData;
                error = skillError ? skillError.message : null;
                break;
            case SectionTypes.Project:
                // if the experience_id or education_id is not in the request body, set it to null
                if (!('experience_id' in requestBodyData)) {
                    requestBodyData = {
                        ...requestBodyData,
                        experience_id: null,
                    };
                }
                if (!('education_id' in requestBodyData)) {
                    requestBodyData = {
                        ...requestBodyData,
                        education_id: null,
                    };
                }
                const { data: savedProjectData, error: projectError } =
                    await supabase
                        .from(type)
                        .upsert({
                            user_id: userData[0].id,
                            ...requestBodyData,
                        })
                        .select();

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
