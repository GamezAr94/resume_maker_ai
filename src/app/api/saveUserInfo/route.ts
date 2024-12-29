'use server';

import { SectionTypes } from '@/utils/enums';
import {
    FormExperienceStructure,
    FormPersonalStructure,
} from '@/utils/interfaces';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request, res: Response) {
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
    const { message, status } = await updatePerType(
        requestBody.type,
        requestBody.data,
        supabase,
        user.id,
    );

    // Return a response with the message and status: (either success or error)
    return new Response(JSON.stringify({ message: message }), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// Function to update the user data in the database depending on the section type
async function updatePerType(
    type: SectionTypes,
    requestBodyData: FormExperienceStructure | FormPersonalStructure,
    supabase: any,
    user_id: string,
): Promise<{ message: string; status: number }> {
    let error: string | null = null;

    // Get the user id from the database
    const { data: userData, error: userError } = await supabase
        .from('user')
        .select(`id`)
        .eq('supabase_id', user_id);

    try {
        switch (type) {
            case SectionTypes.Personal:
                // Save the user data in the supabase database
                const { error: personalError } = await supabase
                    .from('user')
                    .update({
                        //email: user?.email,
                        ...requestBodyData,
                    })
                    .eq('supabase_id', user_id);

                error = personalError ? personalError.message : null;
                break;
            case SectionTypes.Experience:
                // Save the user experience data in the supabase database
                const { error: experienceError } = await supabase
                    .from('experience')
                    .upsert({
                        user_id: userData[0].id,
                        ...requestBodyData,
                    });

                error = experienceError ? experienceError.message : null;
                break;
            case SectionTypes.Education:
                break;
            case SectionTypes.Skills:
                break;
            case SectionTypes.Projects:
                break;
            default:
                break;
        }

        // If there is an error, return an error response:
        if (error) {
            return {
                message:
                    'Data was not stored, please make sure the data is correct and try again: ' +
                    error,
                status: 400,
            };
        }

        // Return a success response
        return {
            //message: `${type} section was stored successfully`,
            message: `Data was stored successfully`,
            status: 200,
        };
    } catch (error) {
        // Return an error response:
        return {
            message: 'Failed to process data: ' + (error as Error).message,
            status: 500,
        };
    }
}
