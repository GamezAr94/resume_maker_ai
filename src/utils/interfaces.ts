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
