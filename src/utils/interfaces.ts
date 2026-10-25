// Initial state for the personal form errors
export const emptyStatePersonal: FormPersonalStructure = {
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    other_url: "",
};

export interface FormPersonalStructure {
    id?: number | string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    linkedin_url: string;
    github_url: string;
    portfolio_url: string;
    other_url: string;
}

// EXPERIENCE FORM
export interface ExperienceDetails {
    summary: string;
    responsibilities: string[];
    achievements: string[];
    skills_used: string[];
}

export const emptyStateExperience: FormExperienceStructure = {
    id: "",
    company_name: "",
    job_title: "",
    start_date: "",
    end_date: "",
    description: "",
    is_current: false,
    display: true,
    details: {
        summary: "",
        responsibilities: [],
        achievements: [],
        skills_used: [],
    },
};

export interface FormExperienceStructure {
    id: string;
    company_name: string;
    job_title: string;
    start_date: Date | string;
    end_date: Date | string | null;
    description: string;
    is_current?: boolean | null;
    display?: boolean;
    details: ExperienceDetails;
}

// EDUCATION FORM
export const emptyStateEducation: FormEducationStructure = {
    id: "",
    school_name: "",
    field_of_study: "",
    degree: "",
    is_current: null,
    end_date: "",
    start_date: "",
    grades: "",
};

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
export const emptyStateSkill: FormSkillStructure = {
    id: "",
    skill_name: "",
    skill_level: null,
    skill_category: "General",
};

export interface FormSkillStructure {
    id: string;
    skill_name: string;
    skill_level: string | null;
    skill_category?: string | null;
}

// PROJECT FORM (4-Pillar STAR Structure for AI Retrieval)
export interface ProjectDetails {
    my_role?: string;           // e.g., "Lead Backend Engineer", "Creator"
    problem_solved: string;     // Pillar 1: Context / Problem Solved
    key_features: string[];     // Pillar 2: Technical Actions / Architecture Built
    impact_metrics?: string[];  // Pillar 3: Quantifiable Results / Metrics / Outcomes
    tech_stack: string[];       // Pillar 4a: Technologies Used
    keywords?: string[];        // Pillar 4b: Domain/Architecture tags (e.g., "Microservices", "RAG")
    url?: string;
}

export const emptyStateProject: FormProjectStructure = {
    id: "",
    project_name: "",
    project_description: "",
    experience_id: null,
    education_id: null,
    company_name: null,
    school_name: null,
    details: {
        my_role: "",
        problem_solved: "",
        key_features: [],
        impact_metrics: [],
        tech_stack: [],
        keywords: [],
        url: "",
    },
};

export interface FormProjectStructure {
    id: string;
    project_name: string;
    project_description: string;
    experience_id: string | null;
    education_id: string | null;
    company_name?: string | null;
    school_name?: string | null;
    details: ProjectDetails;
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
    github: string;
    portfolio: string;
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
    id: "narrative";
    type: "narrative";
    title: string;
    display: boolean;
    items: string;
}

export interface ExperienceSection {
    id: "experience";
    type: "experience";
    title: "Work Experience";
    display: boolean;
    items: Experience[];
}

export interface EducationSection {
    id: "education";
    type: "education";
    title: "Education";
    display: boolean;
    items: Education[];
}

export interface SkillsSection {
    id: "skills";
    type: "skills";
    title: "Skills";
    display: boolean;
    items: string[];
}

export interface ProjectsSection {
    id: "projects";
    type: "projects";
    title: "Projects";
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

export interface CandidateFit {
    score: number;
    summary: string;
}

export interface MasterProfileSuggestion {
    suggestion: string;
    example?: string;
}

export interface InterviewPrep {
    companyFocus: string;
    technicalTopics: string[];
}

export interface AiFeedback {
    candidateFit: CandidateFit;
    masterProfileSuggestions: MasterProfileSuggestion[];
    interviewPrep: InterviewPrep;
}
export interface NetworkingLink {
    label: string;
    url: string;
}
// NEW: The updated main response interface.
export type ResumeThemeId = "modern" | "classic" | "minimalist" | "executive";

export interface ResumeStyles {
    theme: ResumeThemeId;
    accentColor?: string;
    headerColor?: string;
    fontSize?: "small" | "medium" | "large";
    lineSpacing?: "compact" | "normal" | "relaxed";
    pageMargin?: "narrow" | "normal" | "wide";
}

export interface GeminiResponse {
    contact_info: ContactInfo;
    layout: ResumeLayoutItem[];
    keywords: string[];
    feedback: AiFeedback;
    styles: ResumeStyles;
    networkingLinks?: NetworkingLink[];
}

export const emptyStateGeminiReponse: GeminiResponse = {
    contact_info: {
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        github: "",
        portfolio: "",
    },
    layout: [],
    keywords: [],
    feedback: {
        candidateFit: {
            score: 0,
            summary: "",
        },
        masterProfileSuggestions: [],
        interviewPrep: {
            companyFocus: "",
            technicalTopics: [],
        },
    },
    networkingLinks: [],
    styles: {
        theme: "modern",
        accentColor: "#2563eb",
        headerColor: "#1e293b",
        fontSize: "medium",
        lineSpacing: "normal",
        pageMargin: "normal",
    },
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
    company_name: "",
    created_at: "",
    id: "",
    job_position: "",
    job_description: "",
    resume_generated: emptyStateGeminiReponse,
    was_downloaded: false,
};
// Interface for the form job offer structure
export interface FormJobOfferDataStructure {
    company_name: string;
    id: string | number | null;
    created_at: string | null;
    job_position: string;
    job_description: string;
    resume_generated: GeminiResponse;
    was_downloaded: boolean;
}

// The Interface for my applications/resumes generated
export interface ApplicationData {
    id: string;
    jobTitle: string;
    company: string;
    appliedDate: string;
    description: string;
    link: string; // We'll add a placeholder for this
}

export interface RawApplicationFromDB {
    id: string; // Or number, if your ID is not a UUID
    company_name: string;
    job_position: string;
    job_description: string;
    created_at: string; // Supabase returns timestamps as strings
}
