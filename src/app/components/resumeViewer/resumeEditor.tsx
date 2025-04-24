import { FormJobOfferDataStructure } from '@/utils/interfaces';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';

interface Propos {
    setDataResume: Dispatch<SetStateAction<FormJobOfferDataStructure>>;
    dataResume: FormJobOfferDataStructure;
}

export default function ResumeEditor({ setDataResume, dataResume }: Propos) {
    // function to show/hide specific sections in the resume
    const hideShowSection = (e: React.MouseEvent<HTMLButtonElement>) => {
        const iterator = e.currentTarget.getAttribute('data-iterator');
        const section = e.currentTarget.getAttribute('data-section');
        if (iterator == null) {
            return;
        }
        const index = parseInt(iterator, 10);

        if (section === 'projects' || section === 'experience') {
            const updatedProjects = [...dataResume.resume_generated[section]];

            // if the display property is undefined, set it to true
            if (updatedProjects[index].display === undefined) {
                updatedProjects[index].display = true;
            }
            const display = updatedProjects[index].display;
            console.log(display);
            updatedProjects[index] = {
                ...updatedProjects[index],
                display: !display,
            };
            setDataResume({
                ...dataResume,
                resume_generated: {
                    ...dataResume.resume_generated,
                    [section]: updatedProjects,
                },
            });
        }
    };

    // funciton to handle the change of the input
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const [value, name] = [e.target.value, e.target.name];
        const section = e.target.getAttribute('data-section');

        switch (section) {
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
                            [section]: value,
                        },
                    },
                });
                break;
            case 'summary':
            case 'career_objective':
                setDataResume({
                    ...dataResume,
                    resume_generated: {
                        ...dataResume.resume_generated,
                        [section]: value,
                    },
                });
                break;
            case 'job_position':
                setDataResume({
                    ...dataResume,
                    [section]: value,
                });
                break;
            case 'projects':
            case 'experience':
                const iterator = e.target.getAttribute('data-iterator');
                if (iterator !== null) {
                    const index = parseInt(iterator, 10);
                    const updatedProjects = [
                        ...dataResume.resume_generated[section],
                    ];
                    updatedProjects[index] = {
                        ...updatedProjects[index],
                        [name]: value,
                    };
                    setDataResume({
                        ...dataResume,
                        resume_generated: {
                            ...dataResume.resume_generated,
                            [section]: updatedProjects,
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
                data-section="name"
                value={dataResume.resume_generated.contact_info.name}
            />

            <hr></hr>
            <p>
                <strong>Position: </strong>
            </p>
            <input
                onChange={handleChange}
                name="job_position"
                data-section="job_position"
                value={dataResume.job_position}
            />

            <hr></hr>
            <p>Contact Info</p>
            <p>
                <strong>Email: </strong>
            </p>
            <input
                onChange={handleChange}
                name="email"
                data-section="email"
                value={dataResume.resume_generated.contact_info.email}
            />
            <p>
                <strong>Linkedin: </strong>
            </p>
            <input
                onChange={handleChange}
                name="linkedin"
                data-section="linkedin"
                value={dataResume.resume_generated.contact_info.linkedin}
            />
            <p>
                <strong>Phone: </strong>
            </p>
            <input
                onChange={handleChange}
                name="phone"
                data-section="phone"
                value={dataResume.resume_generated.contact_info.phone}
            />

            <hr></hr>
            <p>
                <strong>Career Objective: </strong>
            </p>
            <textarea
                onChange={handleChange}
                name="career_objective"
                data-section="career_objective"
                value={dataResume.resume_generated.career_objective}
            ></textarea>
            <p>
                <strong>Summary: </strong>
            </p>
            <textarea
                onChange={handleChange}
                name="summary"
                data-section="summary"
                value={dataResume.resume_generated.summary}
            ></textarea>

            <hr></hr>
            <p>
                <strong>Experience:</strong>
            </p>
            {dataResume.resume_generated.experience.map((exp, id) => (
                <div key={id}>
                    <button
                        onClick={hideShowSection}
                        data-iterator={id}
                        data-section="experience"
                    >
                        {exp.display || exp.display == undefined
                            ? 'Hide'
                            : 'Show'}
                    </button>
                    <input
                        onChange={handleChange}
                        name="company"
                        data-section="experience"
                        value={exp.company}
                        data-iterator={id}
                    />
                    <input
                        onChange={handleChange}
                        name="start_end_dates"
                        data-section="experience"
                        value={exp.start_end_dates}
                        data-iterator={id}
                    />
                    <input
                        onChange={handleChange}
                        name="title"
                        data-section="experience"
                        value={exp.title}
                        data-iterator={id}
                    />
                    <textarea
                        onChange={handleChange}
                        name="responsabilities"
                        data-section="experience"
                        value={exp.responsabilities}
                        data-iterator={id}
                    ></textarea>
                </div>
            ))}

            <hr></hr>
            <p>
                <strong>Projects:</strong>
            </p>
            {dataResume.resume_generated.projects.map((pro, id) => (
                <div key={id}>
                    <button
                        onClick={hideShowSection}
                        data-iterator={id}
                        data-section="projects"
                    >
                        {pro.display || pro.display == undefined
                            ? 'Hide'
                            : 'Show'}
                    </button>
                    <input
                        onChange={handleChange}
                        data-section="projects"
                        name="name"
                        value={pro.name}
                        data-iterator={id}
                    />
                    <input
                        onChange={handleChange}
                        data-section="projects"
                        name="start_end_dates"
                        value={pro.start_end_dates}
                        data-iterator={id}
                    />
                    <textarea
                        onChange={handleChange}
                        data-section="projects"
                        name="relevance"
                        value={pro.relevance}
                        data-iterator={id}
                    ></textarea>
                    <textarea
                        onChange={handleChange}
                        data-section="projects"
                        name="description"
                        value={pro.description}
                        data-iterator={id}
                    ></textarea>
                </div>
            ))}
        </div>
    );
}
