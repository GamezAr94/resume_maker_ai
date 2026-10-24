'use client';

import { deleteProfileRecord } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateSkill,
    FormSkillStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Button, Input, Group, Select, Text } from '@mantine/core';
import { IconPencil, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { z } from 'zod';
import styles from './formContainerStyles.module.css';
import { notifications } from '@mantine/notifications';

// Character limits for the form fields
import { CHARACTER_LIMITS } from '@/utils/configLimits';

interface Params {
    infoQuery: FormSkillStructure | null;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    setEditRecord: Dispatch<SetStateAction<FormSkillStructure | null>>;
    getEditRecord: FormSkillStructure | null;
}
const userSchema = z.object({
    id: z.string().optional(),
    skill_name: z
        .string()
        .min(1, 'Skill Name is required')
        .max(
            CHARACTER_LIMITS.skill,
            `Cannot exceed ${CHARACTER_LIMITS.skill} characters`,
        ),
    skill_level: z.string().optional(), // Or whatever validation you need for skill level
});

export default function SkillsInfoForm({
    infoQuery,
    setRefreshTrigger,
    setEditRecord,
    getEditRecord,
}: Params) {
    // whit this we will erase all the data in the form after saving it
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State to store the errors in the form
    const [formErrors, setFormErrors] =
        useState<FormSkillStructure>(emptyStateSkill);

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
                    if (value !== null && value !== undefined && value != '') {
                        formData.append(key, String(value));
                    }
                });
            }

            // parse the user data with the zod schema
            const parseUser = userSchema.safeParse(
                Object.fromEntries(formData),
            );

            // reset the errors in the state
            setFormErrors(emptyStateSkill);

            // if the user data is not valid, store the errors in the state and return
            if (!parseUser.success) {
                const error = parseUser.error;
                let newErrors = emptyStateSkill;
                for (const issue of error.issues) {
                    newErrors = {
                        ...newErrors,
                        [issue.path[0]]: issue.message,
                    };
                }
                // set the errors in the state to show them to the user
                setFormErrors(newErrors);
                return;
            }

            const res = await fetch('api/saveUserInfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: SectionTypes.Skill,
                    data: Object.fromEntries(formData),
                }),
            });
            const response = await res.json();

            // show a message to the user
            if (!res.ok) {
                notifications.show({
                    title: 'Error Saving',
                    message: response.message || 'An unknown error occurred.',
                    color: 'red',
                    icon: <IconX />,
                });
                return;
            }

            notifications.show({
                title: 'Success!',
                message: 'Your skill has been saved.',
                color: 'teal',
                icon: <IconCheck />,
            });
            // required to refresh the UI
            setRefreshTrigger((prevTrigger) => ({
                ...prevTrigger,
                skill: !prevTrigger.skill,
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
                title: 'Success!',
                message: 'The skill has been deleted.',
                color: 'teal',
                icon: <IconCheck />,
            });

            setRefreshTrigger((prevTrigger) => ({
                ...prevTrigger,
                skill: !prevTrigger.skill,
            }));
            setEditRecord(null);
        } catch (error) {
            // --- This code runs if deleteProfileRecord threw an error ---
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'An unknown error occurred.';
            notifications.show({
                title: 'Error Deleting',
                message: errorMessage,
                color: 'red',
                icon: <IconX />,
            });
        }
    }

    function editRecord(value: FormSkillStructure | null) {
        // TODO this method it is ONLY working when you click the button cancel, if we want to make it work when pressing the edit button then we need to move the useState to the container component of this component so that we can share it accross that one and this one
        setFormErrors(emptyStateSkill);
        setEditRecord(value);
    }

    interface HandleInputChangeEvent {
        target: {
            value: string;
        };
    }
    // Function to handle the input change and also to rever the form errors
    function handleInputChange(
        event: HandleInputChangeEvent,
        type: keyof FormSkillStructure,
        setter: Dispatch<SetStateAction<FormSkillStructure | null>>,
        prevState: FormSkillStructure | null,
    ) {
        if (!prevState) {
            prevState = emptyStateSkill;
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

    const skillLevelOptions = [
        { value: '1', label: 'Beginner' },
        { value: '2', label: 'Intermediate' },
        { value: '3', label: 'Advanced' },
        { value: '4', label: 'Expert' },
    ];

    // +++ Helper to find the label for a given numeric value (for display) +++
    const getSkillLabel = (level: string | number | null | undefined) => {
        if (!level) return '';
        const found = skillLevelOptions.find(
            (opt) => opt.value === String(level),
        );
        return found ? found.label : '';
    };

    return (
        <form ref={formRef} onSubmit={validatingAndSaving}>
            {infoQuery && (
                <div className={styles.infoCard}>
                    <div>
                        <Text className={styles.infoTextPrimary}>
                            {infoQuery.skill_name}
                        </Text>
                        <Text className={styles.infoTextSecondary}>
                            {getSkillLabel(infoQuery.skill_level)}
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
                                    SectionTypes.Skill,
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
                        label="Skill Name:"
                        error={
                            formErrors.skill_name ? formErrors.skill_name : ''
                        }
                        classNames={{
                            root: styles.formField,
                            label: styles.formLabel,
                        }}
                    >
                        <Input
                            classNames={{ input: styles.formInput }}
                            error={!!formErrors.skill_name}
                            type="text"
                            name="skill_name"
                            maxLength={CHARACTER_LIMITS.skill}
                            placeholder="e.g., JavaScript, Python, Figma"
                            onChange={(event) => {
                                handleInputChange(
                                    event,
                                    'skill_name',
                                    setEditRecord,
                                    getEditRecord,
                                );
                            }}
                            value={
                                getEditRecord ? getEditRecord.skill_name : ''
                            }
                        />
                    </Input.Wrapper>

                    <Select
                        label="Skill Level: (Optional)"
                        placeholder="Select a level"
                        data={skillLevelOptions}
                        name="skill_level"
                        onChange={(value) =>
                            handleInputChange(
                                { target: { value: value || '' } },
                                'skill_level',
                                setEditRecord,
                                getEditRecord,
                            )
                        }
                        // The value must be the numeric string ('1', '2', etc.)
                        value={
                            getEditRecord?.skill_level
                                ? String(getEditRecord.skill_level)
                                : ''
                        }
                        classNames={{
                            root: styles.formField,
                            label: styles.formLabel,
                            input: styles.formInput,
                        }}
                    />

                    <Group justify="flex-start" mt="xl">
                        <Button type="submit" loading={isSubmitting}>
                            {getEditRecord ? 'Save Changes' : 'Add Skill'}
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
