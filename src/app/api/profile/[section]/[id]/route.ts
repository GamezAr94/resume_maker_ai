'use server';

import { SectionTypes } from '@/utils/enums';
import { createClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

// A whitelist of tables that are allowed to be modified via this route.
// This is a crucial security measure.
const ALLOWED_TABLES = [
    SectionTypes.Experience,
    SectionTypes.Education,
    SectionTypes.Skill,
    SectionTypes.Project,
];

// Add this comment to disable the ESLint rule for the next line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: NextRequest, context: any) {
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

    // The rest of your code remains the same
    const { section, id } = await context.params;

    if (!ALLOWED_TABLES.includes(section as SectionTypes)) {
        return NextResponse.json(
            { message: 'Invalid section specified' },
            { status: 400 },
        );
    }

    try {
        const { data: userData, error: userError } = await supabase
            .from('user')
            .select('id')
            .eq('supabase_id', user.id)
            .single();

        if (userError || !userData) {
            throw new Error('User profile not found.');
        }

        const { error: deleteError } = await supabase
            .from(section)
            .delete()
            .eq('id', id)
            .eq('user_id', userData.id);

        if (deleteError) {
            throw new Error(deleteError.message);
        }

        return NextResponse.json(
            { message: 'Record successfully deleted.' },
            { status: 200 },
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'An unexpected error occurred';
        return NextResponse.json(
            { message: `Error deleting record: ${errorMessage}` },
            { status: 500 },
        );
    }
}
