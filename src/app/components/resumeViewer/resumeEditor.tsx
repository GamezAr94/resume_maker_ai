import { FormJobOfferDataStructure } from '@/utils/interfaces';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';

interface Propos {
    setDataResume: Dispatch<SetStateAction<FormJobOfferDataStructure>>;
    dataResume: FormJobOfferDataStructure;
}

export default function ResumeEditor({ setDataResume, dataResume }: Propos) {
    // funciton to handle the change of the input
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const [value, name] = [e.target.value, e.target.name];

        switch (name) {
            case 'name':
            case 'email':
            case 'linkedin':
            case 'phone':
                setDataResume({
                    ...dataResume,
                    resume_generated: {
                        ...dataResume.resume_generated,
                        contact_info: {
                            ...dataResume.resume_generated.contact_info,
                            [name]: value,
                        },
                    },
                });
                break;
            case 'summary':
                setDataResume({
                    ...dataResume,
                    resume_generated: {
                        ...dataResume.resume_generated,
                        summary: value,
                    },
                });
                break;
            case 'job_position':
                setDataResume({
                    ...dataResume,
                    job_position: value,
                });
                break;
            case 'company':
            case 'start_end_dates':
            case 'title':
            case 'description':
            case 'relevance':
                const iterator = e.target.getAttribute('data-iterator');
                if (iterator !== null) {
                    const index = parseInt(iterator, 10);
                    const updatedExperience = [
                        ...dataResume.resume_generated.experience,
                    ];
                    updatedExperience[index] = {
                        ...updatedExperience[index],
                        [name]: value,
                    };
                    setDataResume({
                        ...dataResume,
                        resume_generated: {
                            ...dataResume.resume_generated,
                            experience: updatedExperience,
                        },
                    });
                }
                break;
            default:
                return;
        }
    };

    return (
        <div>
            <p>Resume Visualizer</p>
            <p>
                <strong>Name: </strong>
            </p>
            <input
                onChange={handleChange}
                name="name"
                value={dataResume.resume_generated.contact_info.name}
            />

            <p>
                <strong>Position: </strong>
            </p>
            <input
                onChange={handleChange}
                name="job_position"
                value={dataResume.job_position}
            />

            <p>
                <strong>Email: </strong>
            </p>
            <input
                onChange={handleChange}
                name="email"
                value={dataResume.resume_generated.contact_info.email}
            />
            <p>
                <strong>Linkedin: </strong>
            </p>
            <input
                onChange={handleChange}
                name="linkedin"
                value={dataResume.resume_generated.contact_info.linkedin}
            />
            <p>
                <strong>Phone: </strong>
            </p>
            <input
                onChange={handleChange}
                name="phone"
                value={dataResume.resume_generated.contact_info.phone}
            />

            <p>
                <strong>Summary: </strong>
            </p>
            <input
                onChange={handleChange}
                name="summary"
                value={dataResume.resume_generated.summary}
            />

            <p>
                <strong>Experience:</strong>
            </p>
            {dataResume.resume_generated.experience.map((exp, id) => (
                <div key={id}>
                    <input
                        onChange={handleChange}
                        name="company"
                        value={
                            dataResume.resume_generated.experience[id].company
                        }
                        data-iterator={id}
                    />
                    <input
                        onChange={handleChange}
                        name="start_end_dates"
                        value={
                            dataResume.resume_generated.experience[id]
                                .start_end_dates
                        }
                        data-iterator={id}
                    />
                    <input
                        onChange={handleChange}
                        name="title"
                        value={dataResume.resume_generated.experience[id].title}
                        data-iterator={id}
                    />
                    <input
                        onChange={handleChange}
                        name="description"
                        value={
                            dataResume.resume_generated.experience[id]
                                .description
                        }
                        data-iterator={id}
                    />
                    <input
                        onChange={handleChange}
                        name="relevance"
                        value={
                            dataResume.resume_generated.experience[id].relevance
                        }
                        data-iterator={id}
                    />
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
