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

        // TODO remove this comment
        console.log(data[0]);
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
