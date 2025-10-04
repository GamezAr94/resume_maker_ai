'use client';

import styles from './page.module.css';

import MainUserForm from '../components/userFormComponents/mainUserForm';
import MainJobForm from '../components/jobOfferFormComponents/mainJobForm';
import { Alert, Divider } from '@mantine/core';
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

import { calculateProfileCompleteness } from '@/utils/profile-completeness';
import { PROFILE_COMPLETION_WEIGHTS } from '../config/profile.config';
import { IconAlertCircle } from '@tabler/icons-react';

export default function Home() {
    const mainFormRef = useRef<HTMLDivElement>(null);

    const [error, setError] = useState<string | null>(null);

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
    const { percentage, status = 'ready' } = calculateProfileCompleteness({
        userInfo: userInfo || null,
        experienceInfo: experienceInfo || [],
        educationInfo: educationInfo || [],
        skillInfo: skillInfo || [],
        projectInfo: projectInfo || [],
    });

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

    useEffect(() => {
        const fetchAllData = async () => {
            // Reset error state on each new fetch attempt
            setError(null);

            try {
                const response = await fetch('/api/profile/all-sections');
                if (!response.ok) {
                    throw new Error('Failed to fetch profile data');
                }
                const allData = await response.json();

                // Set all of your states from this single API call
                setUserInfo(allData.userInfo);
                setExperienceInfo(allData.experienceInfo);
                setEducationInfo(allData.educationInfo);
                setSkillInfo(allData.skillInfo);
                setProjectInfo(allData.projectInfo);
            } catch (error) {
                // Set the error state if the fetch fails
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'An unknown error occurred.';
                setError(errorMessage);
            }
        };

        fetchAllData();
        // This hook now runs whenever *any* section is refreshed
    }, [refreshTrigger]);

    const handleScrollToForm = () => {
        mainFormRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };
    return (
        <div>
            <main className={styles.main}>
                {error ? (
                    <Alert
                        variant="light"
                        color="red"
                        title="Failed to Load Data"
                        icon={<IconAlertCircle />}
                        withCloseButton
                        onClose={() => setError(null)}
                        my="md"
                    >
                        {error}
                    </Alert>
                ) : (
                    <>
                        <div className={styles.topSectionContainer}>
                            <div className={styles.leftColumn}>
                                <MainJobForm
                                    onCompleteProfileClick={handleScrollToForm}
                                    status={status}
                                    percentage={percentage}
                                    sectionCounts={sectionCounts}
                                />
                            </div>
                            <div className={styles.rightColumn}>
                                <ProfileCompletionCard
                                    onCompleteProfileClick={handleScrollToForm}
                                    percentage={percentage}
                                    sectionCounts={sectionCounts}
                                />
                            </div>
                        </div>
                        <Divider my="xs" color="gray.1" />
                        <MainUserForm
                            ref={mainFormRef}
                            className={styles.container_form}
                            projectInfo={projectInfo}
                            experienceInfo={experienceInfo}
                            educationInfo={educationInfo}
                            skillInfo={skillInfo}
                            userInfo={userInfo}
                            setUserInfo={setUserInfo}
                            setRefreshTrigger={setRefreshTrigger}
                            sectionCounts={sectionCounts}
                        />
                    </>
                )}
            </main>
        </div>
    );
}
