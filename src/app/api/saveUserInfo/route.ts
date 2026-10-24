import { ZodError, z } from 'zod';
import { SectionTypes } from '@/utils/enums';
import {
    personalInfoSchema,
    experienceSchema,
    educationSchema,
    skillSchema,
    projectSchema,
    jobOfferSchema,
} from '@/utils/zod_schemas';
import { saveSectionRecord } from '@/lib/db';

function formatZodError(error: ZodError): string {
    const firstError = error.issues[0];
    if (firstError) {
        return `${firstError.path.join('.')}: ${firstError.message}`;
    }
    return 'Invalid data submitted.';
}

export async function POST(req: Request) {
    try {
        const requestBody = await req.json();
        const type: SectionTypes = requestBody.type;
        const requestBodyData = requestBody.data;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let schema: z.ZodType<any>;

        switch (type) {
            case SectionTypes.Personal:
                schema = personalInfoSchema;
                break;
            case SectionTypes.Experience:
                schema = experienceSchema;
                break;
            case SectionTypes.Education:
                schema = educationSchema;
                break;
            case SectionTypes.Skill:
                schema = skillSchema;
                break;
            case SectionTypes.Project:
                schema = projectSchema;
                break;
            case SectionTypes.JobOffer:
                schema = jobOfferSchema;
                break;
            default:
                return new Response(
                    JSON.stringify({ message: 'Invalid section type provided.' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } },
                );
        }

        const validationResult = schema.safeParse(requestBodyData);

        if (!validationResult.success) {
            console.error(
                'Zod validation failed:',
                validationResult.error.flatten(),
            );
            return new Response(
                JSON.stringify({ message: formatZodError(validationResult.error) }),
                { status: 400, headers: { 'Content-Type': 'application/json' } },
            );
        }

        const savedId = saveSectionRecord(type, validationResult.data);

        return new Response(
            JSON.stringify({
                message: `${type} section was stored successfully.`,
                id: savedId,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                message:
                    'An unexpected error occurred: ' + (error as Error).message,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
        );
    }
}
