"use client";
import { deleteProfileRecord } from "@/app/db/user_queries";
import { SectionTypes } from "@/utils/enums";
import {
    emptyStateProject,
    FormEducationStructure,
    FormExperienceStructure,
    FormProjectStructure,
    RefreshSections,
    ProjectDetails,
} from "@/utils/interfaces";
import {
    Button,
    Select,
    Group,
    Text,
    Stack,
    TextInput,
    Textarea,
    ActionIcon,
    Divider,
    TagsInput,
    Badge,
} from "@mantine/core";
import {
    IconCheck,
    IconPencil,
    IconTrash,
    IconX,
    IconPlus,
} from "@tabler/icons-react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import styles from "./formContainerStyles.module.css";
import { notifications } from "@mantine/notifications";
import CharacterCounter from "@/app/components/CharacterCounter/CharacterCounter";
import { CHARACTER_LIMITS } from "@/utils/configLimits";
import { projectSchema } from "@/utils/zod_schemas";

interface Params {
    infoQuery: FormProjectStructure | null;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    educationInfo: FormEducationStructure[] | [];
    experienceInfo: FormExperienceStructure[] | [];
    setEditRecord: Dispatch<SetStateAction<FormProjectStructure | null>>;
    getEditRecord: FormProjectStructure | null;
    setSelectedType: Dispatch<
        SetStateAction<"personal_type" | "experience_type" | "education_type">
    >;
    selectedType: "personal_type" | "experience_type" | "education_type";
}

