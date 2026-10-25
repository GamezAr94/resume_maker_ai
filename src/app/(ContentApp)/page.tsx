"use client";

import styles from "./page.module.css";
import MainUserForm from "../components/userFormComponents/mainUserForm";
import MainJobForm from "../components/jobOfferFormComponents/mainJobForm";
import { Alert, Button, Divider, Group, FileButton } from "@mantine/core";
import { ProfileCompletionCard } from "../components/ProfileCompletion/ProfileCompletionCard";
import { useRef, useState, useEffect } from "react";
import {
    FormEducationStructure,
    FormExperienceStructure,
    FormPersonalStructure,
    FormProjectStructure,
    FormSkillStructure,
    RefreshSections,
} from "@/utils/interfaces";
import { calculateProfileCompleteness } from "@/utils/profile-completeness";
import { PROFILE_COMPLETION_WEIGHTS } from "../config/profile.config";
import {
    IconAlertCircle,
    IconArrowRight,
    IconDownload,
    IconUpload,
    IconFileUpload,
    IconCheck,
} from "@tabler/icons-react";
import ResumeUploader from "../components/onboarding/ResumeUploader";
import { notifications } from "@mantine/notifications";

export default function Home() {
    const mainFormRef = useRef<HTMLDivElement>(null);

    const [error, setError] = useState<string | null>(null);
    const [skipOnboarding, setSkipOnboarding] = useState(false);
    const [showUploader, setShowUploader] = useState(false);

    const [refreshTrigger, setRefreshTrigger] = useState<RefreshSections>({
        experience: false,
        education: false,
        skill: false,
        project: false,
        personal: false,
    });

    const [projectInfo, setProjectInfo] = useState<
        FormProjectStructure[] | false
    >(false);
    const [experienceInfo, setExperienceInfo] = useState<
        FormExperienceStructure[] | false
    >(false);
    const [educationInfo, setEducationInfo] = useState<
        FormEducationStructure[] | false
    >(false);
    const [skillInfo, setSkillInfo] = useState<FormSkillStructure[] | false>(
        false,
    );
    const [userInfo, setUserInfo] = useState<FormPersonalStructure | false>(
        false,
    );

    const { percentage, status = "ready" } = calculateProfileCompleteness({
        userInfo: userInfo || null,
        experienceInfo: experienceInfo || [],
        educationInfo: educationInfo || [],
        skillInfo: skillInfo || [],
        projectInfo: projectInfo || [],
    });

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
            label: "Personal Info",
            value: "personal",
        },
        education: {
            current: educationInfo ? educationInfo.length : 0,
            required: PROFILE_COMPLETION_WEIGHTS.MAX_EDUCATION_FOR_SCORE,
            label: "Education",
            value: "education",
        },
        job_experience: {
            current: experienceInfo ? experienceInfo.length : 0,
            required:
                PROFILE_COMPLETION_WEIGHTS.MAX_EXPERIENCE_ENTRIES_FOR_SCORE,
            label: "Experience",
            value: "job_experience",
        },
        skills: {
            current: skillInfo ? skillInfo.length : 0,
            required: PROFILE_COMPLETION_WEIGHTS.MAX_SKILLS_FOR_SCORE,
            label: "Skills",
            value: "skills",
        },
        projects: {
            current: projectInfo ? projectInfo.length : 0,
            required: PROFILE_COMPLETION_WEIGHTS.MAX_PROJECTS_FOR_SCORE,
            label: "Projects",
            value: "projects",
        },
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setError(null);
            try {
                const response = await fetch("/api/profile/all-sections");
                if (!response.ok) {
                    throw new Error("Failed to fetch profile data");
                }
                const allData = await response.json();

                setUserInfo(allData.userInfo);
                setExperienceInfo(allData.experienceInfo);
                setEducationInfo(allData.educationInfo);
                setSkillInfo(allData.skillInfo);
                setProjectInfo(allData.projectInfo);
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred.";
                setError(errorMessage);
            }
        };

        fetchAllData();
    }, [refreshTrigger]);

    const handleScrollToForm = () => {
        mainFormRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const handleExportProfileJson = async () => {
        try {
            const res = await fetch("/api/profile/backup");
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const name = userInfo && userInfo.first_name ? userInfo.first_name : "profile";
            a.download = `${name}_master_profile.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        }
    };

    const handleImportProfileJson = async (file: File | null) => {
        if (!file) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            const res = await fetch("/api/profile/backup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clearExisting: true,
                    ...parsed,
                }),
            });
            if (!res.ok) throw new Error("Failed to import JSON profile");
            notifications.show({
                title: "Profile Loaded!",
                message: "Your master profile JSON was imported into SQLite.",
                color: "teal",
                icon: <IconCheck />,
            });
            setSkipOnboarding(true);
            setShowUploader(false);
            setRefreshTrigger((prev) => ({ ...prev, personal: !prev.personal }));
        } catch (err) {
            notifications.show({
                title: "Import Error",
                message: err instanceof Error ? err.message : "Invalid JSON file",
                color: "red",
            });
        }
    };

    const isNewUser =
        experienceInfo !== false &&
        experienceInfo.length === 0 &&
        educationInfo !== false &&
        educationInfo.length === 0 &&
        projectInfo !== false &&
        projectInfo.length === 0;

    const shouldShowUploader = (isNewUser && !skipOnboarding) || showUploader;

    return (
        <div>
            <main className={styles.main}>
                {/* Top Utility Bar: Switch / Backup / Restore Profiles or Upload PDF */}
                <Group justify="flex-end" mb="md" gap="xs">
                    {!shouldShowUploader && (
                        <Button
                            variant="light"
                            size="xs"
                            leftSection={<IconFileUpload size={16} />}
                            onClick={() => setShowUploader(true)}
                        >
                            AI Resume Uploader (PDF/DOCX)
                        </Button>
                    )}
                    <FileButton
                        onChange={handleImportProfileJson}
                        accept="application/json"
                    >
                        {(props) => (
                            <Button
                                {...props}
                                variant="default"
                                size="xs"
                                leftSection={<IconUpload size={16} />}
                            >
                                Load Profile JSON
                            </Button>
                        )}
                    </FileButton>
                    <Button
                        variant="default"
                        size="xs"
                        leftSection={<IconDownload size={16} />}
                        onClick={handleExportProfileJson}
                    >
                        Backup Profile JSON
                    </Button>
                </Group>

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
                        {shouldShowUploader ? (
                            <div>
                                <ResumeUploader
                                    onUploadComplete={() => {
                                        setShowUploader(false);
                                        setSkipOnboarding(true);
                                        setRefreshTrigger((prev) => ({
                                            ...prev,
                                            personal: !prev.personal,
                                        }));
                                    }}
                                />
                                <Group justify="center" mt="md">
                                    <Button
                                        variant="subtle"
                                        size="md"
                                        rightSection={<IconArrowRight size={18} />}
                                        onClick={() => {
                                            setSkipOnboarding(true);
                                            setShowUploader(false);
                                        }}
                                    >
                                        Skip & Enter Data Manually
                                    </Button>
                                </Group>
                            </div>
                        ) : (
                            <>
                                <div className={styles.topSectionContainer}>
                                    <div className={styles.leftColumn}>
                                        <MainJobForm
                                            onCompleteProfileClick={
                                                handleScrollToForm
                                            }
                                            status={status}
                                            percentage={percentage}
                                            sectionCounts={sectionCounts}
                                        />
                                    </div>
                                    <div className={styles.rightColumn}>
                                        <ProfileCompletionCard
                                            onCompleteProfileClick={
                                                handleScrollToForm
                                            }
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
                    </>
                )}
            </main>
        </div>
    );
}
