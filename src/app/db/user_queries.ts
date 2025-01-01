import { SectionTypes } from '@/utils/enums';
import { createClient } from '@/utils/supabase/client';

// Function to get the user data from the database, return false if the user is not authenticated or error
export async function getDBTableInfo(
    tableName: SectionTypes | '',
): Promise<{ status: boolean; message: string; data: any }> {
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
        const { data, error } = await supabase
            .from('user')
            .select(`${tableName} (*)`)
            .eq('supabase_id', user.id)
            .order(`id`, { foreignTable: `${tableName}` }, { ascending: true });

        // If there is an error, return an error response:
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
            data: tableName == '' ? data[0] : data[0][tableName],
        };
    } catch (error) {
        return {
            status: false,
            message: `Error saving the ${
                tableName || 'personal information'
            } data: ${(error as any).message}`,
            data: null,
        };
    }
}

// Function to set up the supabase client and get the user data
async function setSupabaseClient(): Promise<{ supabase: any; user: any }> {
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
        const { data, error } = await supabase
            .from(tableName)
            .delete()
            .eq(column_name, id_value)
            .select();

        // return false if there is an error
        if (error) {
            return false;
        }

        // Return the user data
        return true;
    } catch (error) {
        return false;
    }
}
