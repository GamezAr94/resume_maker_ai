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
