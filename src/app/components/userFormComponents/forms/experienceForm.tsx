"use client";
import { deleteProfileRecord } from "@/app/db/user_queries";
import { SectionTypes } from "@/utils/enums";
import {
    emptyStateExperience,
    FormExperienceStructure,
    RefreshSections,
} from "@/utils/interfaces";
import {
    IconCheck,
    IconPencil,
    IconPlus,
    IconTrash,
    IconX,
} from "@tabler/icons-react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { z } from "zod";
import styles from "./formContainerStyles.module.css";
import {
    Button,
    Group,
    Text,
    TextInput,
    Stack,
    Checkbox,
    Textarea,
    ActionIcon,
    Divider,
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { ExperienceDetails } from "@/utils/interfaces";

// Character limits for the form fields
import { CHARACTER_LIMITS } from "@/utils/configLimits";
import CharacterCounter from "../../CharacterCounter/CharacterCounter";
import { experienceSchema } from "@/utils/zod_schemas";

interface Params {
    infoQuery: FormExperienceStructure | null;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    setEditRecord: Dispatch<SetStateAction<FormExperienceStructure | null>>;
    getEditRecord: FormExperienceStructure | null;
}
export default function ExperienceForm({
    infoQuery,
    setRefreshTrigger,
    setEditRecord,
    getEditRecord,
}: Params) {
    // whit this we will erase all the data in the form after saving it
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State to store the errors in the form
    const [formErrors, setFormErrors] = useState<Record<string, string | null>>(
        {},
    );

    // Function to validate the user data and save it
    async function validatingAndSaving(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        // prevent the default form submission and fetch the data
        event.preventDefault();

        setIsSubmitting(true);

        try {
            const currentDetails =
                getEditRecord?.details || emptyStateExperience.details;

            const cleanResponsibilities = (
                currentDetails.responsibilities || []
            )
                .map((i) => i.trim())
                .filter((i) => i.length > 0);

            const cleanAchievements = (currentDetails.achievements || [])
                .map((i) => i.trim())
                .filter((i) => i.length > 0);

            const cleanSkills = (currentDetails.skills_used || [])
                .map((i) => i.trim())
                .filter((i) => i.length > 0);

            // Directly build the object to validate from the state
            const dataToValidate = {
                ...(getEditRecord?.id && { id: getEditRecord.id }),
                company_name: getEditRecord?.company_name || "",
                job_title: getEditRecord?.job_title || "",
                start_date: getEditRecord?.start_date || "",
                end_date: getEditRecord?.end_date || undefined,
                is_current: getEditRecord?.is_current || false,
                details: {
                    ...currentDetails,
                    responsibilities: cleanResponsibilities,
                    achievements: cleanAchievements,
                    skills_used: cleanSkills,
                },
            };

            const parseUser = experienceSchema.safeParse(dataToValidate);

            // reset the errors in the state
            setFormErrors({});

            // if the user data is not valid, store the errors in the state and return
            if (!parseUser.success) {
                const error = parseUser.error;

                // 1. Create a plain object, NOT emptyStateExperience
                const newErrors: Record<string, string> = {};

                for (const issue of error.errors) {
                    // 2. Join the FULL path (e.g., "details" + "skills_used" + "0")
                    // This creates the string: "details.skills_used.0"
                    const path = issue.path.join(".");

                    // 3. Assign message to that specific path
                    newErrors[path] = issue.message;
                }

                setFormErrors(newErrors);
                return;
            }

            const res = await fetch("api/saveUserInfo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: SectionTypes.Experience,
                    data: parseUser.data, // Send the clean, validated data
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
                message: "Your experience has been saved.",
                color: "teal",
                icon: <IconCheck />,
            });
            // required to refresh the UI
            setRefreshTrigger((prevTrigger) => ({
                ...prevTrigger,
                experience: !prevTrigger.experience,
            }));
            setEditRecord(null);
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
                message: "The experience has been deleted.",
                color: "teal",
                icon: <IconCheck />,
            });

            setRefreshTrigger((prevTrigger) => ({
                ...prevTrigger,
                experience: !prevTrigger.experience,
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

    function editRecord(value: FormExperienceStructure | null) {
        // TODO this method it is ONLY working when you click the button cancel, if we want to make it work when pressing the edit button then we need to move the useState to the container component of this component so that we can share it accross that one and this one
        setFormErrors({});
        setEditRecord(value);
    }

    // A new, safer function to handle all input changes
    function handleInputChange(
        type: keyof FormExperienceStructure,
        value: string | boolean,
    ) {
        // This functional form of setEditRecord guarantees we always have the latest state
        setEditRecord((currentRecord) => ({
            ...(currentRecord || emptyStateExperience),
            [type]: value,
        }));

        // Clear any errors for the field being updated
        setFormErrors((prevErrors) => ({ ...prevErrors, [type]: null }));
    }

    // Handle updates for the nested 'details' object (Summary, Context)
    function handleDetailsChange(
        field: keyof ExperienceDetails,
        value: string | string[],
    ) {
        setEditRecord((current) => ({
            ...(current || emptyStateExperience),
            details: {
                ...(current?.details || emptyStateExperience.details),
                [field]: value,
            },
        }));

        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [`details.${field}`]: null,
        }));
    }

    // Update a specific item in a list (e.g., Responsibility #2)
    function handleArrayItemChange(
        field: "responsibilities" | "achievements" | "skills_used",
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

    // Add a new empty line to a list
    function addArrayItem(
        field: "responsibilities" | "achievements" | "skills_used",
    ) {
        const currentList = getEditRecord?.details?.[field] || [];
        handleDetailsChange(field, [...currentList, ""]);
    }

    // Remove a line from a list
    function removeArrayItem(
        field: "responsibilities" | "achievements" | "skills_used",
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
                            {infoQuery.job_title}
                        </Text>
                        <Text className={styles.infoTextSecondary}>
                            {infoQuery.company_name}
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
                                    SectionTypes.Experience,
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
                <Stack>
                    <TextInput
                        label="Job Title"
                        placeholder="e.g., Software Engineer"
                        maxLength={CHARACTER_LIMITS.title}
                        name="job_title"
                        error={formErrors["job_title"]}
                        value={getEditRecord?.job_title || ""}
                        onChange={(e) =>
                            handleInputChange(
                                "job_title",
                                e.currentTarget.value,
                            )
                        }
                        required
                    />
                    <TextInput
                        label="Company Name"
                        placeholder="e.g., Google"
                        maxLength={CHARACTER_LIMITS.company}
                        name="company_name"
                        value={getEditRecord?.company_name || ""}
                        onChange={(e) =>
                            handleInputChange(
                                "company_name",
                                e.currentTarget.value,
                            )
                        }
                        error={formErrors["company_name"]}
                        required
                    />

                    <Group grow>
                        <MonthPickerInput
                            label="Start Date"
                            defaultLevel="decade"
                            placeholder="Pick start date"
                            valueFormat="MMM YYYY"
                            value={getEditRecord?.start_date || null}
                            onChange={(newStartDateString) => {
                                const dateValue = newStartDateString || "";
                                handleInputChange("start_date", dateValue);

                                const currentEndDateString =
                                    getEditRecord?.end_date;

                                if (currentEndDateString && dateValue) {
                                    if (
                                        new Date(dateValue) >
                                        new Date(currentEndDateString)
                                    ) {
                                        handleInputChange("end_date", "");
                                    }
                                }
                            }}
                            error={formErrors["start_date"]}
                            required
                        />
                        <MonthPickerInput
                            label="End Date"
                            valueFormat="MMM YYYY"
                            defaultLevel="decade"
                            placeholder="Pick end date"
                            value={getEditRecord?.end_date || null}
                            onChange={(value) =>
                                handleInputChange("end_date", value || "")
                            }
                            disabled={getEditRecord?.is_current || false}
                            minDate={(() => {
                                if (!getEditRecord?.start_date) {
                                    return undefined;
                                }
                                let startDateObj: Date;
                                if (getEditRecord.start_date instanceof Date) {
                                    startDateObj = new Date(
                                        getEditRecord.start_date,
                                    );
                                } else if (
                                    typeof getEditRecord.start_date === "string"
                                ) {
                                    const dateParts = getEditRecord.start_date
                                        .split("-")
                                        .map((part) => parseInt(part, 10));
                                    startDateObj = new Date(
                                        dateParts[0],
                                        dateParts[1] - 1,
                                        dateParts[2],
                                    );
                                } else {
                                    return undefined;
                                }
                                startDateObj.setDate(
                                    startDateObj.getDate() + 1,
                                );
                                return startDateObj;
                            })()}
                            error={formErrors["end_date"]}
                        />
                    </Group>

                    <Checkbox
                        label="I currently work here"
                        name="is_current"
                        checked={!!getEditRecord?.is_current}
                        onChange={(event) => {
                            const { checked } = event.currentTarget;
                            handleInputChange("is_current", checked);
                            // Also clear end_date if user checks this box
                            if (checked) {
                                handleInputChange("end_date", "");
                            }
                        }}
                    />

                    <div className={styles.inputWrapper}>
                        <Textarea
                            label="Summary"
                            description="A high-level overview of your role (e.g. 'Led a team of 5 devs...')"
                            placeholder="Briefly describe what you did..."
                            value={getEditRecord?.details?.summary || ""}
                            onChange={(e) =>
                                handleDetailsChange(
                                    "summary",
                                    e.currentTarget.value,
                                )
                            }
                            autosize
                            error={formErrors["details.summary"]}
                            minRows={2}
                            maxLength={CHARACTER_LIMITS.description}
                        />
                        <CharacterCounter
                            currentLength={
                                getEditRecord?.details?.summary?.length || 0
                            }
                            maxLength={CHARACTER_LIMITS.description}
                        />
                    </div>

                    <Divider my="sm" label="Details" labelPosition="center" />

                    {/* 2. Responsibilities List */}
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>
                            Key Responsibilities
                        </Text>
                        {(getEditRecord?.details?.responsibilities || []).map(
                            (item, index) => (
                                <Group key={`resp-${index}`} gap="xs">
                                    <TextInput
                                        style={{ flex: 1 }}
                                        placeholder="e.g. Managed daily stand-ups"
                                        value={item}
                                        error={
                                            formErrors[
                                                `details.responsibilities.${index}`
                                            ]
                                        }
                                        maxLength={CHARACTER_LIMITS.bulletPoint}
                                        onChange={(e) =>
                                            handleArrayItemChange(
                                                "responsibilities",
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
                                                "responsibilities",
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
                            onClick={() => addArrayItem("responsibilities")}
                        >
                            Add Responsibility
                        </Button>
                    </Stack>

                    {/* 3. Achievements List */}
                    <Stack gap="xs" mt="md">
                        <Text size="sm" fw={500}>
                            Key Achievements (Metrics/Wins)
                        </Text>
                        {(getEditRecord?.details?.achievements || []).map(
                            (item, index) => (
                                <Group key={`ach-${index}`} gap="xs">
                                    <TextInput
                                        style={{ flex: 1 }}
                                        placeholder="e.g. Reduced server costs by 20%"
                                        value={item}
                                        error={
                                            formErrors[
                                                `details.achievements.${index}`
                                            ]
                                        }
                                        maxLength={CHARACTER_LIMITS.bulletPoint}
                                        onChange={(e) =>
                                            handleArrayItemChange(
                                                "achievements",
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
                                                "achievements",
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
                            onClick={() => addArrayItem("achievements")}
                        >
                            Add Achievement
                        </Button>
                    </Stack>

                    {/* 4. Skills Used List */}
                    <Stack gap="xs" mt="md">
                        <Text size="sm" fw={500}>
                            Tech Stack / Skills Used
                        </Text>
                        {(getEditRecord?.details?.skills_used || []).map(
                            (item, index) => (
                                <Group key={`skill-${index}`} gap="xs">
                                    <TextInput
                                        style={{ flex: 1 }}
                                        placeholder="e.g. React"
                                        value={item}
                                        maxLength={CHARACTER_LIMITS.techItem}
                                        error={
                                            formErrors[
                                                `details.skills_used.${index}`
                                            ]
                                        }
                                        onChange={(e) =>
                                            handleArrayItemChange(
                                                "skills_used",
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
                                                "skills_used",
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
                            onClick={() => addArrayItem("skills_used")}
                        >
                            Add Skill
                        </Button>
                    </Stack>

                    <Divider my="sm" />

                    <Group justify="flex-start" mt="md">
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
                </Stack>
            )}
        </form>
    );
}
