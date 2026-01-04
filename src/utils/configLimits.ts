export const CHARACTER_LIMITS = {
    // --- Personal ---
    name: 30,
    phone: 20,
    url: 100, // A standard length for URLs

    // --- Education ---
    school: 60,
    degree: 60,
    fieldOfStudy: 60,
    grades: 10,

    // --- Experience & Projects ---
    title: 90, // Reusable for Job Title and Project Name
    company: 70,
    description: 500, // Used for Summary / Problem Solved

    bulletPoint: 300, // For Responsibilities, Achievements, Features (generous for a bullet)
    techItem: 50, // For individual skills/tech stack (e.g. "Google Cloud Platform")

    // --- Skills ---
    skill: 20,

    // --- Job Offer ---
    jobDescription: 10000, // A very high limit for pasting full job descriptions
};
