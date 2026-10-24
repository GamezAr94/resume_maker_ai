import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { SectionTypes } from '@/utils/enums';

let dbInstance: Database.Database | null = null;

function getDb(): Database.Database {
    if (dbInstance) {
        return dbInstance;
    }

    // Store the SQLite file in ./data/resume_maker.db (easy to mount as a Docker volume)
    const DATA_DIR = path.join(process.cwd(), 'data');
    if (!fs.existsSync(/*turbopackIgnore: true*/ DATA_DIR)) {
        fs.mkdirSync(/*turbopackIgnore: true*/ DATA_DIR, { recursive: true });
    }

    const DB_PATH = path.join(DATA_DIR, 'resume_maker.db');
    const db = new Database(DB_PATH, { timeout: 10000 });

    // Enable WAL mode for fast concurrent reads/writes
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Initialize Schema
    db.exec(`
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            first_name TEXT DEFAULT '',
            last_name TEXT DEFAULT '',
            email TEXT DEFAULT '',
            phone TEXT DEFAULT '',
            linkedin_url TEXT DEFAULT '',
            github_url TEXT DEFAULT '',
            portfolio_url TEXT DEFAULT '',
            other_url TEXT DEFAULT ''
        );

        INSERT OR IGNORE INTO user (id, first_name, last_name, email)
        VALUES (1, '', '', '');

        CREATE TABLE IF NOT EXISTS experience (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL DEFAULT 1,
            company_name TEXT NOT NULL,
            job_title TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT,
            description TEXT DEFAULT '',
            is_current INTEGER DEFAULT 0,
            details TEXT DEFAULT '{}'
        );

        CREATE TABLE IF NOT EXISTS education (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL DEFAULT 1,
            school_name TEXT NOT NULL,
            degree TEXT NOT NULL,
            field_of_study TEXT NOT NULL,
            grades TEXT,
            start_date TEXT NOT NULL,
            end_date TEXT,
            is_current INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS skill (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL DEFAULT 1,
            skill_name TEXT NOT NULL,
            skill_level TEXT DEFAULT '2'
        );

        CREATE TABLE IF NOT EXISTS project (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL DEFAULT 1,
            project_name TEXT NOT NULL,
            project_description TEXT DEFAULT '',
            experience_id INTEGER,
            education_id INTEGER,
            details TEXT DEFAULT '{}',
            FOREIGN KEY (experience_id) REFERENCES experience(id) ON DELETE SET NULL,
            FOREIGN KEY (education_id) REFERENCES education(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS job_offer (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL DEFAULT 1,
            company_name TEXT NOT NULL,
            job_position TEXT NOT NULL,
            job_description TEXT NOT NULL,
            resume_generated TEXT NOT NULL DEFAULT '{}',
            was_downloaded INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );
    `);

    dbInstance = db;
    return dbInstance;
}

function safeJsonParse<T>(str: string | null | undefined, fallback: T): T {
    if (!str) return fallback;
    try {
        return JSON.parse(str) as T;
    } catch {
        return fallback;
    }
}

// ==========================================
// EXPORTED MODULAR DATABASE FUNCTIONS
// ==========================================

export function getUserProfile() {
    const db = getDb();
    return db.prepare('SELECT * FROM user WHERE id = 1').get() as Record<string, unknown>;
}

