'user client';
import {
    FormEducationStructure,
    FormExperienceStructure,
    FormProjectStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Dispatch, SetStateAction, useState } from 'react';
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
    const [getEditRecord, setEditRecord] =
        useState<FormProjectStructure | null>(null);
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
                    getEditRecord={getEditRecord}
                    setEditRecord={setEditRecord}
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
                                  setEditRecord={setEditRecord}
                              />
                          ))
                        : null}
                </ShowUserDataSection>
            </div>
        </>
    );
}
