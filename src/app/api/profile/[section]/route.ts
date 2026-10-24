import { getAllProfileSections } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const allData = getAllProfileSections();
        return NextResponse.json(allData, { status: 200 });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json(
            { message: `Error fetching all profile data: ${errorMessage}` },
            { status: 500 },
        );
    }
}
