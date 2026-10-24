import { SectionTypes } from '@/utils/enums';
import { deleteProfileSectionRecord } from '@/lib/db';
import { type NextRequest, NextResponse } from 'next/server';

const ALLOWED_TABLES = [
    SectionTypes.Experience,
    SectionTypes.Education,
    SectionTypes.Skill,
    SectionTypes.Project,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: NextRequest, context: any) {
    const { section, id } = await context.params;

    if (!ALLOWED_TABLES.includes(section as SectionTypes)) {
        return NextResponse.json(
            { message: 'Invalid section specified' },
            { status: 400 },
        );
    }

    try {
        deleteProfileSectionRecord(section as SectionTypes, id);
        return NextResponse.json(
            { message: 'Record successfully deleted.' },
            { status: 200 },
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json(
            { message: `Error deleting record: ${errorMessage}` },
            { status: 500 },
        );
    }
}
