'use client';

import ProjectsInfoForm from './forms/projectsInfoForm';
import PersonalInfoForm from './forms/personalInfoForm';

import {
    FormEducationStructure,
    FormExperienceStructure,
    FormSkillStructure,
} from '@/utils/interfaces';
import { useEffect, useState } from 'react';
import { getDBTableInfo } from '@/app/db/user_queries';
import ExperienceContainerForm from './experienceContainerForm';
import EducationContainerForm from './educationContainerForm';
import { SectionTypes } from '@/utils/enums';
import SkillContainerForm from './skillContainerForm';
import exp from 'constants';

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
    const [skillInfo, setSkillInfo] = useState<[FormSkillStructure] | false>(
        false,
    );

    // EDUCATION: Fetch the user education data when the component mounts
    useEffect(() => {
        const fetchSkillsFormInfo = async () => {
            const skillsInfoResp = await getDBTableInfo(SectionTypes.Skill);
            if (!skillsInfoResp.status) {
                // If there is an error, log it and return
                console.error(skillsInfoResp.message);
                return;
            }
            // Set the experience info in the state
            setSkillInfo(skillsInfoResp.data);
        };

        fetchSkillsFormInfo();
    }, [refreshTrigger.skill]);

    // EDUCATION: Fetch the user education data when the component mounts
    useEffect(() => {
        const fetchEducationFormInfo = async () => {
            const educationInfoResp = await getDBTableInfo(
                SectionTypes.Education,
            );
            if (!educationInfoResp.status) {
                // If there is an error, log it and return
                console.error(educationInfoResp.message);
                return;
            }
            // Set the experience info in the state
            setEducationInfo(educationInfoResp.data);
        };

        fetchEducationFormInfo();
    }, [refreshTrigger.education]);

    // EXPERIENCE: Fetch the user experience data when the component mounts
    useEffect(() => {
        const fetchExperienceFormInfo = async () => {
            const experienceInfoResp = await getDBTableInfo(
                SectionTypes.Experience,
            );
            if (!experienceInfoResp.status) {
                // If there is an error, log it and return
                console.error(experienceInfoResp.message);
                return;
            }
            // Set the experience info in the state
            setExperienceInfo(experienceInfoResp.data);
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

            <SkillContainerForm
                setSkillInfo={setSkillInfo}
                skillInfo={skillInfo}
                setRefreshTrigger={setRefreshTrigger}
            />

            <p>Projects</p>
            <ProjectsInfoForm />
        </div>
    );
}
