'use client';

import EducationInfoForm from './forms/educationInfoForm';
import ProjectsInfoForm from './forms/projectsInfoForm';
import SkillsInfoForm from './forms/skillsInfoForm';
import PersonalInfoForm from './forms/personalInfoForm';

import { FormExperienceStructure } from '@/utils/interfaces';
import { useEffect, useState } from 'react';
import { getExperienceInfo } from '@/app/db/user_queries';
import ExperienceContainerForm from './experienceContainerForm';

export default function UserInfoForm() {
    const [refreshTrigger, setRefreshTrigger] = useState<{
        experience: boolean;
        education: boolean;
        skill: boolean;
        project: boolean;
    }>({
        experience: false,
        education: false,
        skill: false,
        project: false,
    });

    const [experienceInfo, setExperienceInfo] = useState<
        [FormExperienceStructure] | false
    >(false);

    // Fetch the user data when the component mounts
    useEffect(() => {
        const fetchExperienceFormInfo = async () => {
            const experienceInfoResp = await getExperienceInfo();
            if (!experienceInfoResp) {
                return;
            }
            // Set the experience info in the state
            setExperienceInfo(experienceInfoResp);
        };

        fetchExperienceFormInfo();
    }, [refreshTrigger.experience]);

    return (
        <div>
            <p>Personal Information</p>
            <PersonalInfoForm />

            <ExperienceContainerForm
                setExperienceInfo={setExperienceInfo}
                experienceInfo={experienceInfo}
                setRefreshTrigger={setRefreshTrigger}
            />

            <p>Education</p>
            <EducationInfoForm />

            <p>Skills</p>
            <SkillsInfoForm />

            <p>Projects</p>
            <ProjectsInfoForm />
        </div>
    );
}