export default function ProjectsInfoForm({
    infoQuery,
    setRefreshTrigger,
    educationInfo,
    experienceInfo,
    setEditRecord,
    getEditRecord,
    setSelectedType,
    selectedType,
}: Params) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string | null>>(
        {},
    );

    async function validatingAndSaving(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const currentDetails =
                getEditRecord?.details || emptyStateProject.details;

            const cleanFeatures = (currentDetails.key_features || [])
                .map((item) => item.trim())
                .filter((item) => item.length > 0);
            const cleanMetrics = (currentDetails.impact_metrics || [])
                .map((item) => item.trim())
                .filter((item) => item.length > 0);
            const cleanTechStack = (currentDetails.tech_stack || [])
                .map((item) => item.trim())
                .filter((item) => item.length > 0);
            const cleanKeywords = (currentDetails.keywords || [])
                .map((item) => item.trim())
                .filter((item) => item.length > 0);

            const dataToValidate = {
                ...(getEditRecord?.id && { id: getEditRecord.id }),
                project_name: getEditRecord?.project_name || "",
                experience_id: getEditRecord?.experience_id || null,
                education_id: getEditRecord?.education_id || null,
                details: {
                    ...currentDetails,
                    my_role: currentDetails.my_role?.trim() || "",
                    key_features: cleanFeatures,
                    impact_metrics: cleanMetrics,
                    tech_stack: cleanTechStack,
                    keywords: cleanKeywords,
                },
            };

            const parseUser = projectSchema.safeParse(dataToValidate);
            setFormErrors({});

            if (!parseUser.success) {
                const error = parseUser.error;
                const newErrors: Record<string, string> = {};
                for (const issue of error.issues) {
                    const path = issue.path.join(".");
                    newErrors[path] = issue.message;
                }
                setFormErrors(newErrors);
                return;
            }

            const res = await fetch("/api/saveUserInfo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: SectionTypes.Project,
                    data: parseUser.data,
                }),
            });
            const response = await res.json();

            if (!res.ok) {
                notifications.show({
                    title: "Error Saving",
                    message: response.message || "An unknown error occurred.",
                    color: "red",
                    icon: <IconX />,
                });
                return;
            }

            notifications.show({
                title: "Success!",
                message: "Your project has been saved.",
                color: "teal",
                icon: <IconCheck />,
            });

            setRefreshTrigger((prevTrigger) => ({
                ...prevTrigger,
                project: !prevTrigger.project,
            }));
            setEditRecord(null);
            setSelectedType("personal_type");
            formRef.current?.reset();
        } finally {
            setIsSubmitting(false);
        }
    }

    async function submitDeleteRecord(table: SectionTypes, value: string) {
        try {
            await deleteProfileRecord(table, value);
            notifications.show({
                title: "Success!",
                message: "The project has been deleted.",
                color: "teal",
                icon: <IconCheck />,
            });
            setRefreshTrigger((prevTrigger) => ({
                ...prevTrigger,
                project: !prevTrigger.project,
            }));
            setEditRecord(null);
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred.";
            notifications.show({
                title: "Error Deleting",
                message: errorMessage,
                color: "red",
                icon: <IconX />,
            });
        }
    }

    function editRecord(value: FormProjectStructure | null) {
        setFormErrors({});
        setSelectedType("personal_type");
        if (value?.experience_id != null) {
            setSelectedType("experience_type");
        }
        if (value?.education_id != null) {
            setSelectedType("education_type");
        }
        setEditRecord(value);
    }

    function setType(event: string | null) {
        setEditRecord((prev) => {
            const updatedRecord = { ...(prev || emptyStateProject) };
            updatedRecord.education_id = null;
            updatedRecord.experience_id = null;
            return updatedRecord;
        });

        if (event === "Experience") {
            setSelectedType("experience_type");
        } else if (event === "Education") {
            setSelectedType("education_type");
        } else {
            setSelectedType("personal_type");
        }
    }

    function handleDetailsChange(
        field: keyof ProjectDetails,
        value: string | string[],
    ) {
        setEditRecord((current) => ({
            ...(current || emptyStateProject),
            details: {
                ...(current?.details || emptyStateProject.details),
                [field]: value,
            },
        }));
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [`details.${field}`]: null,
        }));
    }

    function handleArrayItemChange(
        field: "key_features" | "impact_metrics",
        index: number,
        value: string,
    ) {
        const currentList = getEditRecord?.details?.[field] || [];
        const newList = [...currentList];
        newList[index] = value;
        handleDetailsChange(field, newList);
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [`details.${field}.${index}`]: null,
        }));
    }

    function addArrayItem(field: "key_features" | "impact_metrics") {
        const currentList = getEditRecord?.details?.[field] || [];
        handleDetailsChange(field, [...currentList, ""]);
    }

    function removeArrayItem(
        field: "key_features" | "impact_metrics",
        index: number,
    ) {
        const currentList = getEditRecord?.details?.[field] || [];
        handleDetailsChange(
            field,
            currentList.filter((_, i) => i !== index),
        );
    }

    const projectTypeOptions = ["Personal"];
    if (experienceInfo && experienceInfo.length > 0) {
        projectTypeOptions.push("Experience");
    }
    if (educationInfo && educationInfo.length > 0) {
        projectTypeOptions.push("Education");
    }

    return (
        <form ref={formRef} onSubmit={validatingAndSaving}>
            {infoQuery && (
                <div className={styles.infoCard}>
                    <div style={{ flex: 1, paddingRight: 12 }}>
                        <Group gap="xs" mb={4}>
                            <Text className={styles.infoTextPrimary}>
                                {infoQuery.project_name}
                            </Text>
                            {infoQuery.company_name && (
                                <Badge size="xs" color="indigo" variant="light">
                                    Work: {infoQuery.company_name}
                                </Badge>
                            )}
                            {infoQuery.school_name && (
                                <Badge size="xs" color="teal" variant="light">
                                    Academic: {infoQuery.school_name}
                                </Badge>
                            )}
                            {!infoQuery.company_name && !infoQuery.school_name && (
                                <Badge size="xs" color="gray" variant="light">
                                    Personal / Open Source
                                </Badge>
                            )}
                        </Group>
                        <Text
                            className={styles.infoTextSecondary}
                            lineClamp={1}
                        >
                            {infoQuery.details?.problem_solved ||
                                infoQuery.project_description}
                        </Text>
                    </div>
                    <Group
                        gap="xs"
                        justify="flex-end"
                        className={styles.infoActions}
                    >
                        <Button
                            variant="light"
                            color="blue"
                            size="sm"
                            leftSection={<IconPencil size={16} />}
                            onClick={() => editRecord(infoQuery)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="light"
                            color="red"
                            size="sm"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => {
                                submitDeleteRecord(
                                    SectionTypes.Project,
                                    infoQuery.id,
                                );
                            }}
                        >
                            Delete
                        </Button>
                    </Group>
                </div>
            )}
            {!infoQuery && (
                <Stack gap="md">
                    <Group grow>
                        <TextInput
                            label="Project Name"
                            placeholder="e.g., Distributed Payment Microservice"
                            maxLength={CHARACTER_LIMITS.title}
                            error={formErrors["project_name"]}
                            value={getEditRecord?.project_name || ""}
                            onChange={(e) => {
                                const val = e.currentTarget.value;
                                setEditRecord((prev) => ({
                                    ...(prev || emptyStateProject),
                                    project_name: val,
                                }));
                                setFormErrors((prev) => ({
                                    ...prev,
                                    project_name: null,
                                }));
                            }}
                            required
                        />
                        <TextInput
                            label="Your Role on This Project"
                            placeholder="e.g., Lead Backend Engineer / Solo Creator"
                            maxLength={CHARACTER_LIMITS.title}
                            value={getEditRecord?.details?.my_role || ""}
                            onChange={(e) =>
                                handleDetailsChange(
                                    "my_role",
                                    e.currentTarget.value,
                                )
                            }
                        />
                    </Group>

                    <Group grow>
                        <Select
                            label="Where Was This Project Built?"
                            value={
                                selectedType === "experience_type"
                                    ? "Experience"
                                    : selectedType === "education_type"
                                      ? "Education"
                                      : "Personal"
                            }
                            data={projectTypeOptions}
                            onChange={setType}
                        />
                        {selectedType === "experience_type" && (
                            <Select
                                label="Link to Work Experience"
                                placeholder="Select company"
                                error={formErrors.experience_id}
                                value={
                                    getEditRecord?.experience_id
                                        ? String(getEditRecord.experience_id)
                                        : null
                                }
                                data={experienceInfo.map((item) => ({
                                    label: `${item.job_title} @ ${item.company_name}`,
                                    value: String(item.id),
                                }))}
                                onChange={(val) =>
                                    setEditRecord((prev) => ({
                                        ...(prev || emptyStateProject),
                                        experience_id: val,
                                    }))
                                }
                            />
                        )}
                        {selectedType === "education_type" && (
                            <Select
                                label="Link to Education"
                                placeholder="Select school"
                                error={formErrors.education_id}
                                value={
                                    getEditRecord?.education_id
                                        ? String(getEditRecord.education_id)
                                        : null
                                }
                                data={educationInfo.map((item) => ({
                                    label: item.school_name,
                                    value: String(item.id),
                                }))}
                                onChange={(val) =>
                                    setEditRecord((prev) => ({
                                        ...(prev || emptyStateProject),
                                        education_id: val,
                                    }))
                                }
                            />
                        )}
                    </Group>

                    {/* Pillar 1: Problem Solved / Context */}
                    <div className={styles.inputWrapper}>
                        <Textarea
                            label="1. Problem Solved & Context (Situation)"
                            description="What business or technical challenge did this project solve?"
                            placeholder="e.g., Built an automated CI/CD and container monitoring system to replace manual deployments..."
                            value={getEditRecord?.details?.problem_solved || ""}
                            onChange={(e) =>
                                handleDetailsChange(
                                    "problem_solved",
                                    e.currentTarget.value,
                                )
                            }
                            autosize
                            minRows={2}
                            maxLength={CHARACTER_LIMITS.description}
                        />
                        <CharacterCounter
                            currentLength={
                                getEditRecord?.details?.problem_solved
                                    ?.length || 0
                            }
                            maxLength={CHARACTER_LIMITS.description}
                        />
                    </div>

                    <Divider
                        my="xs"
                        label="Technical Implementation & Impact"
                        labelPosition="center"
                    />

                    {/* Pillar 2: What You Built / Key Features */}
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>
                            2. What You Architected & Built (Technical Actions)
                        </Text>
                        {(getEditRecord?.details?.key_features || []).map(
                            (item, index) => (
                                <Group key={`feat-${index}`} gap="xs">
                                    <TextInput
                                        style={{ flex: 1 }}
                                        placeholder="e.g., Designed REST API and webhook worker queue using Node.js and Redis"
                                        value={item}
                                        maxLength={CHARACTER_LIMITS.bulletPoint}
                                        error={
                                            formErrors[
                                                `details.key_features.${index}`
                                            ]
                                        }
                                        onChange={(e) =>
                                            handleArrayItemChange(
                                                "key_features",
                                                index,
                                                e.currentTarget.value,
                                            )
                                        }
                                    />
                                    <ActionIcon
                                        color="red"
                                        variant="subtle"
                                        onClick={() =>
                                            removeArrayItem(
                                                "key_features",
                                                index,
                                            )
                                        }
                                    >
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Group>
                            ),
                        )}
                        <Button
                            variant="light"
                            size="xs"
                            leftSection={<IconPlus size={14} />}
                            onClick={() => addArrayItem("key_features")}
                        >
                            Add Technical Action / Feature
                        </Button>
                    </Stack>

                    {/* Pillar 3: Quantifiable Impact & Metrics */}
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>
                            3. Quantifiable Impact & Metrics (Results / Wins)
                        </Text>
                        {(getEditRecord?.details?.impact_metrics || []).map(
                            (item, index) => (
                                <Group key={`metric-${index}`} gap="xs">
                                    <TextInput
                                        style={{ flex: 1 }}
                                        placeholder="e.g., Reduced deployment time by 75% and supported 10,000+ daily requests"
                                        value={item}
                                        maxLength={CHARACTER_LIMITS.bulletPoint}
                                        error={
                                            formErrors[
                                                `details.impact_metrics.${index}`
                                            ]
                                        }
                                        onChange={(e) =>
                                            handleArrayItemChange(
                                                "impact_metrics",
                                                index,
                                                e.currentTarget.value,
                                            )
                                        }
                                    />
                                    <ActionIcon
                                        color="red"
                                        variant="subtle"
                                        onClick={() =>
                                            removeArrayItem(
                                                "impact_metrics",
                                                index,
                                            )
                                        }
                                    >
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Group>
                            ),
                        )}
                        <Button
                            variant="light"
                            color="teal"
                            size="xs"
                            leftSection={<IconPlus size={14} />}
                            onClick={() => addArrayItem("impact_metrics")}
                        >
                            Add Impact / Metric
                        </Button>
                    </Stack>

                    {/* Pillar 4: Fast TagsInput for Tech Stack & Domain Keywords */}
                    <TagsInput
                        label="4. Tech Stack (Type & press Enter or Comma)"
                        description="Languages, frameworks, databases, and tools used in this project"
                        placeholder="e.g., TypeScript, Next.js, PostgreSQL, Docker, n8n"
                        value={getEditRecord?.details?.tech_stack || []}
                        onChange={(tags) =>
                            handleDetailsChange("tech_stack", tags)
                        }
                    />

                    <TagsInput
                        label="5. Domain & Architecture Keywords (Optional - Helps AI Retrieval)"
                        description="High-level concepts proven by this project"
                        placeholder="e.g., Microservices, CI/CD, RAG, Authentication, System Migration"
                        value={getEditRecord?.details?.keywords || []}
                        onChange={(tags) =>
                            handleDetailsChange("keywords", tags)
                        }
                    />

                    <TextInput
                        label="Project / Repository URL (Optional)"
                        placeholder="https://github.com/..."
                        value={getEditRecord?.details?.url || ""}
                        maxLength={CHARACTER_LIMITS.url}
                        error={formErrors["details.url"]}
                        onChange={(e) =>
                            handleDetailsChange("url", e.currentTarget.value)
                        }
                    />

                    <Divider my="xs" />

                    <Group justify="flex-start">
                        <Button type="submit" loading={isSubmitting}>
                            {getEditRecord?.id ? "Save Changes" : "Add Project"}
                        </Button>
                        {getEditRecord && (
                            <Button
                                loading={isSubmitting}
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => editRecord(null)}
                            >
                                Cancel
                            </Button>
                        )}
                    </Group>
                </Stack>
            )}
        </form>
    );
}
