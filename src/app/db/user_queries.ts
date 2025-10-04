import { SectionTypes } from '@/utils/enums';
import { createClient } from '@/utils/supabase/client';
import { SupabaseClient, User } from '@supabase/supabase-js';

// Function to get data by from the DB by table or by ID in an specific order
export async function getDBTableInfo(
    tableName: SectionTypes | '',
    order: 'asc' | 'desc' | null = 'asc',
    id?: number,
): Promise<{
    status: boolean;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: null | any;
}> {
    // Get the supabase client and the user data
    const { supabase, user } = await setSupabaseClient();
    if (!supabase || !user) {
        return {
            status: false,
            message: `Error user is not Authenticated`,
            data: null,
        };
    }
    try {
        let query = supabase.from('user').select(`${tableName} (*)`);

        if (id) {
            query = query.eq(tableName + '.id', id);
        }

        if (order) {
            query = query.order(`id`, {
                referencedTable: `${tableName}`,
                ascending: order === 'asc' ? true : false,
            });
        }

        const { data, error } = await query;

        if (error) {
            return {
                status: false,
                message: `Error getting the ${
                    tableName || 'personal information'
                } data: ${error.message}`,
                data: null,
            };
        }

        // Return the user data
        return {
            status: true,
            message: `Success fetching the ${
                tableName || 'personal information'
            } data`,
            // TODO do I need to use any type ?
            //supabase: SupabaseClient<any, 'public', any> | null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: tableName == '' ? data[0] : (data[0] as any)[tableName],
        };
    } catch (error) {
        return {
            status: false,
            message: `Error getting the ${
                tableName || 'personal information'
            } data: ${(error as Error).message}`,
            data: null,
        };
    }
}

// Function to set up the supabase client and get the user data
async function setSupabaseClient(): Promise<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: null | SupabaseClient<any, 'public', any>;
    user: User | null;
}> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If the user is not authenticated, return false:
    if (!user) {
        return { supabase: null, user: null };
    }
    return { supabase, user };
}

export async function deleteRecord(
    tableName: string,
    column_name: string,
    id_value: string,
) {
    const { supabase, user } = await setSupabaseClient();
    if (!supabase || !user) {
        return false;
    }
    try {
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq(column_name, id_value);

        // return false if there is an error
        if (error) {
            return false;
        }

        // Return the user data
        return true;
    } catch (error) {
        console.error('unnexpected error deleting the record ' + error);
        return false;
    }
}

// New function to get the current user's full profile
export async function getCurrentUserProfile() {
    const { supabase, user } = await setSupabaseClient();
    if (!supabase || !user) {
        return { status: false, message: 'User not authenticated', data: null };
    }

    try {
        const { data, error } = await supabase
            .from('user')
            .select('*') // Select all columns, including token_balance
            .eq('supabase_id', user.id)
            .single();

        if (error) {
            return {
                status: false,
                message: `Error getting user profile: ${error.message}`,
                data: null,
            };
        }

        return { status: true, message: 'Success', data: data };
    } catch (error) {
        return {
            status: false,
            message: `Unexpected error: ${(error as Error).message}`,
            data: null,
        };
    }
}

// function to get all job applications for the current user
export async function getUserApplications() {
    // Get the supabase client and the user data
    const { supabase, user } = await setSupabaseClient();
    if (!supabase || !user) {
        return {
            status: false,
            message: `Error: User is not authenticated`,
            data: null,
        };
    }

    try {
        // Here's the single, efficient query:
        // 1. Start from the 'user' table.
        // 2. Select all related records from the 'job_offer' table.
        // 3. Filter the 'user' table by the authenticated user's UUID ('supabase_id').
        const { data, error } = await supabase
            .from('user')
            .select(
                `
                job_offer (
                    id,
                    company_name,
                    job_position,
                    job_description,
                    created_at
                )
            `,
            )
            .order('created_at', {
                referencedTable: 'job_offer',
                ascending: false,
            })
            .eq('supabase_id', user.id)
            .single();

        if (error) {
            // This specific error code means no user row was found, which is okay.
            // It just means they have no applications yet.
            if (error.code === 'PGRST116') {
                return {
                    status: true,
                    message: 'User has no applications yet.',
                    data: [], // Return an empty array, which is valid.
                };
            }
            // For all other errors, we report them.
            return {
                status: false,
                message: `Error getting job applications: ${error.message}`,
                data: null,
            };
        }

        // The result will be an object like { job_offer: [...] }.
        // If the user has no offers, `data.job_offer` will be null, so we default to an empty array.
        const applications = data?.job_offer || [];

        // Return the application data
        return {
            status: true,
            message: 'Successfully fetched job applications',
            data: applications,
        };
    } catch (error) {
        return {
            status: false,
            message: `An unexpected error occurred: ${
                (error as Error).message
            }`,
            data: null,
        };
    }
}
