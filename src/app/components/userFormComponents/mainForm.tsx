'use client';

import ProjectsInfoForm from './forms/projectsInfoForm';
import PersonalInfoForm from './forms/personalInfoForm';

import {
    FormEducationStructure,
    FormExperienceStructure,
    FormProjectStructure,
    FormSkillStructure,
} from '@/utils/interfaces';
import { useEffect, useState } from 'react';
import { getDBTableInfo } from '@/app/db/user_queries';
import ExperienceContainerForm from './experienceContainerForm';
import EducationContainerForm from './educationContainerForm';
import { SectionTypes } from '@/utils/enums';
import SkillContainerForm from './skillContainerForm';
import ProjectContainerForm from './projectContainerForm';

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

    const [projectInfo, setProjectInfo] = useState<
        [FormProjectStructure] | false
    >(false);
    const [experienceInfo, setExperienceInfo] = useState<
        [FormExperienceStructure] | false
    >(false);
    const [educationInfo, setEducationInfo] = useState<
        [FormEducationStructure] | false
    >(false);
    const [skillInfo, setSkillInfo] = useState<[FormSkillStructure] | false>(
        false,
    );

    // PROJECT: Fetch the user education data when the component mounts
    useEffect(() => {
        const fetchProjectFormInfo = async () => {
            const projectInfoResp = await getDBTableInfo(SectionTypes.Project);
            if (!projectInfoResp.status) {
                // If there is an error, log it and return
                console.error(projectInfoResp.message);
                return;
            }
            // Set the experience info in the state
            setProjectInfo(projectInfoResp.data);
        };

        fetchProjectFormInfo();
    }, [refreshTrigger.project]);

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
                experienceInfo={experienceInfo === false ? [] : experienceInfo}
                setRefreshTrigger={setRefreshTrigger}
            />

            <EducationContainerForm
                setEducationInfo={setEducationInfo}
                educationInfo={educationInfo === false ? [] : educationInfo}
                setRefreshTrigger={setRefreshTrigger}
            />

            <SkillContainerForm
                setSkillInfo={setSkillInfo}
                skillInfo={skillInfo === false ? [] : skillInfo}
                setRefreshTrigger={setRefreshTrigger}
            />

            <ProjectContainerForm
                setProjectInfo={setProjectInfo}
                projectInfo={projectInfo === false ? [] : projectInfo}
                setRefreshTrigger={setRefreshTrigger}
                educationInfo={educationInfo === false ? [] : educationInfo}
                experienceInfo={experienceInfo == false ? [] : experienceInfo}
            />
        </div>
    );
}
