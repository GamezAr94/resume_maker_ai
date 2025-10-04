import { SectionTypes } from '@/utils/enums';
import { createClient } from '@/utils/supabase/client';
import { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * A reusable client-side function to call the DELETE API endpoint for any profile section.
 * It handles the fetch request, error handling, and notifications.
 *
 * @param section The section/table name (e.g., 'experience', 'skill').
 * @param id The ID of the record to delete.
 * @returns A promise that resolves to true if successful, false otherwise.
 */
export async function deleteProfileRecord(
    section: SectionTypes,
    id: string,
): Promise<boolean> {
    try {
        const response = await fetch(`/api/profile/${section}/${id}`, {
            method: 'DELETE',
        });

        // Handle HTTP errors (e.g., 404, 500) from the server
        if (!response.ok) {
            const result = await response.json();
            // Throw an error to be caught by the catch block
            throw new Error(
                result.message || 'An error occurred during deletion.',
            );
        }

        // If we reach here, the deletion was successful.
        return true;
    } catch (error) {
        throw error;
    }
}

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
