'use client';
import { deleteProfileRecord } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateEducation,
    FormEducationStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Button, TextInput, Group, Text, Stack, Checkbox } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { IconCheck, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { z } from 'zod';
import styles from './formContainerStyles.module.css';
import { notifications } from '@mantine/notifications';

// the limits for the content of each input field in the forms
import { CHARACTER_LIMITS } from '@/utils/configLimits';

const userSchema = z
    .object({
        id: z.number().optional(),
        school_name: z
            .string()
            .min(1, 'School Name is required')
            .max(
                CHARACTER_LIMITS.school,
                `Cannot exceed ${CHARACTER_LIMITS.school} characters`,
            ),
        field_of_study: z
            .string()
            .min(1, 'Field of Study is required')
            .max(
                CHARACTER_LIMITS.fieldOfStudy,
                `Cannot exceed ${CHARACTER_LIMITS.fieldOfStudy} characters`,
            ),
        degree: z
            .string()
            .min(2, 'Degree is required')
            .max(
                CHARACTER_LIMITS.degree,
                `Cannot exceed ${CHARACTER_LIMITS.degree} characters`,
            ),
        grades: z
            .string()
            .max(
                CHARACTER_LIMITS.grades,
                `Cannot exceed ${CHARACTER_LIMITS.grades} characters`,
            )
            .optional(),
        start_date: z.string().min(1, 'Start Date is required'),
        end_date: z.string().optional(),
        is_current: z.boolean().optional(),
    })
    .refine((data) => data.is_current || !!data.end_date, {
        message: 'End Date is required if this is not a current position',
        path: ['end_date'],
    });

interface Params {
    infoQuery: FormEducationStructure | null;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    setEditRecord: Dispatch<SetStateAction<FormEducationStructure | null>>;
    getEditRecord: FormEducationStructure | null;
}
export default function EducationInfoForm({
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
        useState<FormEducationStructure>(emptyStateEducation);

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
                school_name: getEditRecord?.school_name || '',
                field_of_study: getEditRecord?.field_of_study || '',
                degree: getEditRecord?.degree || '',
                start_date: getEditRecord?.start_date || '',
                // field end_date is optional only if is_current is true
                // if is_current is true, end_date should be undefined
                // if is_current is false, end_date should be the value of end_date or undefined
                end_date: getEditRecord?.is_current
                    ? undefined
                    : getEditRecord?.end_date || null,
                is_current: getEditRecord?.is_current || false,
                grades: getEditRecord?.grades || undefined,
            };

            const parseUser = userSchema.safeParse(dataToValidate);

            // reset the errors in the state
            setFormErrors(emptyStateEducation);

            // if the user data is not valid, store the errors in the state and return
            if (!parseUser.success) {
                const error = parseUser.error;
                let newErrors = emptyStateEducation;
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
                    type: SectionTypes.Education,
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

            notifications.show({
                title: 'Success!',
                message: 'Your education has been saved.',
                color: 'teal',
                icon: <IconCheck />,
            });
            // required to refresh the UI
            setRefreshTrigger((prevTrigger) => ({
                ...prevTrigger,
                education: !prevTrigger.education,
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
                message: 'The education has been deleted.',
                color: 'teal',
                icon: <IconCheck />,
            });

            setRefreshTrigger((prevTrigger) => ({
                ...prevTrigger,
                education: !prevTrigger.education,
                project: !prevTrigger.project,
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

    function editRecord(value: FormEducationStructure | null) {
        // TODO this method it is ONLY working when you click the button cancel, if we want to make it work when pressing the edit button then we need to move the useState to the container component of this component so that we can share it accross that one and this one
        setFormErrors(emptyStateEducation);
        setEditRecord(value);
    }

    // A new, safer function to handle all input changes
    function handleInputChange(
        type: keyof FormEducationStructure,
        value: string | boolean,
    ) {
        // This functional form of setEditRecord guarantees we always have the latest state
        setEditRecord((currentRecord) => ({
            ...(currentRecord || emptyStateEducation),
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
                            {infoQuery.field_of_study}
                        </Text>
                        <Text className={styles.infoTextSecondary}>
                            {infoQuery.school_name}
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
                                    SectionTypes.Education,
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
                        label="School Name"
                        placeholder="e.g., Harvard University"
                        name="school_name"
                        maxLength={CHARACTER_LIMITS.school}
                        value={getEditRecord?.school_name || ''}
                        onChange={(e) =>
                            handleInputChange(
                                'school_name',
                                e.currentTarget.value,
                            )
                        }
                        error={formErrors.school_name || undefined}
                        required
                    />
                    <TextInput
                        label="Degree"
                        placeholder="e.g., Bachelor of Science"
                        name="degree"
                        maxLength={CHARACTER_LIMITS.degree}
                        value={getEditRecord?.degree || ''}
                        onChange={(e) =>
                            handleInputChange('degree', e.currentTarget.value)
                        }
                        error={formErrors.degree || undefined}
                        required
                    />
                    <TextInput
                        label="Field of Study"
                        maxLength={CHARACTER_LIMITS.fieldOfStudy}
                        placeholder="e.g., Computer Science"
                        name="field_of_study"
                        value={getEditRecord?.field_of_study || ''}
                        onChange={(e) =>
                            handleInputChange(
                                'field_of_study',
                                e.currentTarget.value,
                            )
                        }
                        error={formErrors.field_of_study || undefined}
                        required
                    />
                    <Group grow>
                        <MonthPickerInput
                            defaultLevel="decade"
                            valueFormat="MMM YYYY"
                            label="Start Date"
                            placeholder="Pick start date"
                            name="start_date"
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
                                        // If new start date is after end date, clear end date.
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
                        <MonthPickerInput
                            defaultLevel="decade"
                            valueFormat="MMM YYYY"
                            label="End Date"
                            placeholder="Pick end date"
                            name="end_date"
                            value={getEditRecord?.end_date || null}
                            onChange={(value) =>
                                handleInputChange('end_date', value || '')
                            }
                            error={
                                typeof formErrors.end_date === 'string'
                                    ? formErrors.end_date
                                    : undefined
                            }
                            disabled={getEditRecord?.is_current || false}
                            minDate={(() => {
                                if (!getEditRecord?.start_date) {
                                    return undefined;
                                }
                                // This logic correctly parses the date string to avoid timezone bugs
                                let startDate: Date;
                                if (
                                    typeof getEditRecord.start_date === 'string'
                                ) {
                                    const dateParts = getEditRecord.start_date
                                        .split('-')
                                        .map((part) => parseInt(part, 10));
                                    startDate = new Date(
                                        dateParts[0],
                                        dateParts[1] - 1,
                                        dateParts[2],
                                    );
                                } else if (
                                    getEditRecord.start_date instanceof Date
                                ) {
                                    startDate = new Date(
                                        getEditRecord.start_date,
                                    );
                                } else {
                                    startDate = new Date();
                                }

                                // Add one day to the start date
                                startDate.setDate(startDate.getDate() + 1);
                                return startDate;
                            })()}
                        />
                    </Group>
                    <Checkbox
                        label="I currently attend here"
                        name="is_current"
                        checked={getEditRecord?.is_current || false}
                        onChange={(event) => {
                            const { checked } = event.currentTarget;
                            // Also clear end_date if user checks this box
                            handleInputChange('is_current', checked);
                            if (checked) {
                                handleInputChange('end_date', ''); // This will now correctly clear the date field
                            }
                        }}
                    />
                    <TextInput
                        label="GPA / Grades (Optional)"
                        placeholder="e.g., 3.8/4.0"
                        maxLength={CHARACTER_LIMITS.grades}
                        name="grades"
                        value={getEditRecord?.grades || ''}
                        onChange={(e) =>
                            handleInputChange('grades', e.currentTarget.value)
                        }
                        error={formErrors.grades || undefined}
                    />
                    <Group justify="flex-start" mt="md">
                        <Button type="submit" loading={isSubmitting}>
                            {getEditRecord?.id ? 'Save Changes' : 'Add Entry'}
                        </Button>
                        {getEditRecord && (
                            <Button
                                loading={isSubmitting}
                                type="button"
                                variant="default"
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
