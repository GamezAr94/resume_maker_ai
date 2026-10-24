import { getAllApplications } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const applications = getAllApplications();
        return NextResponse.json(applications, { status: 200 });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json(
            { message: `Error fetching applications: ${errorMessage}` },
            { status: 500 },
        );
    }
}
