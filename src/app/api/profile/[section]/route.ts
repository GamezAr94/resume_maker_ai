'use server';

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// This function handles GET requests to /api/profile/all-sections
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
        // This is the magic: A single query to Supabase that fetches the user
        // and all of their related profile items (experience, education, etc.)
        const { data, error } = await supabase
            .from('user')
            .select(
                `
                *,
                experience (*),
                education (*),
                skill (*),
                project (*)
            `,
            )
            .eq('supabase_id', user.id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        // The data object now contains everything we need.
        // We can destructure it to create a clean response object.
        const { experience, education, skill, project, ...userInfo } = data;

        const allData = {
            userInfo,
            experienceInfo: experience || [],
            educationInfo: education || [],
            skillInfo: skill || [],
            projectInfo: project || [],
        };

        return NextResponse.json(allData, { status: 200 });
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'An unexpected error occurred';
        return NextResponse.json(
            { message: `Error fetching all profile data: ${errorMessage}` },
            { status: 500 },
        );
    }
}
