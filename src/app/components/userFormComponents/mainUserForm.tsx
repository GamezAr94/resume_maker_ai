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
import { useState, forwardRef } from 'react';
import ExperienceContainerForm from './formContainers/experienceContainerForm';
import EducationContainerForm from './formContainers/educationContainerForm';
import SkillContainerForm from './formContainers/skillContainerForm';
import ProjectContainerForm from './formContainers/projectContainerForm';
import {
    Paper,
    Title,
    Text,
    Group,
    Button,
    Box, // Useful for layout and system props
    useMantineTheme, // To access theme values like colors and spacing
} from '@mantine/core';
import { IconCheck, IconClock } from '@tabler/icons-react';
import PersonalContainerForm from './formContainers/personalContainerForm';

import styles from './mainUserForm.module.css';
import '@mantine/dates/styles.css';
//import { LinkedInImporter } from './linkedinForms/LinkedinImporterForm';

interface Props {
    className: string;
    projectInfo: [FormProjectStructure] | false;
    setProjectInfo: React.Dispatch<
        React.SetStateAction<[FormProjectStructure] | false>
    >;
    experienceInfo: [FormExperienceStructure] | false;
    setExperienceInfo: React.Dispatch<
        React.SetStateAction<[FormExperienceStructure] | false>
    >;
    educationInfo: [FormEducationStructure] | false;
    setEducationInfo: React.Dispatch<
        React.SetStateAction<[FormEducationStructure] | false>
    >;
    skillInfo: [FormSkillStructure] | false;
    setSkillInfo: React.Dispatch<
        React.SetStateAction<[FormSkillStructure] | false>
    >;
    userInfo: FormPersonalStructure | false;
    setUserInfo: React.Dispatch<
        React.SetStateAction<FormPersonalStructure | false>
    >;
    setRefreshTrigger: React.Dispatch<React.SetStateAction<RefreshSections>>;
    sectionCounts: {
        [key: string]: {
            current: number;
            required: number;
            label: string;
            value: string;
        };
    };
}
type InputMode = 'manual' | 'ai' | 'linkedin';

/*
const LinkedInIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
);
*/

const MainUserForm = forwardRef<HTMLDivElement, Props>(
    (
        {
            className,
            projectInfo,
            setProjectInfo,
            experienceInfo,
            setExperienceInfo,
            educationInfo,
            setEducationInfo,
            skillInfo,
            setSkillInfo,
            userInfo,
            setUserInfo,
            setRefreshTrigger,
            sectionCounts,
        },
        ref,
    ) => {
        const [sectionDisplayed, setSectionDisplayed] = useState<
            'personal' | 'education' | 'job_experience' | 'skills' | 'projects'
        >('personal');

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
        /*
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
        const linkedinButtonStyles = (mode: InputMode) => ({
            root: {
                padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
                height: 'auto',
                fontSize: theme.fontSizes.sm,
                fontWeight: 600,
                boxShadow: mode === 'linkedin' ? theme.shadows.md : 'none',
                backgroundColor:
                    mode === 'linkedin' ? theme.colors.blue[7] : theme.white,
                color: mode === 'linkedin' ? theme.white : theme.colors.blue[8],
                '&:hover': {
                    backgroundColor:
                        mode === 'linkedin'
                            ? theme.colors.blue[8]
                            : theme.colors.blue[0],
                },
            },
        });
        */

        return (
            <Paper
                shadow="lg"
                p="md"
                radius="lg"
                withBorder={false}
                className={`${className} ${styles.mainUserForm}`}
                style={{ backgroundColor: theme.colors.gray[1] }}
                ref={ref}
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
                        {/*
                       // TODO for future update when we want to implement other imprt methods 
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
                        <Button
                            onClick={() => setInputMode('linkedin')}
                            variant="filled"
                            styles={() => linkedinButtonStyles(inputMode)}
                            leftSection={<LinkedInIcon />}
                        >
                            Import from LinkedIn
                        </Button>
                        */}
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
                                {Object.values(sectionCounts).map((tab) => {
                                    const isComplete =
                                        tab.current >= tab.required;
                                    return (
                                        <button // Using button for accessibility and click handling
                                            key={tab.value}
                                            type="button" // Important for buttons not submitting forms
                                            className={`${
                                                styles.sidebarNavItem
                                            } ${
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
                                            <Group wrap="nowrap" gap="xs">
                                                {isComplete ? (
                                                    <IconCheck
                                                        size={16}
                                                        color="green"
                                                    />
                                                ) : (
                                                    <IconClock size={16} />
                                                )}
                                                <Text component="span" fz="sm">
                                                    {tab.current < tab.required
                                                        ? `${tab.label} (${tab.current}/${tab.required})`
                                                        : tab.label}
                                                </Text>
                                            </Group>
                                        </button>
                                    );
                                })}
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
                                        educationInfo === false
                                            ? []
                                            : educationInfo
                                    }
                                    setRefreshTrigger={setRefreshTrigger}
                                />
                            )}

                            {sectionDisplayed == 'skills' && (
                                <SkillContainerForm
                                    setSkillInfo={setSkillInfo}
                                    skillInfo={
                                        skillInfo === false ? [] : skillInfo
                                    }
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
                                        educationInfo === false
                                            ? []
                                            : educationInfo
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
                {/*
                // TODO this is a future update when we want to implement another way of importing experience
                {inputMode === 'linkedin' && <LinkedInImporter />}
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
                            This section will allow you to import your resume
                            data using AI.
                        </Text>
                    </Paper>
                )}
                    */}
            </Paper>
        );
    },
);

MainUserForm.displayName = 'MainUserForm';

export default MainUserForm;
