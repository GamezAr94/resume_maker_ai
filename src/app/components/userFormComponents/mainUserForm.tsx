'use client';

import {
    emptyStatePersonal,
    FormEducationStructure,
    FormExperienceStructure,
    FormPersonalStructure,
    FormProjectStructure,
    FormSkillStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { useEffect, useState } from 'react';
import { getDBTableInfo } from '@/app/db/user_queries';
import ExperienceContainerForm from './formContainers/experienceContainerForm';
import EducationContainerForm from './formContainers/educationContainerForm';
import { SectionTypes } from '@/utils/enums';
import SkillContainerForm from './formContainers/skillContainerForm';
import ProjectContainerForm from './formContainers/projectContainerForm';
import {
    SegmentedControl,
    Paper,
    Title,
    Text,
    Group,
    Button,
    Box, // Useful for layout and system props
    useMantineTheme, // To access theme values like colors and spacing
} from '@mantine/core';
import PersonalContainerForm from './formContainers/personalContainerForm';

import styles from './mainUserForm.module.css';

interface Props {
    className: string;
}
type InputMode = 'manual' | 'ai';
export default function MainUserForm({ className }: Props) {
    const [refreshTrigger, setRefreshTrigger] = useState<RefreshSections>({
        experience: false,
        education: false,
        skill: false,
        project: false,
        personal: false,
    });

    const [sectionDisplayed, setSectionDisplayed] = useState<
        'personal' | 'education' | 'job_experience' | 'skills' | 'projects'
    >('personal');
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

    const personalCount =
        userInfo && Object.keys(userInfo).length > 0 && userInfo.first_name
            ? 1
            : 0; // Adjust condition based on what defines a "filled" personal section
    const educationCount = educationInfo ? educationInfo.length : 0;
    const experienceCount = experienceInfo ? experienceInfo.length : 0;
    const skillCount = skillInfo ? skillInfo.length : 0;
    const projectCount = projectInfo ? projectInfo.length : 0;

    const resumeSectionTabs = [
        { label: `Personal Info (${personalCount})`, value: 'personal' },
        { label: `Education (${educationCount})`, value: 'education' },
        { label: `Experience (${experienceCount})`, value: 'job_experience' },
        { label: `Skills (${skillCount})`, value: 'skills' },
        { label: `Projects (${projectCount})`, value: 'projects' },
    ];

    const [inputMode, setInputMode] = useState<InputMode>('manual');
    const theme = useMantineTheme();

    const manualButtonStyles = (mode: InputMode) => ({
        root: {
            padding: `${theme.spacing.sm} ${theme.spacing.xl}`, // Approx py-3 px-6 (12px 24px)
            height: 'auto',
            fontSize: theme.fontSizes.sm,
            fontWeight: 600,
            boxShadow: mode === 'manual' ? theme.shadows.lg : 'none',
            backgroundColor:
                mode === 'manual' ? theme.colors.indigo[6] : theme.white,
            color: mode === 'manual' ? theme.white : theme.colors.indigo[7],
            '&:hover': {
                backgroundColor:
                    mode === 'manual'
                        ? theme.colors.indigo[7]
                        : theme.colors.indigo[0],
            },
        },
    });
    const aiButtonStyles = (mode: InputMode) => ({
        root: {
            padding: `${theme.spacing.sm} ${theme.spacing.xl}`, // Approx py-3 px-6
            height: 'auto',
            fontSize: theme.fontSizes.sm,
            fontWeight: 600,
            boxShadow: mode === 'ai' ? theme.shadows.lg : 'none',
            backgroundColor:
                mode === 'ai' ? theme.colors.yellow[8] : theme.white, // Mantine 'amber' is often 'yellow'
            color: mode === 'ai' ? theme.white : theme.colors.yellow[9], // Or a darker text color for amber
            '&:hover': {
                backgroundColor:
                    mode === 'ai'
                        ? theme.colors.yellow[5]
                        : theme.colors.yellow[0],
            },
        },
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
        <Paper
            shadow="lg"
            p="md"
            radius="lg"
            withBorder={false}
            className={className}
            style={{ backgroundColor: theme.colors.gray[1] }}
        >
            <Title order={2} ta="center" mb="md" c="gray.8">
                Manage Your Resume Data
            </Title>
            <Text ta="center" c="gray.6" mb="xl">
                Keep your professional information up-to-date. Add or import
                your details below.
            </Text>

            <Group justify="center" mb="xl">
                <Box
                    style={{
                        padding: 4, // p-1
                        backgroundColor: theme.colors.gray[2], // bg-slate-200
                        borderRadius: theme.radius.md, // rounded-lg
                        display: 'flex', // To make it wrap the buttons
                        justifyContent: 'center', // Center the buttons
                        width: '100%',
                        height: '50px',
                        gap: theme.spacing.xs, // space-x-2
                    }}
                >
                    <Button
                        onClick={() => setInputMode('manual')}
                        variant="filled" // Will be overridden by styles but good base
                        styles={() => manualButtonStyles(inputMode)}
                        leftSection={
                            <Text
                                component="span"
                                role="img"
                                aria-label="edit emoji"
                            >
                                ✍️
                            </Text>
                        }
                    >
                        Enter Data Manually (Free)
                    </Button>
                    <Button
                        onClick={() => setInputMode('ai')}
                        variant="filled"
                        styles={() => aiButtonStyles(inputMode)}
                        leftSection={
                            <Text
                                component="span"
                                role="img"
                                aria-label="sparkles emoji"
                            >
                                ✨
                            </Text>
                        }
                    >
                        AI Quick Import (Costs Tokens 🪙)
                    </Button>
                </Box>
            </Group>

            {inputMode === 'manual' && (
                <div className={styles.manualModeContainer}>
                    {/* Left Column: Resume Sections Sidebar */}
                    <Paper
                        shadow="xs" // Softer shadow for sidebar
                        p="md"
                        radius="md"
                        withBorder
                        className={styles.sidebarPaper}
                    >
                        <Title order={4} mb="lg" c="gray.7">
                            Resume Sections
                        </Title>
                        <Box component="nav">
                            {resumeSectionTabs.map((tab) => (
                                <button // Using button for accessibility and click handling
                                    key={tab.value}
                                    type="button" // Important for buttons not submitting forms
                                    className={`${styles.sidebarNavItem} ${
                                        sectionDisplayed === tab.value
                                            ? styles.sidebarNavItemActive
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setSectionDisplayed(
                                            tab.value as
                                                | 'personal'
                                                | 'education'
                                                | 'job_experience'
                                                | 'skills'
                                                | 'projects',
                                        )
                                    }
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </Box>
                    </Paper>

                    {/* Right Column: Form Display Area */}
                    <Box className={styles.contentArea}>
                        {sectionDisplayed == 'personal' && (
                            <PersonalContainerForm
                                personalInfo={
                                    userInfo === false
                                        ? emptyStatePersonal
                                        : userInfo
                                }
                                setUserInfo={setUserInfo}
                                setRefreshTrigger={setRefreshTrigger}
                            />
                        )}

                        {sectionDisplayed == 'job_experience' && (
                            <ExperienceContainerForm
                                setExperienceInfo={setExperienceInfo}
                                experienceInfo={
                                    experienceInfo === false
                                        ? []
                                        : experienceInfo
                                }
                                setRefreshTrigger={setRefreshTrigger}
                            />
                        )}

                        {sectionDisplayed == 'education' && (
                            <EducationContainerForm
                                setEducationInfo={setEducationInfo}
                                educationInfo={
                                    educationInfo === false ? [] : educationInfo
                                }
                                setRefreshTrigger={setRefreshTrigger}
                            />
                        )}

                        {sectionDisplayed == 'skills' && (
                            <SkillContainerForm
                                setSkillInfo={setSkillInfo}
                                skillInfo={skillInfo === false ? [] : skillInfo}
                                setRefreshTrigger={setRefreshTrigger}
                            />
                        )}

                        {sectionDisplayed == 'projects' && (
                            <ProjectContainerForm
                                setProjectInfo={setProjectInfo}
                                projectInfo={
                                    projectInfo === false ? [] : projectInfo
                                }
                                setRefreshTrigger={setRefreshTrigger}
                                educationInfo={
                                    educationInfo === false ? [] : educationInfo
                                }
                                experienceInfo={
                                    experienceInfo == false
                                        ? []
                                        : experienceInfo
                                }
                            />
                        )}
                    </Box>
                </div>
            )}
            {inputMode === 'ai' && (
                // Placeholder styled with Mantine's Paper component
                <Paper
                    withBorder
                    p="xl"
                    radius="md"
                    ta="center"
                    style={{ backgroundColor: theme.colors.gray[0] }}
                >
                    <Text c="gray.7">
                        AI Quick Import Functionality Coming Soon!
                    </Text>
                    <Text size="sm" c="gray.6">
                        This section will allow you to import your resume data
                        using AI.
                    </Text>
                </Paper>
            )}
        </Paper>
    );
}
