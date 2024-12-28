import { createClient } from '@/utils/supabase/client';

// Function to get the user data from the database, return false if the user is not authenticated or error
export async function getUserInfo() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If the user is not authenticated, return false:
    if (!user) {
        console.error('Error user is not Authenticated');
        return false;
    }

    try {
        // Save the user data in the supabase database
        const { data, error } = await supabase
            .from('user')
            .select('*')
            .eq('supabase_id', user.id);

        // If there is an error, return an error response:
        if (error) {
            console.error('Error getting the user data:', error);
            return false;
        }

        // Return the user data
        return data;
    } catch (error) {
        console.error('Error saving the user data:', error);
        return false;
    }
}
