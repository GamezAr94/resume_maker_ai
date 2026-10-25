// src/app/config/ai.config.ts
// Central configuration for AI providers and models used across the application.

export const AI_CONFIG = {
    provider: "google-gemini",
    apiKeyEnvVar: "GEMINI_API_KEY",

    models: {
        // Stage 1: Fast indexing, keyword extraction, and project selection
        scout: process.env.GEMINI_SCOUT_MODEL || "gemini-2.5-flash",

        // Stage 2: Deep resume bullet tailoring and layout synthesis
        writer: process.env.GEMINI_WRITER_MODEL || "gemini-2.5-flash",

        // Stage 3 (On-Demand): Candidate fit analysis, interview prep & outreach writing
        careerCoach: process.env.GEMINI_COACH_MODEL || "gemini-2.5-flash",

        // Onboarding: Extracting structured JSON from raw PDF/DOCX text
        profileImporter: process.env.GEMINI_IMPORT_MODEL || "gemini-2.5-flash",
    },
};
