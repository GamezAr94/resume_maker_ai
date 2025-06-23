'use client';
import { deleteRecord, getDBTableInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateExperience,
    FormExperienceStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { IconCheck, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { z } from 'zod';
import styles from './formContainerStyles.module.css';
import {
    Button,
    Group,
    Text,
    TextInput,
    Stack,
    Checkbox,
    Textarea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';

import CharacterCounter from '@/app/components/CharacterCounter/CharacterCounter';

// Character limits for the form fields
import { CHARACTER_LIMITS } from '@/utils/configLimits';

const userSchema = z
    .object({
        id: z.number().optional(),
        job_title: z
            .string()
            .min(1, 'Job Title is required')
            .max(
                CHARACTER_LIMITS.title,
                `Cannot exceed ${CHARACTER_LIMITS.title} characters`,
            ),
        company_name: z
            .string()
            .min(1, 'Company Name is required')
            .max(
                CHARACTER_LIMITS.company,
                `Cannot exceed ${CHARACTER_LIMITS.company} characters`,
            ),
        description: z
            .string()
            .min(1, 'A description is required')
            .max(
                CHARACTER_LIMITS.description,
                `Cannot exceed ${CHARACTER_LIMITS.description} characters`,
            ),
        start_date: z.string().min(1, 'Start Date is required'),
        end_date: z.string().optional(),
        is_current: z.boolean().optional(),
    })
    .refine((data) => data.is_current || !!data.end_date, {
        message: 'End Date is required if this is not a current position',
        path: ['end_date'],
    });
interface Params {
    setInfo: React.Dispatch<false | [FormExperienceStructure]> | null;
    infoQuery: FormExperienceStructure | null;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    setEditRecord: Dispatch<SetStateAction<FormExperienceStructure | null>>;
    getEditRecord: FormExperienceStructure | null;
}
export default function ExperienceForm({
    infoQuery,
    setInfo,
    setRefreshTrigger,
    setEditRecord,
    getEditRecord,
}: Params) {
    // whit this we will erase all the data in the form after saving it
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State to store the errors in the form
    const [formErrors, setFormErrors] =
        useState<FormExperienceStructure>(emptyStateExperience);

    // Function to validate the user data and save it
    async function validatingAndSaving(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        // prevent the default form submission and fetch the data
        event.preventDefault();

        setIsSubmitting(true);

        try {
            // Directly build the object to validate from the state
            const dataToValidate = {
                ...(getEditRecord?.id && { id: getEditRecord.id }),
                company_name: getEditRecord?.company_name || '',
                job_title: getEditRecord?.job_title || '',
                start_date: getEditRecord?.start_date || '',
                end_date: getEditRecord?.end_date || undefined,
                is_current: getEditRecord?.is_current || false,
                description: getEditRecord?.description || '',
            };

            const parseUser = userSchema.safeParse(dataToValidate);

            // reset the errors in the state
            setFormErrors(emptyStateExperience);

            // if the user data is not valid, store the errors in the state and return
            if (!parseUser.success) {
                const error = parseUser.error;
                let newErrors = emptyStateExperience;
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

            const res = await fetch('api/saveUserInfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: SectionTypes.Experience,
                    data: parseUser.data, // Send the clean, validated data
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

            if (setInfo) {
                const experienceInfoResp = await getDBTableInfo(
                    SectionTypes.Experience,
                );
                if (!experienceInfoResp) {
                    return;
                }
                setInfo(experienceInfoResp.data);
            }
            notifications.show({
                title: 'Success!',
                message: 'Your experience has been saved.',
                color: 'teal',
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
    async function submitDeleteRecord(
        table: SectionTypes,
        column: string,
        value: string,
    ) {
        const response = await deleteRecord(table, column, value);
        if (!response) {
            notifications.show({
                title: 'Error Deleting',
                message: 'An error occurred while deleting the experience.',
                color: 'red',
                icon: <IconX />,
            });
            return;
        }

        notifications.show({
            title: 'Success!',
            message: 'The experience has been deleted.',
            color: 'teal',
            icon: <IconCheck />,
        });

        // required to refresh the UI
        setRefreshTrigger((prevTrigger) => ({
            ...prevTrigger,
            experience: !prevTrigger.experience,
            project: !prevTrigger.project,
        }));
        setEditRecord(null);
    }
    function editRecord(value: FormExperienceStructure | null) {
        // TODO this method it is ONLY working when you click the button cancel, if we want to make it work when pressing the edit button then we need to move the useState to the container component of this component so that we can share it accross that one and this one
        setFormErrors(emptyStateExperience);
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
                                    'id',
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
                        value={getEditRecord?.job_title || ''}
                        onChange={(e) =>
                            handleInputChange(
                                'job_title',
                                e.currentTarget.value,
                            )
                        }
                        error={formErrors.job_title}
                        required
                    />
                    <TextInput
                        label="Company Name"
                        placeholder="e.g., Google"
                        maxLength={CHARACTER_LIMITS.company}
                        name="company_name"
                        value={getEditRecord?.company_name || ''}
                        onChange={(e) =>
                            handleInputChange(
                                'company_name',
                                e.currentTarget.value,
                            )
                        }
                        error={formErrors.company_name}
                        required
                    />

                    <Group grow>
                        <DatePickerInput
                            label="Start Date"
                            placeholder="Pick start date"
                            value={getEditRecord?.start_date || null}
                            onChange={(newStartDateString) => {
                                const dateValue = newStartDateString || '';
                                handleInputChange('start_date', dateValue);

                                const currentEndDateString =
                                    getEditRecord?.end_date;

                                if (currentEndDateString && dateValue) {
                                    if (
                                        new Date(dateValue) >
                                        new Date(currentEndDateString)
                                    ) {
                                        handleInputChange('end_date', '');
                                    }
                                }
                            }}
                            error={
                                typeof formErrors.start_date === 'string'
                                    ? formErrors.start_date
                                    : undefined
                            }
                            required
                        />
                        <DatePickerInput
                            label="End Date"
                            placeholder="Pick end date"
                            value={getEditRecord?.end_date || null}
                            onChange={(value) =>
                                handleInputChange('end_date', value || '')
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
                                    typeof getEditRecord.start_date === 'string'
                                ) {
                                    const dateParts = getEditRecord.start_date
                                        .split('-')
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
                            error={
                                typeof formErrors.end_date === 'string'
                                    ? formErrors.end_date
                                    : undefined
                            }
                        />
                    </Group>

                    <Checkbox
                        label="I currently work here"
                        name="is_current"
                        checked={!!getEditRecord?.is_current}
                        onChange={(event) => {
                            const { checked } = event.currentTarget;
                            handleInputChange('is_current', checked);
                            // Also clear end_date if user checks this box
                            if (checked) {
                                handleInputChange('end_date', '');
                            }
                        }}
                    />

                    <div className={styles.inputWrapper}>
                        <Textarea
                            label="Description"
                            placeholder="Describe your role and accomplishments..."
                            value={getEditRecord?.description || ''}
                            onChange={(event) =>
                                handleInputChange(
                                    'description',
                                    event.currentTarget.value,
                                )
                            }
                            autosize
                            minRows={4}
                            maxLength={CHARACTER_LIMITS.description}
                            error={formErrors.description}
                            required
                        />
                        <CharacterCounter
                            currentLength={
                                getEditRecord?.description?.length || 0
                            }
                            maxLength={CHARACTER_LIMITS.description}
                        />
                    </div>

                    <Group justify="flex-start" mt="md">
                        <Button type="submit" loading={isSubmitting}>
                            {getEditRecord?.id ? 'Save Changes' : 'Add Entry'}
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
