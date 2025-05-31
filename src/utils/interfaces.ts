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
    skill_level: null,
};
// Interface for the form skills structure
export interface FormSkillStructure {
    id: string;
    skill_name: string;
    skill_level: string | null;
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

// ==============================

// GEMINI RESUME RESPONSE
export interface GeminiResponse {
    contact_info: ContactInfo;
    summary: string;
    career_objective: string;
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
    company: string;
    display: boolean;
    start_end_dates: string;
    title: string;
    location: string;
    responsabilities: string;
    description: string;
}

interface Education {
    degree: string;
    major: string | null;
    minor: string | null;
    location: string | null;
    gpa: string | null;
    honor_awards: string[] | null;
    school: string; // Note: I've changed this to 'university'
    start_end_dates: string;
}

interface Project {
    name: string;
    description: string;
    display: boolean;
    relevance: string;
    start_end_dates: string;
}
export const emptyStateGeminiReponse: GeminiResponse = {
    contact_info: {
        name: '',
        email: '',
        phone: '',
        linkedin: '',
    },
    summary: '',
    career_objective: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    keywords: [],
    recommendations: '',
    explanation: '',
};

// ==============================

// Trigger refresh
export interface RefreshSections {
    experience: boolean;
    education: boolean;
    skill: boolean;
    project: boolean;
    personal: boolean;
}

// ==============================

// JOB OFFER FORM
// Initial state for the job offer form errors
export const emptyStateJobDataOffer: FormJobOfferDataStructure = {
    company_name: '',
    created_at: '',
    id: '',
    job_position: '',
    job_description: '',
    resume_generated: emptyStateGeminiReponse,
};
// Interface for the form job offer structure
export interface FormJobOfferDataStructure {
    company_name: string;
    id: string | number | null;
    created_at: string | null;
    job_position: string;
    job_description: string;
    resume_generated: GeminiResponse;
}
