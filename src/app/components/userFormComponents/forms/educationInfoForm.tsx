'use client';
import { deleteRecord, getDBTableInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateEducation,
    FormEducationStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Button, Input, Group, Text } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { z } from 'zod';
import styles from './formContainerStyles.module.css';

const userSchema = z.object({
    school_name: z.string().min(1, 'School Name is required'),
    field_of_study: z.string().min(1, 'Field of Study is required'),
});
interface Params {
    setInfo: React.Dispatch<false | [FormEducationStructure]> | null;
    infoQuery: FormEducationStructure | null;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    setEditRecord: Dispatch<SetStateAction<FormEducationStructure | null>>;
    getEditRecord: FormEducationStructure | null;
}
export default function EducationInfoForm({
    infoQuery,
    setInfo,
    setRefreshTrigger,
    setEditRecord,
    getEditRecord,
}: Params) {
    // whit this we will erase all the data in the form after saving it
    const formRef = useRef<HTMLFormElement>(null);

    // State to store the errors in the form
    const [formErrors, setFormErrors] =
        useState<FormEducationStructure>(emptyStateEducation);

    // Function to validate the user data and save it
    async function validatingAndSaving(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        // prevent the default form submission and fetch the data
        event.preventDefault();

        // get the form data
        //const formData = new FormData(event.currentTarget);
        const formData = new FormData();
        if (getEditRecord) {
            Object.entries(getEditRecord).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value != '') {
                    formData.append(key, String(value));
                }
            });
        }

        // parse the user data with the zod schema
        const parseUser = userSchema.safeParse(Object.fromEntries(formData));

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
                data: Object.fromEntries(formData),
            }),
        });
        const response = await res.json();

        // show a message to the user
        if (!res.ok) {
            // TODO ART: show an error message to the user
            console.error(response.message);
            return;
        }

        if (setInfo) {
            const experienceInfoResp = await getDBTableInfo(
                SectionTypes.Education,
            );
            if (!experienceInfoResp) {
                return;
            }
            setInfo(experienceInfoResp.data);
        }
        // TODO ART: show a success message to the user
        console.log('=====> RESPONSE education');
        console.log(res.ok);
        console.log(response.message);
        console.log('=====>');
        // required to refresh the UI
        setRefreshTrigger((prevTrigger) => ({
            ...prevTrigger,
            education: !prevTrigger.education,
        }));
        setEditRecord(null);
        formRef.current?.reset();
    }

    // Function to delete the record and refresh the UI
    async function submitDeleteRecord(
        table: SectionTypes,
        column: string,
        value: string,
    ) {
        const response = await deleteRecord(table, column, value);
        if (!response) {
            // TODO ART: show an error message to the user
            console.error('Error deleting the record');
            return;
        }

        // required to refresh the UI
        setRefreshTrigger((prevTrigger) => ({
            ...prevTrigger,
            education: !prevTrigger.education,
            project: !prevTrigger.project,
        }));
        setEditRecord(null);
    }
    function editRecord(value: FormEducationStructure | null) {
        // TODO this method it is ONLY working when you click the button cancel, if we want to make it work when pressing the edit button then we need to move the useState to the container component of this component so that we can share it accross that one and this one
        setFormErrors(emptyStateEducation);
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
        type: keyof FormEducationStructure,
        setter: Dispatch<SetStateAction<FormEducationStructure | null>>,
        prevState: FormEducationStructure | null,
    ) {
        if (!prevState) {
            prevState = emptyStateEducation;
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
                <>
                    <Input.Wrapper
                        label="School Name:"
                        error={
                            formErrors.school_name ? formErrors.school_name : ''
                        }
                        classNames={{
                            root: styles.formField,
                            label: styles.formLabel,
                        }}
                    >
                        <Input
                            classNames={{ input: styles.formInput }}
                            error={!!formErrors.school_name}
                            placeholder="e.g., Harvard University"
                            name="school_name"
                            onChange={(event) => {
                                handleInputChange(
                                    event,
                                    'school_name',
                                    setEditRecord,
                                    getEditRecord,
                                );
                            }}
                            value={
                                getEditRecord ? getEditRecord.school_name : ''
                            }
                        />
                    </Input.Wrapper>

                    <Input.Wrapper
                        label="Field of Study:"
                        error={
                            formErrors.field_of_study
                                ? formErrors.field_of_study
                                : ''
                        }
                        classNames={{
                            root: styles.formField,
                            label: styles.formLabel,
                        }}
                    >
                        <Input
                            classNames={{ input: styles.formInput }}
                            error={!!formErrors.field_of_study}
                            placeholder="e.g., Computer Science"
                            name="field_of_study"
                            onChange={(event) => {
                                handleInputChange(
                                    event,
                                    'field_of_study',
                                    setEditRecord,
                                    getEditRecord,
                                );
                            }}
                            value={
                                getEditRecord
                                    ? getEditRecord.field_of_study
                                    : ''
                            }
                        />
                    </Input.Wrapper>

                    <Group justify="flex-start" mt="xl">
                        <Button type="submit" className={styles.primaryButton}>
                            {getEditRecord ? 'Save Changes' : 'Add Entry'}
                        </Button>
                        {getEditRecord && (
                            <Button
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
