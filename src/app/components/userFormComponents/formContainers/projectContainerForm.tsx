import {
    FormEducationStructure,
    FormExperienceStructure,
    FormProjectStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Dispatch, SetStateAction } from 'react';
import ProjectsInfoForm from '../forms/projectsInfoForm';
import ShowUserDataSection from '../showUserDataSection';

interface Params {
    setProjectInfo: Dispatch<SetStateAction<false | [FormProjectStructure]>>;
    projectInfo: [FormProjectStructure] | [];
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    educationInfo: [FormEducationStructure] | [];
    experienceInfo: [FormExperienceStructure] | [];
    className: string;
}
export default function ProjectContainerForm({
    setProjectInfo,
    projectInfo,
    setRefreshTrigger,
    educationInfo,
    experienceInfo,
    className,
}: Params) {
    return (
        <>
            <div>
                <h2>Projects</h2>
            </div>
            <div className={className}>
                <ProjectsInfoForm
                    infoQuery={null}
                    setInfo={null}
                    setRefreshTrigger={setRefreshTrigger}
                    educationInfo={educationInfo}
                    experienceInfo={experienceInfo}
                />
                <ShowUserDataSection>
                    {projectInfo.length > 0
                        ? projectInfo.map((item, index) => (
                              <ProjectsInfoForm
                                  key={index}
                                  infoQuery={item}
                                  setInfo={setProjectInfo}
                                  setRefreshTrigger={setRefreshTrigger}
                                  educationInfo={educationInfo}
                                  experienceInfo={experienceInfo}
                              />
                          ))
                        : null}
                </ShowUserDataSection>
            </div>
        </>
    );
}
