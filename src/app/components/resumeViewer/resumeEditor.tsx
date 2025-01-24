import { FormJobOfferDataStructure, GeminiResponse } from '@/utils/interfaces';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';

interface Propos {
    setDataResume: Dispatch<SetStateAction<FormJobOfferDataStructure>>;
    dataResume: FormJobOfferDataStructure;
}

export default function ResumeEditor({ setDataResume, dataResume }: Propos) {
    // funciton to handle the change of the input
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDataResume({
            ...dataResume,
            resume_generated: {
                ...dataResume.resume_generated,
                contact_info: {
                    ...dataResume.resume_generated.contact_info,
                    name: e.target.value,
                },
            },
        });
    };

    return (
        <div>
            <p>
                <strong>Name: </strong>
            </p>
            <input
                onChange={handleChange}
                value={dataResume.resume_generated.contact_info.name}
            />
            <p>
                <strong>Position: </strong>
            </p>
            <input onChange={handleChange} value={dataResume.job_position} />
            <p>Resume Visualizer</p>
            <p>
                <strong>Name: </strong>
                {dataResume.resume_generated.contact_info.name}
            </p>
            <p>
                <strong>Position: </strong> {dataResume.job_position}
            </p>
            <p>
                <strong>Contact: </strong>{' '}
                {dataResume.resume_generated.contact_info.email}
            </p>
            <p>
                <strong>Contact: </strong>{' '}
                {dataResume.resume_generated.contact_info.linkedin}
            </p>
            <p>
                <strong>Summary: </strong>
            </p>
            <p>{dataResume.resume_generated.summary}</p>
            <p>
                <strong>Experience:</strong>
            </p>
            {dataResume.resume_generated.experience.map((exp, id) => (
                <div key={id}>
                    <p>{exp.company}</p>
                    <p>{exp.start_end_dates}</p>
                    <p>{exp.title}</p>
                    <p>{exp.description}</p>
                    <p>{exp.relevance}</p>
                </div>
            ))}
            <p>
                <strong>Education:</strong>
            </p>
            {dataResume.resume_generated.education.map((edu, id) => (
                <div key={id}>
                    <p>{edu.school}</p>
                    <p>{edu.start_end_dates}</p>
                    <p>{edu.degree}</p>
                </div>
            ))}
            <p>
                <strong>Projects:</strong>
            </p>
            {dataResume.resume_generated.projects.map((pro, id) => (
                <div key={id}>
                    <p>{pro.name}</p>
                    <p>{pro.start_end_dates}</p>
                    <p>{pro.description}</p>
                    <p>{pro.relevance}</p>
                </div>
            ))}
            <p>
                <strong>Skills:</strong>
            </p>
            {dataResume.resume_generated.skills.map((skill, id) => (
                <div key={id}>
                    <p>{skill}</p>
                </div>
            ))}
        </div>
    );
}
/*
            <p>Name: {dataResume.resume_generated.contact_info.name}</p>
            <p>Position: {dataResume.job_position}</p>
            <p>Contanct: {dataResume.resume_generated.contact_info.email}</p>
            <p>Contanct: {dataResume.resume_generated.contact_info.linkedin}</p>
            <p>Summary</p>
            <p>{dataResume.resume_generated.summary}</p>
            <p>Experience:</p>
            <p>{dataResume.resume_generated.experience[0].company}</p>
            <p>{dataResume.resume_generated.experience[0].start_end_dates}</p>
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
