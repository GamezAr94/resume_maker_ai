'use server';

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    context: { params: { id: string } },
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

    const applicationId = context.params.id;

    try {
        const { data: userData, error: userError } = await supabase
            .from('user')
            .select('id')
            .eq('supabase_id', user.id)
            .single();

        if (userError || !userData) throw new Error('User not found.');

        const { data, error } = await supabase
            .from('job_offer')
            .select(`*`) // Fetch the job_offer and was_downloaded flag
            .eq('id', applicationId)
            .eq('user_id', userData.id) // Security check to ensure ownership
            .single();

        if (error) {
            // This will correctly send a 404 if the resume ID doesn't exist for this user
            return NextResponse.json(
                { message: 'Application not found' },
                { status: 404 },
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'An unexpected error occurred';
        return NextResponse.json(
            { message: `Error fetching application: ${errorMessage}` },
            { status: 500 },
        );
    }
}

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
