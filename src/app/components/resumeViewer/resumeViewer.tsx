import { GeminiResponse } from '@/utils/interfaces';

interface Propos {
    resumeData: {
        company_name: string;
        created_at: string;
        id: string;
        job_description: string;
        job_position: string;
        resume_generated: GeminiResponse;
    };
}

export default function ResumeViewer({ resumeData }: Propos) {
    return (
        <div>
            <p>Resume Visualizer</p>
            <p>
                <strong>Name: </strong>
                {resumeData.resume_generated.contact_info.name}
            </p>
            <p>
                <strong>Position: </strong> {resumeData.job_position}
            </p>
            <p>
                <strong>Contact: </strong>{' '}
                {resumeData.resume_generated.contact_info.email}
            </p>
            <p>
                <strong>Contact: </strong>{' '}
                {resumeData.resume_generated.contact_info.linkedin}
            </p>
            <p>
                <strong>Summary: </strong>
            </p>
            <p>{resumeData.resume_generated.summary}</p>
            <p>
                <strong>Experience:</strong>
            </p>
            <p>{resumeData.resume_generated.experience[0].company}</p>
            <p>{resumeData.resume_generated.experience[0].start_end_dates}</p>
            <p>{resumeData.resume_generated.experience[0].title}</p>
            <p>{resumeData.resume_generated.experience[0].description}</p>
            <p>{resumeData.resume_generated.experience[0].relevance}</p>
            <p>
                <strong>Education:</strong>
            </p>
            <p>{resumeData.resume_generated.education[0].school}</p>
            <p>{resumeData.resume_generated.education[0].start_end_dates}</p>
            <p>{resumeData.resume_generated.education[0].degree}</p>
            <p>
                <strong>Projects:</strong>
            </p>
            <p>{resumeData.resume_generated.projects[0].name}</p>
            <p>{resumeData.resume_generated.projects[0].start_end_dates}</p>
            <p>{resumeData.resume_generated.projects[0].description}</p>
            <p>{resumeData.resume_generated.projects[0].relevance}</p>
            <p>
                <strong>Skills:</strong>
            </p>
            <p>{resumeData.resume_generated.skills[0]}</p>
            <p>{resumeData.resume_generated.skills[1]}</p>
        </div>
    );
}
/*
            <p>Name: {resumeData.resume_generated.contact_info.name}</p>
            <p>Position: {resumeData.job_position}</p>
            <p>Contanct: {resumeData.resume_generated.contact_info.email}</p>
            <p>Contanct: {resumeData.resume_generated.contact_info.linkedin}</p>
            <p>Summary</p>
            <p>{resumeData.resume_generated.summary}</p>
            <p>Experience:</p>
            <p>{resumeData.resume_generated.experience[0].company}</p>
            <p>{resumeData.resume_generated.experience[0].start_end_dates}</p>
            <p>{resumeData.resume_generated.experience[0].title}</p>
            <p>{resumeData.resume_generated.experience[0].description}</p>
            <p>{resumeData.resume_generated.experience[0].relevance}</p>
            <p>Education:</p>
            <p>{resumeData.resume_generated.education[0].school}</p>
            <p>{resumeData.resume_generated.education[0].start_end_dates}</p>
            <p>{resumeData.resume_generated.education[0].degree}</p>
            <p>Projects:</p>
            <p>{resumeData.resume_generated.projects[0].name}</p>
            <p>{resumeData.resume_generated.projects[0].start_end_dates}</p>
            <p>{resumeData.resume_generated.projects[0].description}</p>
            <p>{resumeData.resume_generated.projects[0].relevance}</p>
            <p>Skills:</p>
            <p>{resumeData.resume_generated.skills[0]}</p>
            <p>{resumeData.resume_generated.skills[1]}</p>
*/
