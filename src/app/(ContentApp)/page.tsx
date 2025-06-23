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
import { PROFILE_COMPLETION_WEIGHTS } from '../config/profile.config';

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
    const [isLoading, setIsLoading] = useState(true);

    // Calculate the profile completeness percentage and status
    const { percentage, status = 'ready' } = calculateProfileCompleteness({
        userInfo: userInfo || null,
        experienceInfo: experienceInfo || [],
        educationInfo: educationInfo || [],
        skillInfo: skillInfo || [],
        projectInfo: projectInfo || [],
    });

    useEffect(() => {
        // We are waiting for all the data to be loaded before showing the profile completion card
        if (
            userInfo !== false &&
            projectInfo !== false &&
            skillInfo !== false &&
            educationInfo !== false &&
            experienceInfo !== false
        ) {
            setIsLoading(false);
        }
    }, [userInfo, projectInfo, skillInfo, educationInfo, experienceInfo]);

    // Define the section counts for the profile completion card
    // Each section has a current count, required count, label, and value
    // The current count is the number of entries the user has in that section
    // The required count is the number of entries required for that section to be considered complete
    // The label is the name of the section, and the value is the value used to
    const sectionCounts = {
        personal: {
            current:
                userInfo &&
                userInfo.first_name &&
                userInfo.last_name &&
                userInfo.email
                    ? 1
                    : 0,
            required: 1,
            label: 'Personal Info',
            value: 'personal',
        },
        education: {
            current: educationInfo ? educationInfo.length : 0,
            required: PROFILE_COMPLETION_WEIGHTS.MAX_EDUCATION_FOR_SCORE,
            label: 'Education',
            value: 'education',
        },
        job_experience: {
            current: experienceInfo ? experienceInfo.length : 0,
            required:
                PROFILE_COMPLETION_WEIGHTS.MAX_EXPERIENCE_ENTRIES_FOR_SCORE,
            label: 'Experience',
            value: 'job_experience',
        },
        skills: {
            current: skillInfo ? skillInfo.length : 0,
            required: PROFILE_COMPLETION_WEIGHTS.MAX_SKILLS_FOR_SCORE,
            label: 'Skills',
            value: 'skills',
        },
        projects: {
            current: projectInfo ? projectInfo.length : 0,
            required: PROFILE_COMPLETION_WEIGHTS.MAX_PROJECTS_FOR_SCORE,
            label: 'Projects',
            value: 'projects',
        },
    };

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
                {isLoading || status === 'ready' ? (
                    ''
                ) : (
                    <ProfileCompletionCard
                        onCompleteProfileClick={handleScrollToForm}
                        percentage={percentage}
                        sectionCounts={sectionCounts}
                    />
                )}
                <MainJobForm
                    onCompleteProfileClick={handleScrollToForm}
                    className={styles.container_form}
                    status={status}
                    percentage={percentage}
                    sectionCounts={sectionCounts}
                />
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
                    sectionCounts={sectionCounts}
                />
            </main>
        </div>
    );
}
