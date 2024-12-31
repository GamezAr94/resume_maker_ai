'use client';

import ProjectsInfoForm from './forms/projectsInfoForm';
import SkillsInfoForm from './forms/skillsInfoForm';
import PersonalInfoForm from './forms/personalInfoForm';

import {
    FormEducationStructure,
    FormExperienceStructure,
} from '@/utils/interfaces';
import { useEffect, useState } from 'react';
import { getEducationInfo, getExperienceInfo } from '@/app/db/user_queries';
import ExperienceContainerForm from './experienceContainerForm';
import EducationContainerForm from './educationContainerForm';

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
    const [educationInfo, setEducationInfo] = useState<
        [FormEducationStructure] | false
    >(false);

    // Fetch the user education data when the component mounts
    useEffect(() => {
        const fetchEducationFormInfo = async () => {
            const educationInfoResp = await getEducationInfo();
            if (!educationInfoResp) {
                // If there is an error, log it and return
                console.error('unnexpected error, please try again');
                return;
            }
            // Set the experience info in the state
            setEducationInfo(educationInfoResp);
        };

        fetchEducationFormInfo();
    }, [refreshTrigger.education]);

    // Fetch the user experience data when the component mounts
    useEffect(() => {
        const fetchExperienceFormInfo = async () => {
            const experienceInfoResp = await getExperienceInfo();
            if (!experienceInfoResp) {
                // If there is an error, log it and return
                console.error('unnexpected error, please try again');
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

            <EducationContainerForm
                setEducationInfo={setEducationInfo}
                educationInfo={educationInfo}
                setRefreshTrigger={setRefreshTrigger}
            />

            <p>Skills</p>
            <SkillsInfoForm />

            <p>Projects</p>
            <ProjectsInfoForm />
        </div>
    );
}
