'use client';

import { deleteRecord, getDBTableInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateProject,
    FormEducationStructure,
    FormExperienceStructure,
    FormProjectStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Button, Input, Select, Group, Text } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { z } from 'zod';
import styles from './formContainerStyles.module.css';

// Character limits for the form fields
import { CHARACTER_LIMITS } from '@/utils/configLimits';

interface Params {
    setInfo: React.Dispatch<false | [FormProjectStructure]> | null;
    infoQuery: FormProjectStructure | null;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    educationInfo: [FormEducationStructure] | [];
    experienceInfo: [FormExperienceStructure] | [];
    setEditRecord: Dispatch<SetStateAction<FormProjectStructure | null>>;
    getEditRecord: FormProjectStructure | null;
    setSelectedType: Dispatch<
        SetStateAction<'personal_type' | 'experience_type' | 'education_type'>
    >;
    selectedType: 'personal_type' | 'experience_type' | 'education_type';
}

const userSchema = z.object({
    id: z.string().optional(),
    project_name: z
        .string()
        .min(1, 'Project Name is required')
        .max(
            CHARACTER_LIMITS.title,
            `Cannot exceed ${CHARACTER_LIMITS.title} characters`,
        ),
    project_description: z
        .string()
        .min(1, 'A description is required')
        .max(
            CHARACTER_LIMITS.description,
            `Cannot exceed ${CHARACTER_LIMITS.description} characters`,
        ),
});

export default function ProjectsInfoForm({
    setInfo,
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
            setFormErrors(emptyStateProject);

            // if the user data is not valid, store the errors in the state and return
            if (!parseUser.success) {
                const error = parseUser.error;
                console.error('Error validating user data:', error);
                let newErrors = emptyStateProject;
                for (const issue of error.errors) {
                    newErrors = {
                        ...newErrors,
                        [issue.path[0]]: issue.message,
                    };
                }
                console.log('=====> validatingAndSaving');
                console.log('getEditRecord', getEditRecord);
                // set the errors in the state to show them to the user
                setFormErrors(newErrors);
                return;
            }

            const res = await fetch('api/saveUserInfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: SectionTypes.Project,
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
                const projectInfoResp = await getDBTableInfo(
                    SectionTypes.Project,
                );
                if (!projectInfoResp) {
                    return;
                }
                setInfo(projectInfoResp.data);
            }
            // TODO ART: show a success message to the user
            console.log('=====> RESPONSE project');
            console.log(res.ok);
            console.log(response.message);
            console.log('=====>');
            // required to refresh the UI
            setRefreshTrigger((prevTrigger) => ({
                ...prevTrigger,
                project: !prevTrigger.project,
            }));
            setEditRecord(null);
            setSelectedType('personal_type');
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
            // TODO ART: show an error message to the user
            console.error('Error deleting the record');
            return;
        }

        // required to refresh the UI
        setRefreshTrigger((prevTrigger) => ({
            ...prevTrigger,
            project: !prevTrigger.project,
        }));
        setEditRecord(null);
    }

    // with this function we can edit an element and we can also cancel the edition
    function editRecord(value: FormProjectStructure | null) {
        // we need to remove the existing errors if any
        // TODO this method it is ONLY working when you click the button cancel, if we want to make it work when pressing the edit button then we need to move the useState to the container component of this component so that we can share it accross that one and this one
        setFormErrors(emptyStateProject);
        // elect by default the personal_type just in case
        setSelectedType('personal_type');
        if (value?.experience_id != null) {
            setSelectedType('experience_type');
        }
        if (value?.education_id != null) {
            setSelectedType('education_type');
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
        if (event == null) {
            setSelectedType('personal_type');
        }
        if (event == 'Experience') {
            setSelectedType('experience_type');
        } else if (event == 'Education') {
            setSelectedType('education_type');
        } else {
            setSelectedType('personal_type');
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
    const projectTypeOptions = ['Personal'];
    if (experienceInfo && experienceInfo.length > 0) {
        projectTypeOptions.push('Experience');
    }
    if (educationInfo && educationInfo.length > 0) {
        projectTypeOptions.push('Education');
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
                        label="Project Name"
                        error={
                            formErrors.project_name
                                ? formErrors.project_name
                                : ''
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
                                    'project_name',
                                    setEditRecord,
                                    getEditRecord,
                                );
                            }}
                            value={
                                getEditRecord ? getEditRecord.project_name : ''
                            }
                        />
                    </Input.Wrapper>

                    {/* Project Type Select */}
                    <Select
                        label="Project Type"
                        placeholder="Select a type"
                        value={
                            selectedType === 'experience_type'
                                ? 'Experience'
                                : selectedType === 'education_type'
                                ? 'Education'
                                : 'Personal'
                        }
                        data={projectTypeOptions}
                        onChange={setType}
                        classNames={{
                            root: styles.formField,
                            label: styles.formLabel,
                            input: styles.formInput,
                        }}
                    />

                    {selectedType === 'experience_type' && (
                        <Select
                            label="Link to Experience"
                            placeholder="Select an experience"
                            defaultValue={
                                getEditRecord?.experience_id
                                    ? String(getEditRecord.experience_id)
                                    : ''
                            }
                            data={experienceInfo.map((item) => ({
                                label: item.company_name,
                                value: String(item.id),
                            }))}
                            onChange={(event) => {
                                handleSelectChange(
                                    event,
                                    'experience_id',
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

                    {selectedType === 'education_type' && (
                        <Select
                            label="Link to Education"
                            placeholder="Select an institution"
                            defaultValue={
                                getEditRecord?.education_id
                                    ? String(getEditRecord.education_id)
                                    : ''
                            }
                            data={educationInfo.map((item) => ({
                                label: item.school_name,
                                value: String(item.id),
                            }))}
                            onChange={(event) => {
                                handleSelectChange(
                                    event,
                                    'education_id',
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
                    <Input.Wrapper
                        label="Project Description"
                        error={
                            formErrors.project_description
                                ? formErrors.project_description
                                : ''
                        }
                        classNames={{
                            root: styles.formField,
                            label: styles.formLabel,
                        }}
                    >
                        <Input
                            component="textarea"
                            maxLength={CHARACTER_LIMITS.description}
                            rows={4}
                            classNames={{ input: styles.formInput }}
                            error={!!formErrors.project_description}
                            name="project_description"
                            placeholder="Describe your project..."
                            onChange={(event) => {
                                handleInputChange(
                                    event,
                                    'project_description',
                                    setEditRecord,
                                    getEditRecord,
                                );
                            }}
                            value={
                                getEditRecord
                                    ? getEditRecord.project_description
                                    : ''
                            }
                        />
                    </Input.Wrapper>

                    {/* Action Buttons */}
                    <Group justify="flex-start" mt="xl">
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
                </>
            )}
        </form>
    );
}
