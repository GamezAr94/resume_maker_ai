'use server';

import { createClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

// This function handles POST requests to /api/resume/[id]/download-status
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(request: NextRequest, context: any) {
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

    const resumeId = context.params.id;

    try {
        // Find the user's internal ID to ensure ownership
        const { data: userData, error: userError } = await supabase
            .from('user')
            .select('id')
            .eq('supabase_id', user.id)
            .single();

        if (userError || !userData) {
            throw new Error('User profile not found.');
        }

        // Update the 'job_offer' table, ensuring the resume ID and user ID match.
        // This is a critical security check.
        const { error: updateError } = await supabase
            .from('job_offer')
            .update({ was_downloaded: true })
            .eq('id', resumeId)
            .eq('user_id', userData.id);

        if (updateError) {
            // This will catch errors like the resume ID not existing
            throw new Error(updateError.message);
        }

        return NextResponse.json(
            { message: 'Successfully marked as downloaded.' },
            { status: 200 },
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'An unexpected error occurred';
        console.error('Error marking resume as downloaded:', errorMessage);
        return NextResponse.json(
            { message: `Database update failed: ${errorMessage}` },
            { status: 500 },
        );
    }
}
