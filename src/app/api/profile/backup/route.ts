import { NextResponse } from 'next/server';
import { getAllProfileSections, saveSectionRecord, deleteProfileSectionRecord } from '@/lib/db';
import { SectionTypes } from '@/utils/enums';

// GET /api/profile/backup -> Exports entire profile as a JSON file
export async function GET() {
    try {
        const data = getAllProfileSections();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to export profile', error: String(error) },
            { status: 500 },
        );
    }
}

// POST /api/profile/backup -> Imports a JSON profile (from Supabase export or backup)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clearExisting = false, userInfo, experienceInfo, educationInfo, skillInfo, projectInfo } = body;

        // Optionally wipe current profile records before importing (great for switching test profiles)
        if (clearExisting) {
            const current = getAllProfileSections();
            for (const proj of current.projectInfo) {
                if (proj.id) deleteProfileSectionRecord(SectionTypes.Project, proj.id as string | number);
            }
            for (const exp of current.experienceInfo) {
                if (exp.id) deleteProfileSectionRecord(SectionTypes.Experience, exp.id as string | number);
            }
            for (const edu of current.educationInfo) {
                if (edu.id) deleteProfileSectionRecord(SectionTypes.Education, edu.id as string | number);
            }
            for (const sk of current.skillInfo) {
                if (sk.id) deleteProfileSectionRecord(SectionTypes.Skill, sk.id as string | number);
            }
        }

        if (userInfo) {
            saveSectionRecord(SectionTypes.Personal, userInfo);
        }

        if (Array.isArray(experienceInfo)) {
            for (const exp of experienceInfo) {
                const { id: _ignoreId, ...expData } = exp;
                saveSectionRecord(SectionTypes.Experience, expData);
            }
        }

        if (Array.isArray(educationInfo)) {
            for (const edu of educationInfo) {
                const { id: _ignoreId, ...eduData } = edu;
                saveSectionRecord(SectionTypes.Education, eduData);
            }
        }

        if (Array.isArray(skillInfo)) {
            for (const sk of skillInfo) {
                const { id: _ignoreId, ...skData } = sk;
                saveSectionRecord(SectionTypes.Skill, skData);
            }
        }

        if (Array.isArray(projectInfo)) {
            for (const proj of projectInfo) {
                const { id: _ignoreId, experience_id: _expId, education_id: _eduId, ...projData } = proj;
                saveSectionRecord(SectionTypes.Project, projData);
            }
        }

        return NextResponse.json({ message: 'Profile imported successfully!' }, { status: 200 });
    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json(
            { message: 'Failed to import profile JSON', error: String(error) },
            { status: 500 },
        );
    }
}
