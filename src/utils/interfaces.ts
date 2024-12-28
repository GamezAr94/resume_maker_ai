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
