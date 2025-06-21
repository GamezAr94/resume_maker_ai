// utils/profile-completeness.ts

import {
    PROFILE_COMPLETION_THRESHOLDS,
    PROFILE_COMPLETION_WEIGHTS,
} from '@/app/config/profile.config';

import {
    FormPersonalStructure,
    FormExperienceStructure,
    FormSkillStructure,
    FormProjectStructure,
    FormEducationStructure,
} from './interfaces';

type UserData = {
    userInfo: FormPersonalStructure | null;
    experienceInfo: FormExperienceStructure[];
    skillInfo: FormSkillStructure[];
    projectInfo: FormProjectStructure[];
    educationInfo: FormEducationStructure[];
};

type CompletenessResult = {
    percentage: number;
    status: 'disabled' | 'warn' | 'ready';
};

/**
 * Calculates the completeness of a user's profile based on various sections.
 *
 * This function takes a user's data and computes a score based on the presence
 * and quantity of information in different categories (personal info, experience,
 * skills, projects, education). The final score is converted to a percentage
 * and a corresponding status is determined based on predefined thresholds.
 *
 * @param data - The user's profile data, containing all the necessary information.
 * @returns An object with two properties:
 *          - `percentage`: A number from 0 to 100 representing the profile completeness.
 *          - `status`: A string ('disabled', 'warn', or 'ready') indicating the profile's readiness level.
 */
export function calculateProfileCompleteness(
    data: UserData,
): CompletenessResult {
    let score = 0;

    // Personal Info Score
    if (data.userInfo?.first_name && data.userInfo?.email) {
        score += PROFILE_COMPLETION_WEIGHTS.PERSONAL_INFO_FILLED;
    }

    // Experience Score
    const numExperience = Math.min(
        data.experienceInfo.length,
        PROFILE_COMPLETION_WEIGHTS.MAX_EXPERIENCE_ENTRIES_FOR_SCORE,
    );
    score += numExperience * PROFILE_COMPLETION_WEIGHTS.EXPERIENCE_ENTRY;

    // Skills Score
    const numSkills = Math.min(
        data.skillInfo.length,
        PROFILE_COMPLETION_WEIGHTS.MAX_SKILLS_FOR_SCORE,
    );
    score += numSkills * PROFILE_COMPLETION_WEIGHTS.SKILL_ENTRY;

    // Projects Score
    const numProjects = Math.min(
        data.projectInfo.length,
        PROFILE_COMPLETION_WEIGHTS.MAX_PROJECTS_FOR_SCORE,
    );
    score += numProjects * PROFILE_COMPLETION_WEIGHTS.PROJECT_ENTRY;

    // Education Score
    if (data.educationInfo.length > 0) {
        score += PROFILE_COMPLETION_WEIGHTS.EDUCATION_ENTRY;
    }

    const percentage = Math.min(100, score); // Ensure score doesn't exceed 100

    let status: 'disabled' | 'warn' | 'ready';
    if (percentage < PROFILE_COMPLETION_THRESHOLDS.DISABLED) {
        status = 'disabled';
    } else if (percentage < PROFILE_COMPLETION_THRESHOLDS.WARN) {
        status = 'warn';
    } else {
        status = 'ready';
    }

    return { percentage, status };
}
