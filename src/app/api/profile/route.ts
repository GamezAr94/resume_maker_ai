'use server';

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// This function handles GET requests to /api/profile
export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { message: 'Not authenticated' },
            { status: 401 },
        );
    }

    try {
        // This is the logic from your original getCurrentUserProfile function
        const { data, error } = await supabase
            .from('user')
            .select('*') // Select all columns for the full profile
            .eq('supabase_id', user.id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'An unexpected error occurred';
        return NextResponse.json(
            { message: `Error fetching user profile: ${errorMessage}` },
            { status: 500 },
        );
    }
}
