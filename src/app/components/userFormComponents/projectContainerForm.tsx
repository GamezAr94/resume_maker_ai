import { FormProjectStructure } from '@/utils/interfaces';
import { Dispatch, SetStateAction } from 'react';
import ProjectsInfoForm from './forms/projectsInfoForm';

interface Params {
    setProjectInfo: Dispatch<SetStateAction<false | [FormProjectStructure]>>;
    projectInfo: [FormProjectStructure] | false;
    setRefreshTrigger: Dispatch<
        SetStateAction<{
            experience: boolean;
            education: boolean;
            skill: boolean;
            project: boolean;
        }>
    >;
}
export default function ProjectContainerForm({
    setProjectInfo,
    projectInfo,
    setRefreshTrigger,
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
                    />
                ))}
            <ProjectsInfoForm
                infoQuery={null}
                setInfo={null}
                setRefreshTrigger={setRefreshTrigger}
            />
        </>
    );
}
