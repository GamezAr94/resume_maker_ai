// PERSONAL FORM

// Initial state for the personal form errors
export const emptyStatePersonal: FormPersonalStructure = {
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    other_url: '',
};
// Interface for the form personal structure
export interface FormPersonalStructure {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    linkedin_url: string;
    github_url: string;
    portfolio_url: string;
    other_url: string;
}

//EXPERIENCE FORM
// Initial state for the experience form errors
export const emptyStateExperience: FormExperienceStructure = {
    id: '',
    company: '',
    title: '',
    start_date: '',
    end_date: '',
    responsabilities: [],
    is_current: false,
    display: true, // Optional field to control visibility in the UI
};
// Interface for the form experience structure
export interface FormExperienceStructure {
    id: string;
    company: string;
    title: string;
    start_date: Date | string;
    end_date: Date | string | null;
    responsabilities: string[];
    is_current?: boolean | null; // Optional field to indicate if the job is current
    display?: boolean; // Optional field to control visibility in the UI
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
    end_date: Date | string | null;
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
// The individual items within sections (like a single job experience)
// remain the same.
interface ContactInfo {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
}

export interface Experience {
    company: string;
    display: boolean;
    start_end_dates: string;
    title: string;
    location: string;
    responsabilities: string;
}

export interface Education {
    degree: string;
    major: string | null;
    minor: string | null;
    location: string | null;
    gpa: string | null;
    honor_awards: string[] | null;
    school: string;
    start_end_dates: string;
    display: boolean;
}

export interface Project {
    name: string;
    description: string;
    display: boolean;
    relevance: string;
    start_end_dates: string;
}

// NEW: Define the structure for each type of section.
// This uses a discriminated union based on the `type` property,
// which is excellent for rendering and type safety.

export interface NarrativeSection {
    id: 'narrative';
    type: 'narrative';
    title: string;
    display: boolean;
    items: string[];
}

export interface ExperienceSection {
    id: 'experience';
    type: 'experience';
    title: 'Work Experience';
    display: boolean;
    items: Experience[];
}

export interface EducationSection {
    id: 'education';
    type: 'education';
    title: 'Education';
    display: boolean;
    items: Education[];
}

export interface SkillsSection {
    id: 'skills';
    type: 'skills';
    title: 'Skills';
    display: boolean;
    items: string[];
}

export interface ProjectsSection {
    id: 'projects';
    type: 'projects';
    title: 'Projects';
    display: boolean;
    items: Project[];
}

// NEW: A union type representing any possible item in the resume layout.
export type ResumeLayoutItem =
    | NarrativeSection
    | ExperienceSection
    | EducationSection
    | SkillsSection
    | ProjectsSection;

// NEW: The updated main response interface.
export interface GeminiResponse {
    contact_info: ContactInfo;
    layout: ResumeLayoutItem[]; // This ordered array replaces the fixed properties.
    keywords: string[];
    recommendations: string;
    explanation: string;
    // selected_narrative can be inferred from the presence of summary vs career_objective in the layout
}

// NEW: The updated empty state for the Gemini response.
export const emptyStateGeminiReponse: GeminiResponse = {
    contact_info: {
        name: '',
        email: '',
        phone: '',
        linkedin: '',
    },
    layout: [], // Initialize with an empty layout array.
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
// This section automatically adapts because it references
// FormJobOfferDataStructure and emptyStateGeminiReponse.
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