export function getAllProfileSections() {
    const db = getDb();
    const userInfo = getUserProfile();

    const rawExperiences = db
        .prepare('SELECT * FROM experience WHERE user_id = 1 ORDER BY id DESC')
        .all() as Record<string, unknown>[];
    const experienceInfo = rawExperiences.map((row) => ({
        ...row,
        is_current: Boolean(row.is_current),
        details: safeJsonParse(row.details as string, {
            summary: '',
            responsibilities: [],
            achievements: [],
            skills_used: [],
        }),
    }));

    const rawEducation = db
        .prepare('SELECT * FROM education WHERE user_id = 1 ORDER BY id DESC')
        .all() as Record<string, unknown>[];
    const educationInfo = rawEducation.map((row) => ({
        ...row,
        is_current: Boolean(row.is_current),
    }));

    const rawSkills = db
        .prepare('SELECT * FROM skill WHERE user_id = 1 ORDER BY id DESC')
        .all() as Record<string, unknown>[];
    const skillInfo = rawSkills.map((row) => ({
        ...row,
        id: String(row.id),
        skill_level: row.skill_level ? String(row.skill_level) : null,
    }));

    const rawProjects = db
        .prepare('SELECT * FROM project WHERE user_id = 1 ORDER BY id DESC')
        .all() as Record<string, unknown>[];
    const projectInfo = rawProjects.map((row) => {
        const details = safeJsonParse(row.details as string, {
            problem_solved: '',
            key_features: [],
            tech_stack: [],
            url: '',
        });
        return {
            ...row,
            project_description:
                (row.project_description as string) || details.problem_solved || '',
            details,
        };
    });

    return {
        userInfo,
        experienceInfo,
        educationInfo,
        skillInfo,
        projectInfo,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveSectionRecord(type: SectionTypes, data: any): number | string {
    const db = getDb();
    switch (type) {
        case SectionTypes.Personal: {
            db.prepare(`
                UPDATE user
                SET first_name = ?, last_name = ?, email = ?, phone = ?,
                    linkedin_url = ?, github_url = ?, portfolio_url = ?, other_url = ?
                WHERE id = 1
            `).run(
                data.first_name || '',
                data.last_name || '',
                data.email || '',
                data.phone || '',
                data.linkedin_url || '',
                data.github_url || '',
                data.portfolio_url || '',
                data.other_url || '',
            );
            return 1;
        }

        case SectionTypes.Experience: {
            const detailsJson = JSON.stringify(data.details || {});
            const isCurrent = data.is_current ? 1 : 0;
            const endDate = data.is_current ? null : data.end_date || null;

            if (data.id) {
                db.prepare(`
                    UPDATE experience
                    SET company_name = ?, job_title = ?, start_date = ?, end_date = ?,
                        is_current = ?, details = ?
                    WHERE id = ? AND user_id = 1
                `).run(
                    data.company_name,
                    data.job_title,
                    data.start_date,
                    endDate,
                    isCurrent,
                    detailsJson,
                    Number(data.id),
                );
                return Number(data.id);
            } else {
                const info = db.prepare(`
                    INSERT INTO experience (user_id, company_name, job_title, start_date, end_date, is_current, details)
                    VALUES (1, ?, ?, ?, ?, ?, ?)
                `).run(
                    data.company_name,
                    data.job_title,
                    data.start_date,
                    endDate,
                    isCurrent,
                    detailsJson,
                );
                return Number(info.lastInsertRowid);
            }
        }

        case SectionTypes.Education: {
            const isCurrent = data.is_current ? 1 : 0;
            const endDate = data.is_current ? null : data.end_date || null;
            const grades = data.grades || null;

            if (data.id) {
                db.prepare(`
                    UPDATE education
                    SET school_name = ?, degree = ?, field_of_study = ?, grades = ?,
                        start_date = ?, end_date = ?, is_current = ?
                    WHERE id = ? AND user_id = 1
                `).run(
                    data.school_name,
                    data.degree,
                    data.field_of_study,
                    grades,
                    data.start_date,
                    endDate,
                    isCurrent,
                    Number(data.id),
                );
                return Number(data.id);
            } else {
                const info = db.prepare(`
                    INSERT INTO education (user_id, school_name, degree, field_of_study, grades, start_date, end_date, is_current)
                    VALUES (1, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    data.school_name,
                    data.degree,
                    data.field_of_study,
                    grades,
                    data.start_date,
                    endDate,
                    isCurrent,
                );
                return Number(info.lastInsertRowid);
            }
        }

        case SectionTypes.Skill: {
            const skillLevel = data.skill_level || null;
            if (data.id) {
                db.prepare(`
                    UPDATE skill
                    SET skill_name = ?, skill_level = ?
                    WHERE id = ? AND user_id = 1
                `).run(data.skill_name, skillLevel, Number(data.id));
                return Number(data.id);
            } else {
                const info = db.prepare(`
                    INSERT INTO skill (user_id, skill_name, skill_level)
                    VALUES (1, ?, ?)
                `).run(data.skill_name, skillLevel);
                return Number(info.lastInsertRowid);
            }
        }

        case SectionTypes.Project: {
            const detailsJson = JSON.stringify(data.details || {});
            const description = data.details?.problem_solved || '';
            const expId = data.experience_id ? Number(data.experience_id) : null;
            const eduId = !expId && data.education_id ? Number(data.education_id) : null;

            if (data.id) {
                db.prepare(`
                    UPDATE project
                    SET project_name = ?, project_description = ?, experience_id = ?,
                        education_id = ?, details = ?
                    WHERE id = ? AND user_id = 1
                `).run(
                    data.project_name,
                    description,
                    expId,
                    eduId,
                    detailsJson,
                    Number(data.id),
                );
                return Number(data.id);
            } else {
                const info = db.prepare(`
                    INSERT INTO project (user_id, project_name, project_description, experience_id, education_id, details)
                    VALUES (1, ?, ?, ?, ?, ?)
                `).run(
                    data.project_name,
                    description,
                    expId,
                    eduId,
                    detailsJson,
                );
                return Number(info.lastInsertRowid);
            }
        }

        case SectionTypes.JobOffer: {
            const resumeJson =
                typeof data.resume_generated === 'string'
                    ? data.resume_generated
                    : JSON.stringify(data.resume_generated || {});

            if (data.id) {
                db.prepare(`
                    UPDATE job_offer
                    SET company_name = ?, job_position = ?, job_description = ?, resume_generated = ?
                    WHERE id = ? AND user_id = 1
                `).run(
                    data.company_name,
                    data.job_position,
                    data.job_description,
                    resumeJson,
                    Number(data.id),
                );
                return Number(data.id);
            } else {
                const info = db.prepare(`
                    INSERT INTO job_offer (user_id, company_name, job_position, job_description, resume_generated)
                    VALUES (1, ?, ?, ?, ?)
                `).run(
                    data.company_name,
                    data.job_position,
                    data.job_description,
                    resumeJson,
                );
                return Number(info.lastInsertRowid);
            }
        }

        default:
            throw new Error(`Unsupported section type: ${type}`);
    }
}

export function deleteProfileSectionRecord(section: SectionTypes, id: string | number) {
    const db = getDb();
    const allowed: Record<string, string> = {
        [SectionTypes.Experience]: 'experience',
        [SectionTypes.Education]: 'education',
        [SectionTypes.Skill]: 'skill',
        [SectionTypes.Project]: 'project',
    };
    const tableName = allowed[section];
    if (!tableName) {
        throw new Error('Invalid section specified');
    }
    db.prepare(`DELETE FROM ${tableName} WHERE id = ? AND user_id = 1`).run(Number(id));
}

export function getAllApplications() {
    const db = getDb();
    const rows = db
        .prepare(
            'SELECT id, company_name, job_position, job_description, created_at FROM job_offer WHERE user_id = 1 ORDER BY id DESC',
        )
        .all() as Record<string, unknown>[];

    return rows.map((r) => ({
        ...r,
        id: String(r.id),
    }));
}

export function getApplicationById(id: string | number) {
    const db = getDb();
    const row = db
        .prepare('SELECT * FROM job_offer WHERE id = ? AND user_id = 1')
        .get(Number(id)) as Record<string, unknown> | undefined;

    if (!row) return null;

    return {
        ...row,
        was_downloaded: Boolean(row.was_downloaded),
        resume_generated: safeJsonParse(row.resume_generated as string, {}),
    };
}

export function deleteApplicationById(id: string | number) {
    const db = getDb();
    db.prepare('DELETE FROM job_offer WHERE id = ? AND user_id = 1').run(Number(id));
}
