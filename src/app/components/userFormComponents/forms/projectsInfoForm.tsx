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
    Input,
    Select,
    Group,
    Text,
    Stack,
    TextInput,
    Textarea,
    ActionIcon,
    Divider,
} from "@mantine/core";
import {
    IconCheck,
    IconPencil,
    IconTrash,
    IconX,
    IconPlus,
} from "@tabler/icons-react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { z } from "zod";
import styles from "./formContainerStyles.module.css";
import { notifications } from "@mantine/notifications";

import CharacterCounter from "@/app/components/CharacterCounter/CharacterCounter";

// Character limits for the form fields
import { CHARACTER_LIMITS } from "@/utils/configLimits";

interface Params {
    infoQuery: FormProjectStructure | null;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    educationInfo: [FormEducationStructure] | [];
    experienceInfo: [FormExperienceStructure] | [];
    setEditRecord: Dispatch<SetStateAction<FormProjectStructure | null>>;
    getEditRecord: FormProjectStructure | null;
    setSelectedType: Dispatch<
        SetStateAction<"personal_type" | "experience_type" | "education_type">
    >;
    selectedType: "personal_type" | "experience_type" | "education_type";
}

const userSchema = z.object({
    id: z.string().optional(),
    project_name: z
        .string()
        .min(1, "Project Name is required")
        .max(
            CHARACTER_LIMITS.title,
            `Cannot exceed ${CHARACTER_LIMITS.title} characters`,
        ),
    project_description: z
        .string()
        .min(1, "A description is required")
        .max(
            CHARACTER_LIMITS.description,
            `Cannot exceed ${CHARACTER_LIMITS.description} characters`,
        ),
});

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
    // whit this we will erase all the data in the form after saving it
    const formRef = useRef<HTMLFormElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // State to store the errors in the form
    const [formErrors, setFormErrors] =
        useState<FormProjectStructure>(emptyStateProject);

    // Function to validate the user data and save it
    async function validatingAndSaving(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        // prevent the default form submission and fetch the data
        event.preventDefault();

        setIsSubmitting(true);

        try {
            // get the form data
            const formData = new FormData();
            if (getEditRecord) {
                Object.entries(getEditRecord).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value != "") {
                        formData.append(key, String(value));
                    }
                });
            }

            // parse the user data with the zod schema
            const parseUser = userSchema.safeParse(
                Object.fromEntries(formData),
            );

            // reset the errors in the state
            setFormErrors(emptyStateProject);

            // if the user data is not valid, store the errors in the state and return
            if (!parseUser.success) {
                const error = parseUser.error;
                let newErrors = emptyStateProject;
                for (const issue of error.errors) {
                    newErrors = {
                        ...newErrors,
                        [issue.path[0]]: issue.message,
                    };
                }
                // set the errors in the state to show them to the user
                setFormErrors(newErrors);
                return;
            }

            const res = await fetch("api/saveUserInfo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: SectionTypes.Project,
                    data: Object.fromEntries(formData),
                }),
            });
            const response = await res.json();

            // show a message to the user
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
            // required to refresh the UI
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

    // Function to delete the record and refresh the UI
    async function submitDeleteRecord(table: SectionTypes, value: string) {
        try {
            // Call the helper function and wait for its result
            await deleteProfileRecord(table, value);

            // --- This code only runs if deleteProfileRecord was successful ---
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
            // --- This code runs if deleteProfileRecord threw an error ---
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

    // with this function we can edit an element and we can also cancel the edition
    function editRecord(value: FormProjectStructure | null) {
        // we need to remove the existing errors if any
        // TODO this method it is ONLY working when you click the button cancel, if we want to make it work when pressing the edit button then we need to move the useState to the container component of this component so that we can share it accross that one and this one
        setFormErrors(emptyStateProject);
        // elect by default the personal_type just in case
        setSelectedType("personal_type");
        if (value?.experience_id != null) {
            setSelectedType("experience_type");
        }
        if (value?.education_id != null) {
            setSelectedType("education_type");
        }
        // set the value that we want to edit
        setEditRecord(value);
    }

    // Function to set the project type experience or education
    //function setType(event: React.ChangeEvent<HTMLSelectElement>) {
    function setType(event: string | null) {
        setEditRecord((prev) => ({
            ...emptyStateProject,
            ...prev,
            education_id: null,
            experience_id: null,
        }));

        setEditRecord((prev) => {
            if (!prev) return emptyStateProject; // Handle case where prev is null

            const updatedRecord = { ...prev };

            if (event === "Experience") {
                updatedRecord.education_id = null; // Clear education
            } else if (event === "Education") {
                updatedRecord.experience_id = null; // Clear experience
            } else {
                // It's a "Personal" project, clear both
                updatedRecord.education_id = null;
                updatedRecord.experience_id = null;
            }
            return updatedRecord;
        });

        if (event == null) {
            setSelectedType("personal_type");
        }
        if (event == "Experience") {
            setSelectedType("experience_type");
        } else if (event == "Education") {
            setSelectedType("education_type");
        } else {
            setSelectedType("personal_type");
        }
    }

    interface HandleInputChangeEvent {
        target: {
            value: string;
        };
    }
    // Function to handle the input change and also to rever the form errors
    function handleInputChange(
        event: HandleInputChangeEvent,
        type: keyof FormProjectStructure,
        setter: Dispatch<SetStateAction<FormProjectStructure | null>>,
        prevState: FormProjectStructure | null,
    ) {
        if (!prevState) {
            prevState = emptyStateProject;
        }
        setter({
            ...prevState,
            [type]: event.target.value,
        });
        setFormErrors((prev) => ({
            ...prev,
            [type]: null,
        }));
    }
    function handleSelectChange(
        id: string | null,
        type: keyof FormProjectStructure,
        setter: Dispatch<SetStateAction<FormProjectStructure | null>>,
        prevState: FormProjectStructure | null,
    ) {
        if (!prevState) {
            prevState = emptyStateProject;
        }
        setter({
            ...prevState,
            [type]: id,
        });
        setFormErrors((prev) => ({
            ...prev,
            [type]: null,
        }));
    }
    const projectTypeOptions = ["Personal"];
    if (experienceInfo && experienceInfo.length > 0) {
        projectTypeOptions.push("Experience");
    }
    if (educationInfo && educationInfo.length > 0) {
        projectTypeOptions.push("Education");
    }

    // Handle updates for the nested 'details' object (Problem Solved, URL)
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
    }

    // Update a specific item in a list (Features, Tech Stack)
    function handleArrayItemChange(
        field: "key_features" | "tech_stack",
        index: number,
        value: string,
    ) {
        const currentList = getEditRecord?.details?.[field] || [];
        const newList = [...currentList];
        newList[index] = value;
        handleDetailsChange(field, newList);
    }

    // Add a new empty line to a list
    function addArrayItem(field: "key_features" | "tech_stack") {
        const currentList = getEditRecord?.details?.[field] || [];
        handleDetailsChange(field, [...currentList, ""]);
    }

    // Remove a line from a list
    function removeArrayItem(
        field: "key_features" | "tech_stack",
        index: number,
    ) {
        const currentList = getEditRecord?.details?.[field] || [];
        handleDetailsChange(
            field,
            currentList.filter((_, i) => i !== index),
        );
    }

    return (
        <form ref={formRef} onSubmit={validatingAndSaving}>
            {infoQuery && (
                <div className={styles.infoCard}>
                    <div>
                        <Text className={styles.infoTextPrimary}>
                            {infoQuery.project_name}
                        </Text>
                        <Text
                            className={styles.infoTextSecondary}
                            lineClamp={1}
                        >
                            {infoQuery.project_description}
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
                <>
                    <Input.Wrapper
                        label="Project Name"
                        error={
                            formErrors.project_name
                                ? formErrors.project_name
                                : ""
                        }
                        classNames={{
                            root: styles.formField,
                            label: styles.formLabel,
                        }}
                    >
                        <Input
                            classNames={{ input: styles.formInput }}
                            error={!!formErrors.project_name}
                            type="text"
                            name="project_name"
                            maxLength={CHARACTER_LIMITS.title}
                            placeholder="e.g., AI Resume Analyzer"
                            onChange={(event) => {
                                handleInputChange(
                                    event,
                                    "project_name",
                                    setEditRecord,
                                    getEditRecord,
                                );
                            }}
                            value={
                                getEditRecord ? getEditRecord.project_name : ""
                            }
                        />
                    </Input.Wrapper>

                    {/* Project Type Select */}
                    <Select
                        label="Project Type"
                        placeholder="Select a type"
                        value={
                            selectedType === "experience_type"
                                ? "Experience"
                                : selectedType === "education_type"
                                  ? "Education"
                                  : "Personal"
                        }
                        data={projectTypeOptions}
                        onChange={setType}
                        classNames={{
                            root: styles.formField,
                            label: styles.formLabel,
                            input: styles.formInput,
                        }}
                    />

                    {selectedType === "experience_type" && (
                        <Select
                            label="Link to Experience"
                            placeholder="Select an experience"
                            defaultValue={
                                getEditRecord?.experience_id
                                    ? String(getEditRecord.experience_id)
                                    : ""
                            }
                            data={experienceInfo.map((item) => ({
                                label: item.company_name,
                                value: String(item.id),
                            }))}
                            onChange={(event) => {
                                handleSelectChange(
                                    event,
                                    "experience_id",
                                    setEditRecord,
                                    getEditRecord,
                                );
                            }}
                            classNames={{
                                root: styles.formField,
                                label: styles.formLabel,
                                input: styles.formInput,
                            }}
                        />
                    )}

                    {selectedType === "education_type" && (
                        <Select
                            label="Link to Education"
                            placeholder="Select an institution"
                            defaultValue={
                                getEditRecord?.education_id
                                    ? String(getEditRecord.education_id)
                                    : ""
                            }
                            data={educationInfo.map((item) => ({
                                label: item.school_name,
                                value: String(item.id),
                            }))}
                            onChange={(event) => {
                                handleSelectChange(
                                    event,
                                    "education_id",
                                    setEditRecord,
                                    getEditRecord,
                                );
                            }}
                            classNames={{
                                root: styles.formField,
                                label: styles.formLabel,
                                input: styles.formInput,
                            }}
                        />
                    )}

                    {/* Project Description Input */}
                    <div className={styles.inputWrapper}>
                        <Textarea
                            label="Problem Solved / Summary"
                            description="What does this project do? (The 'Elevator Pitch')"
                            placeholder="e.g. A micro-SaaS that helps users generate resumes..."
                            value={getEditRecord?.details?.problem_solved || ""}
                            onChange={(e) =>
                                handleDetailsChange(
                                    "problem_solved",
                                    e.currentTarget.value,
                                )
                            }
                            autosize
                            minRows={3}
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

                    <Divider my="sm" label="Details" labelPosition="center" />

                    {/* 2. Key Features List */}
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>
                            Key Features
                        </Text>
                        {(getEditRecord?.details?.key_features || []).map(
                            (item, index) => (
                                <Group key={`feat-${index}`} gap="xs">
                                    <TextInput
                                        style={{ flex: 1 }}
                                        placeholder="e.g. Real-time chat integration"
                                        value={item}
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
                            Add Feature
                        </Button>
                    </Stack>

                    {/* 3. Tech Stack List */}
                    <Stack gap="xs" mt="md">
                        <Text size="sm" fw={500}>
                            Tech Stack
                        </Text>
                        {(getEditRecord?.details?.tech_stack || []).map(
                            (item, index) => (
                                <Group key={`tech-${index}`} gap="xs">
                                    <TextInput
                                        style={{ flex: 1 }}
                                        placeholder="e.g. Next.js"
                                        value={item}
                                        onChange={(e) =>
                                            handleArrayItemChange(
                                                "tech_stack",
                                                index,
                                                e.currentTarget.value,
                                            )
                                        }
                                    />
                                    <ActionIcon
                                        color="red"
                                        variant="subtle"
                                        onClick={() =>
                                            removeArrayItem("tech_stack", index)
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
                            onClick={() => addArrayItem("tech_stack")}
                        >
                            Add Tech
                        </Button>
                    </Stack>

                    {/* 4. Project URL (Optional) */}
                    <TextInput
                        mt="md"
                        label="Project URL"
                        placeholder="https://github.com/..."
                        value={getEditRecord?.details?.url || ""}
                        onChange={(e) =>
                            handleDetailsChange("url", e.currentTarget.value)
                        }
                    />

                    <Divider my="sm" />

                    {/* Action Buttons */}
                    <Group justify="flex-start" mt="xl">
                        <Button type="submit" loading={isSubmitting}>
                            {getEditRecord?.id ? "Save Changes" : "Add Entry"}
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
                </>
            )}
        </form>
    );
}
