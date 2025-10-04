'use server';

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// This function handles DELETE requests to /api/applications/[id]
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } },
) {
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

    const applicationId = params.id; // Get the ID from the URL

    try {
        // First, get the internal user ID from the 'user' table
        const { data: userData, error: userError } = await supabase
            .from('user')
            .select('id')
            .eq('supabase_id', user.id)
            .single();

        if (userError || !userData) {
            throw new Error('User profile not found.');
        }

        // Now, perform the delete, ensuring the record belongs to the user
        const { error: deleteError } = await supabase
            .from('job_offer') // The table is 'job_offer'
            .delete()
            .eq('id', applicationId)
            .eq('user_id', userData.id); // Security check!

        if (deleteError) {
            throw new Error(deleteError.message);
        }

        return NextResponse.json(
            { message: 'Application successfully deleted.' },
            { status: 200 },
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'An unexpected error occurred';
        return NextResponse.json(
            { message: `Error deleting application: ${errorMessage}` },
            { status: 500 },
        );
    }
}
