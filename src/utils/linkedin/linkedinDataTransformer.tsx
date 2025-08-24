import {
    FormPersonalStructure,
    FormExperienceStructure,
    FormEducationStructure,
    FormSkillStructure,
    FormProjectStructure,
} from '@/utils/interfaces'; // Assuming your interfaces are here

// Define a structure for the raw parsed data from the CSV files.
interface ParsedLinkedInData {
    profile?: any[];
    positions?: any[];
    education?: any[];
    skills?: any[];
    projects?: any[];
}

// Define the structure for the final, clean data.
export interface TransformedData {
    personal: FormPersonalStructure | null;
    experience: FormExperienceStructure[];
    education: FormEducationStructure[];
    skills: FormSkillStructure[];
    projects: FormProjectStructure[];
}

function parseWebsites(websitesString: string | undefined) {
    const urls = {
        portfolio_url: '',
        github_url: '',
        other_url: '',
    };

    if (!websitesString) {
        return urls;
    }

    // Split by comma and filter out any empty strings that might result
    const parts = websitesString
        .split(',')
        .filter((part) => part.trim() !== '');

    for (const part of parts) {
        // Remove the brackets and split by the first colon
        const content = part.replace(/[\[\]]/g, '');
        const [type, ...urlParts] = content.split(':');
        const url = urlParts.join(':');

        if (!type || !url) continue;

        const typeClean = type.trim().toUpperCase();

        if (typeClean === 'PORTFOLIO') {
            if (!urls.portfolio_url) urls.portfolio_url = url;
        } else if (typeClean === 'GITHUB') {
            // Also check for GITHUB specifically
            if (!urls.github_url) urls.github_url = url;
        } else {
            // Put the first "other" URL found into the other_url field
            if (!urls.other_url) urls.other_url = url;
        }
    }

    return urls;
}

/**
 * Transforms raw data parsed from LinkedIn CSVs into the application's data structures.
 * @param {ParsedLinkedInData} rawData - The raw data from PapaParse.
 * @returns {TransformedData} - The data structured for your application's state.
 */
export function transformLinkedInData(
    rawData: ParsedLinkedInData,
): TransformedData {
    const websiteData = parseWebsites(rawData.profile?.[0]?.['Websites']);
    // --- Personal Info Transformer ---
    const personal = rawData.profile?.[0]
        ? {
              first_name: rawData.profile[0]['First Name'] || '',
              last_name: rawData.profile[0]['Last Name'] || '',
              email: rawData.profile[0]['Email Address'] || '',
              phone: rawData.profile[0]['Phone Number'] || '',
              linkedin_url: rawData.profile[0]['Profile Link'] || '',
              github_url: websiteData.github_url,
              portfolio_url: websiteData.portfolio_url,
              other_url: websiteData.other_url,
          }
        : null;

    // --- Experience Transformer ---
    const experience =
        rawData.positions?.map(
            (pos: any): FormExperienceStructure => ({
                id: crypto.randomUUID(),
                company_name: pos['Company Name'] || '', // CORRECTED
                job_title: pos['Title'] || '', // CORRECTED
                start_date: pos['Started On'] || '', // CORRECTED
                end_date: pos['Finished On'] || '', // CORRECTED
                description: pos['Description'] || '',
                is_current: !pos['Finished On'], // CORRECTED
                display: true,
            }),
        ) || [];

    // --- Education Transformer ---
    const education =
        rawData.education?.map(
            (edu: any): FormEducationStructure => ({
                id: crypto.randomUUID(),
                school_name: edu['School Name'] || '', // CORRECTED
                field_of_study: edu['Field Of Study'] || '', // CORRECTED
                degree: edu['Degree Name'] || '',
                is_current: !edu['End Date'], // CORRECTED
                start_date: edu['Start Date'] || '', // CORRECTED
                end_date: edu['End Date'] || '', // CORRECTED
                grades: '', // CORRECTED: Was 'gpa'
            }),
        ) || [];

    // --- Skills Transformer ---
    const skills =
        rawData.skills?.map(
            (skill: any): FormSkillStructure => ({
                id: crypto.randomUUID(),
                skill_name: skill['Name'] || '', // CORRECTED
                skill_level: 'Beginner', // Default value
            }),
        ) || [];

    // --- Projects Transformer ---
    const projects =
        rawData.projects?.map(
            (proj: any): FormProjectStructure => ({
                id: crypto.randomUUID(),
                project_name: proj['Title'] || '', // CORRECTED
                project_description: proj['Description'] || '', // CORRECTED
                experience_id: null,
                education_id: null,
            }),
        ) || [];

    // This return statement now correctly matches the TransformedData interface
    return { personal, experience, education, skills, projects };
}
