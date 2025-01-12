// PERSONAL FORM

// Initial state for the personal form errors
export const emptyStatePersonal: FormPersonalStructure = {
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    linkedin: '',
    github: '',
    portfolio: '',
    link: '',
};
// Interface for the form personal structure
export interface FormPersonalStructure {
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    linkedin: string;
    github: string;
    portfolio: string;
    link: string;
}

//EXPERIENCE FORM
// Initial state for the experience form errors
export const emptyStateExperience: FormExperienceStructure = {
    id: '',
    company_name: '',
    job_title: '',
    start_date: '',
    end_date: '',
    description: '',
};
// Interface for the form experience structure
export interface FormExperienceStructure {
    id: string;
    company_name: string;
    job_title: string;
    start_date: Date | string;
    end_date: Date | string;
    description: string;
}

// EDUCATION FORM
// Initial state for the education form errors
export const emptyStateEducation: FormEducationStructure = {
    id: '',
    school_name: '',
    field_of_study: '',
    degree: '',
    is_current: null,
    end_date: '',
    start_date: '',
    grades: '',
};
// Interface for the form education structure
export interface FormEducationStructure {
    id: string;
    school_name: string;
    field_of_study: string;
    degree: string;
    is_current: boolean | null;
    start_date: Date | string;
    end_date: Date | string;
    grades: string;
}

// SKILLS FORM
// Initial state for the skills form errors
export const emptyStateSkill: FormSkillStructure = {
    id: '',
    skill_name: '',
    skill_level: '',
};
// Interface for the form skills structure
export interface FormSkillStructure {
    id: string;
    skill_name: string;
    skill_level: string;
}

// PROJECT FORM
// Initial state for the project form errors
export const emptyStateProject: FormProjectStructure = {
    id: '',
    project_name: '',
    project_description: '',
    experience_id: null,
    education_id: null,
};
// Interface for the form project structure
export interface FormProjectStructure {
    id: string;
    project_name: string;
    project_description: string;
    experience_id: string | null;
    education_id: string | null;
}

// JOB OFFER FORM
// Initial state for the job offer form errors
export const emptyStateJobOffer: FormJobOfferStructure = {
    company_name: '',
    job_position: '',
    job_description: '',
    resume_generated: '',
};
// Interface for the form job offer structure
export interface FormJobOfferStructure {
    company_name: string;
    job_position: string;
    job_description: string;
    resume_generated: string;
}

// ==============================

// GEMINI RESUME RESPONSE
interface GeminiResponse {
    contact_info: ContactInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    projects: Project[];
    keywords: string[];
    recommendations: string;
    explanation: string;
}
interface ContactInfo {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
}

interface Experience {
    title: string;
    company: string;
    years: string; // Note: I've changed this to 'years' to match your response
    description: string;
    relevance: string;
}

interface Education {
    degree: string;
    university: string; // Note: I've changed this to 'university'
    years: string;
}

interface Project {
    name: string;
    description: string;
    relevance: string;
}

// ==============================

// Trigger refresh
export interface RefreshSections {
    experience: boolean;
    education: boolean;
    skill: boolean;
    project: boolean;
    personal: boolean;
}
