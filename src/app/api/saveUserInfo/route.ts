'use server';

import { SectionTypes } from '@/utils/enums';
import {
    FormEducationStructure,
    FormExperienceStructure,
    FormPersonalStructure,
    FormSkillStructure,
    FormProjectStructure,
    FormJobOfferDataStructure,
} from '@/utils/interfaces';
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

// the limits for the content of each input field in the forms
import { CHARACTER_LIMITS } from '@/utils/configLimits';

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
                // --- SERVER-SIDE VALIDATION ---
                const personalData = requestBodyData as FormPersonalStructure;
                if (personalData.first_name.length > CHARACTER_LIMITS.name) {
                    return {
                        id: null,
                        message: 'First name exceeds character limit.',
                        status: 400,
                    };
                }
                if (personalData.last_name.length > CHARACTER_LIMITS.name) {
                    return {
                        id: null,
                        message: 'Last name exceeds character limit.',
                        status: 400,
                    };
                }
                if (
                    personalData.phone &&
                    personalData.phone.length > CHARACTER_LIMITS.phone
                ) {
                    return {
                        id: null,
                        message: 'Phone number exceeds character limit.',
                        status: 400,
                    };
                }
                // Add validation for all URL fields
                if (
                    personalData.linkedin_url &&
                    personalData.linkedin_url.length > CHARACTER_LIMITS.url
                ) {
                    return {
                        id: null,
                        message: 'LinkedIn URL exceeds character limit.',
                        status: 400,
                    };
                }
                if (
                    personalData.github_url &&
                    personalData.github_url.length > CHARACTER_LIMITS.url
                ) {
                    return {
                        id: null,
                        message: 'GitHub URL exceeds character limit.',
                        status: 400,
                    };
                }
                if (
                    personalData.portfolio_url &&
                    personalData.portfolio_url.length > CHARACTER_LIMITS.url
                ) {
                    return {
                        id: null,
                        message: 'Portfolio URL exceeds character limit.',
                        status: 400,
                    };
                }
                if (
                    personalData.other_url &&
                    personalData.other_url.length > CHARACTER_LIMITS.url
                ) {
                    return {
                        id: null,
                        message: 'Other link exceeds character limit.',
                        status: 400,
                    };
                }

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
                const experienceData =
                    requestBodyData as FormExperienceStructure;
                // --- SERVER-SIDE VALIDATION ---
                if (experienceData.title.length > CHARACTER_LIMITS.title) {
                    return {
                        id: null,
                        message: 'Job title exceeds character limit.',
                        status: 400,
                    };
                }
                if (experienceData.company.length > CHARACTER_LIMITS.company) {
                    return {
                        id: null,
                        message: 'Company name exceeds character limit.',
                        status: 400,
                    };
                }
                if (
                    experienceData.responsabilities.length >
                    CHARACTER_LIMITS.description
                ) {
                    return {
                        id: null,
                        message: 'Description exceeds character limit.',
                        status: 400,
                    };
                }

                // If 'is_current' is true, force end_date to be null
                if (experienceData.is_current) {
                    experienceData.end_date = null;
                }
                // Save the user experience data in the supabase database
                const { data: savedExperienceData, error: experienceError } =
                    await supabase
                        .from(type)
                        .upsert({
                            user_id: userData[0].id,
                            ...experienceData,
                        })
                        .select();

                data = savedExperienceData;
                error = experienceError ? experienceError.message : null;
                break;
            case SectionTypes.Education:
                const educationData = requestBodyData as FormEducationStructure;
                // --- SERVER-SIDE VALIDATION ---
                if (
                    educationData.school_name.length > CHARACTER_LIMITS.school
                ) {
                    return {
                        id: null,
                        message: 'School name exceeds character limit.',
                        status: 400,
                    };
                }
                if (educationData.degree.length > CHARACTER_LIMITS.degree) {
                    return {
                        id: null,
                        message: 'Degree exceeds character limit.',
                        status: 400,
                    };
                }
                if (
                    educationData.field_of_study.length >
                    CHARACTER_LIMITS.fieldOfStudy
                ) {
                    return {
                        id: null,
                        message: 'Field of study exceeds character limit.',
                        status: 400,
                    };
                }
                if (
                    educationData.grades &&
                    educationData.grades.length > CHARACTER_LIMITS.grades
                ) {
                    return {
                        id: null,
                        message: 'Grades exceed character limit.',
                        status: 400,
                    };
                }
                // If 'is_current' is true, force end_date to be null
                if (educationData.is_current) {
                    educationData.end_date = null;
                }
                // Save the user experience data in the supabase database
                const { data: savedEducationData, error: educationError } =
                    await supabase
                        .from(type)
                        .upsert({
                            user_id: userData[0].id,
                            ...educationData,
                        })
                        .select();

                data = savedEducationData;
                error = educationError ? educationError.message : null;
                break;
            case SectionTypes.Skill:
                const skillData = requestBodyData as FormSkillStructure;
                // --- SERVER-SIDE VALIDATION ---
                if (skillData.skill_name.length > CHARACTER_LIMITS.skill) {
                    return {
                        id: null,
                        message: 'Skill name exceeds character limit.',
                        status: 400,
                    };
                }
                // Save the user experience data in the supabase database
                const { data: savedSkillData, error: skillError } =
                    await supabase
                        .from(type)
                        .upsert({
                            user_id: userData[0].id,
                            ...skillData,
                            skill_level: skillData.skill_level || null,
                        })
                        .select();

                data = savedSkillData;
                error = skillError ? skillError.message : null;
                break;
            case SectionTypes.Project:
                // First, assert the type so we can safely access project-specific properties
                const projectData = requestBodyData as FormProjectStructure;

                // --- SERVER-SIDE VALIDATION ---
                if (projectData.project_name.length > CHARACTER_LIMITS.title) {
                    return {
                        id: null,
                        message: 'Project name exceeds character limit.',
                        status: 400,
                    };
                }
                if (
                    projectData.project_description.length >
                    CHARACTER_LIMITS.description
                ) {
                    return {
                        id: null,
                        message: 'Description exceeds character limit.',
                        status: 400,
                    };
                }

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
                const jobOfferData =
                    requestBodyData as unknown as FormJobOfferDataStructure;
                // --- SERVER-SIDE VALIDATION ---
                if (
                    jobOfferData.company_name.length > CHARACTER_LIMITS.company
                ) {
                    return {
                        id: null,
                        message: 'Company name exceeds character limit.',
                        status: 400,
                    };
                }
                if (jobOfferData.job_position.length > CHARACTER_LIMITS.title) {
                    return {
                        id: null,
                        message: 'Job position exceeds character limit.',
                        status: 400,
                    };
                }
                if (
                    jobOfferData.job_description.length >
                    CHARACTER_LIMITS.jobDescription
                ) {
                    return {
                        id: null,
                        message: 'Job description exceeds character limit.',
                        status: 400,
                    };
                }
                const { data: dataResumeSaved, error: jobOfferError } =
                    await supabase
                        .from(type)
                        .upsert({
                            user_id: userData[0].id,
                            ...jobOfferData,
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
