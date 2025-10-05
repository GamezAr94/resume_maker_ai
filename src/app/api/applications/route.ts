'use server';

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// This function handles GET requests to /api/applications
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
        // This is the same efficient query from your original function.
        // It fetches all 'job_offer' records related to the user.
        const { data: userData, error } = await supabase
            .from('user')
            .select(
                `
                job_offer (
                    id, company_name, job_position, job_description, created_at
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
            // PGRST116 means no user was found, which is not an error here.
            if (error.code === 'PGRST116') {
                return NextResponse.json([], { status: 200 }); // Return an empty array
            }
            throw new Error(error.message);
        }

        // The data is nested, so we extract it. Default to an empty array if null.
        const applications = userData?.job_offer || [];

        return NextResponse.json(applications, { status: 200 });
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'An unexpected error occurred';
        return NextResponse.json(
            { message: `Error fetching applications: ${errorMessage}` },
            { status: 500 },
        );
    }
}
