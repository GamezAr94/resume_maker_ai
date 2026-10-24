import { getUserProfile } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = getUserProfile();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json(
            { message: `Error fetching user profile: ${errorMessage}` },
            { status: 500 },
        );
    }
}
