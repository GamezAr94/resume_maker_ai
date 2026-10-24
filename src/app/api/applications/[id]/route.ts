import { getApplicationById, deleteApplicationById } from '@/lib/db';
import { type NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
    try {
        const { id: applicationId } = await context.params;
        const data = getApplicationById(applicationId);

        if (!data) {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: NextRequest, context: any) {
    try {
        const { id: applicationId } = await context.params;
        deleteApplicationById(applicationId);

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
