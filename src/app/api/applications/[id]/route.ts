'use server';

import { createClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { type SupabaseClient } from '@supabase/supabase-js';

// Helper function to get the internal user ID from Supabase Auth ID
async function getUserId(supabase: SupabaseClient) {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
        return { userId: null, error: 'Not authenticated' };
    }

    const { data: userData, error: userError } = await supabase
        .from('user')
        .select('id')
        .eq('supabase_id', user.id)
        .single();
    if (userError || !userData) {
        return { userId: null, error: 'User profile not found.' };
    }

    return { userId: userData.id, error: null };
}

// --- GET Handler ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
    try {
        const supabase = await createClient();
        const { id: applicationId } = context.params;

        const { userId, error: userError } = await getUserId(supabase);
        if (userError) {
            const status = userError === 'Not authenticated' ? 401 : 404;
            return NextResponse.json({ message: userError }, { status });
        }

        const { data, error } = await supabase
            .from('job_offer')
            .select(`*`)
            .eq('id', applicationId)
            .eq('user_id', userId)
            .single();
        if (error) {
            return NextResponse.json(
                { message: 'Application not found' },
                { status: 404 },
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Unexpected error in GET handler:', error);
        return NextResponse.json(
            { message: 'An unexpected error occurred.' },
            { status: 500 },
        );
    }
}

// --- DELETE Handler ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: NextRequest, context: any) {
    try {
        const supabase = await createClient();
        const { id: applicationId } = context.params;

        const { userId, error: userError } = await getUserId(supabase);
        if (userError) {
            const status = userError === 'Not authenticated' ? 401 : 404;
            return NextResponse.json({ message: userError }, { status });
        }

        const { error: deleteError } = await supabase
            .from('job_offer')
            .delete()
            .eq('id', applicationId)
            .eq('user_id', userId);
        if (deleteError) {
            console.error('Supabase delete error:', deleteError.message);
            return NextResponse.json(
                { message: 'Failed to delete application.' },
                { status: 500 },
            );
        }

        return NextResponse.json(
            { message: 'Application successfully deleted.' },
            { status: 200 },
        );
    } catch (error) {
        console.error('Unexpected error in DELETE handler:', error);
        return NextResponse.json(
            { message: 'An unexpected error occurred.' },
            { status: 500 },
        );
    }
}
