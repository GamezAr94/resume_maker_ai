// app/config/profile.config.ts

/**
 * Defines the percentage thresholds for different profile completion states.
 * This allows for easy tweaking of when a user is blocked, warned, or ready.
 */
export const PROFILE_COMPLETION_THRESHOLDS = {
    DISABLED: 30, // Any score below this value will disable the form
    WARN: 80, // Any score below this value (but above DISABLED) will show a warning
};

/**
 * Defines the weight of each item towards the 100% profile completion score.
 * This provides a granular and reliable system for calculating progress.
 * The total maximum points should ideally sum up to 100.
 */
export const PROFILE_COMPLETION_WEIGHTS = {
    // Personal Info (Max: 15 points)
    PERSONAL_INFO_FILLED: 15, // Points for having basic info (e.g., name, email)

    // Experience (Max: 40 points)
    EXPERIENCE_ENTRY: 20, // Points for EACH experience entry
    MAX_EXPERIENCE_ENTRIES_FOR_SCORE: 2, // Cap points from experience after this many entries (2 * 15 = 30)

    // Skills (Max: 25 points)
    SKILL_ENTRY: 5, // Points for EACH skill
    MAX_SKILLS_FOR_SCORE: 5, // Cap points from skills after this many entries (5 * 5 = 25)

    // Projects (Max: 10 points)
    PROJECT_ENTRY: 5, // Points for EACH project
    MAX_PROJECTS_FOR_SCORE: 2, // Cap points from projects after this many entries (2 * 5 = 10)

    // Education (Max: 10 points)
    EDUCATION_ENTRY: 10, // Points for the first education entry
    MAX_EDUCATION_FOR_SCORE: 1, // Cap points from projects after this many entries (2 * 5 = 10)
};
