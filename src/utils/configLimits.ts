export const CHARACTER_LIMITS = {
    // --- Personal ---
    name: 50,
    phone: 30,
    url: 200,
    // --- Education ---
    school: 100,
    degree: 100,
    fieldOfStudy: 100,
    grades: 30,
    // --- Experience & Projects ---
    title: 120,
    company: 100,
    description: 1500, // Generous limit for context / problem solved
    bulletPoint: 500,  // Generous limit for detailed STAR bullets & metrics
    techItem: 60,      // Fits long tech names like "Google Cloud Platform (GCP)"
    // --- Skills ---
    skill: 60,         // Raised from 20 -> 60
    // --- Job Offer ---
    jobDescription: 15000,
};
