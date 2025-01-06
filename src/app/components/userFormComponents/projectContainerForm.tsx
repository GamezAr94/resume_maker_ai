import {
    FormEducationStructure,
    FormExperienceStructure,
    FormProjectStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Dispatch, SetStateAction } from 'react';
import ProjectsInfoForm from './forms/projectsInfoForm';

interface Params {
    setProjectInfo: Dispatch<SetStateAction<false | [FormProjectStructure]>>;
    projectInfo: [FormProjectStructure] | [];
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    educationInfo: [FormEducationStructure] | [];
    experienceInfo: [FormExperienceStructure] | [];
}
export default function ProjectContainerForm({
    setProjectInfo,
    projectInfo,
    setRefreshTrigger,
    educationInfo,
    experienceInfo,
}: Params) {
    return (
        <>
            <p>Projects</p>
            {projectInfo &&
                projectInfo.map((item, index) => (
                    <ProjectsInfoForm
                        key={index}
                        infoQuery={item}
                        setInfo={setProjectInfo}
                        setRefreshTrigger={setRefreshTrigger}
                        educationInfo={educationInfo}
                        experienceInfo={experienceInfo}
                    />
                ))}
            <ProjectsInfoForm
                infoQuery={null}
                setInfo={null}
                setRefreshTrigger={setRefreshTrigger}
                educationInfo={educationInfo}
                experienceInfo={experienceInfo}
            />
        </>
    );
}
