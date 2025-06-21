'use client';

import styles from './page.module.css';

import MainUserForm from '../components/userFormComponents/mainUserForm';
import MainJobForm from '../components/jobOfferFormComponents/mainJobForm';
import { Divider } from '@mantine/core';
import { ProfileCompletionCard } from '../components/ProfileCompletion/ProfileCompletionCard';
import { useRef, useState, useEffect } from 'react';
import {
    FormEducationStructure,
    FormExperienceStructure,
    FormPersonalStructure,
    FormProjectStructure,
    FormSkillStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { getDBTableInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';

import { calculateProfileCompleteness } from '@/utils/profile-completeness';

export default function Home() {
    const mainFormRef = useRef<HTMLDivElement>(null);

    const [refreshTrigger, setRefreshTrigger] = useState<RefreshSections>({
        experience: false,
        education: false,
        skill: false,
        project: false,
        personal: false,
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
    const [userInfo, setUserInfo] = useState<FormPersonalStructure | false>(
        false,
    );

    // Calculate the profile completeness percentage and status
    const { percentage, status } = calculateProfileCompleteness({
        userInfo: userInfo || null,
        experienceInfo: experienceInfo || [],
        educationInfo: educationInfo || [],
        skillInfo: skillInfo || [],
        projectInfo: projectInfo || [],
    });

    // PERSONAL: Fetch the user data when the component mounts
    useEffect(() => {
        const fetchUserInfo = async () => {
            const userInfoResp = await getDBTableInfo('');
            // If the user doesn't exist, return
            if (!userInfoResp.status) {
                // TODO ART: show an error message to the user
                console.error(userInfoResp.message);
                return;
            }
            // Set the user info in the state
            setUserInfo(userInfoResp.data);
        };
        fetchUserInfo();
    }, [refreshTrigger.personal]);

    // PROJECT: Fetch the user project data when the component mounts
    useEffect(() => {
        const fetchProjectFormInfo = async () => {
            const projectInfoResp = await getDBTableInfo(SectionTypes.Project);
            if (!projectInfoResp.status) {
                // If there is an error, log it and return
                console.error(projectInfoResp.message);
                return;
            }
            // Set the project info in the state
            setProjectInfo(projectInfoResp.data);
        };

        fetchProjectFormInfo();
    }, [refreshTrigger.project]);

    // SKILL: Fetch the user skill data when the component mounts
    useEffect(() => {
        const fetchSkillsFormInfo = async () => {
            const skillsInfoResp = await getDBTableInfo(SectionTypes.Skill);
            if (!skillsInfoResp.status) {
                // If there is an error, log it and return
                console.error(skillsInfoResp.message);
                return;
            }
            // Set the skill info in the state
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
            // Set the education info in the state
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

    const handleScrollToForm = () => {
        mainFormRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };
    return (
        <div>
            <main className={styles.main}>
                <ProfileCompletionCard
                    onCompleteProfileClick={handleScrollToForm}
                    percentage={percentage}
                />
                <MainJobForm className={styles.container_form} />
                <Divider my="xs" color="gray.1" />
                <MainUserForm
                    ref={mainFormRef}
                    className={styles.container_form}
                    projectInfo={projectInfo}
                    setProjectInfo={setProjectInfo}
                    experienceInfo={experienceInfo}
                    setExperienceInfo={setExperienceInfo}
                    educationInfo={educationInfo}
                    setEducationInfo={setEducationInfo}
                    skillInfo={skillInfo}
                    setSkillInfo={setSkillInfo}
                    userInfo={userInfo}
                    setUserInfo={setUserInfo}
                    setRefreshTrigger={setRefreshTrigger}
                />
            </main>
        </div>
    );
}
