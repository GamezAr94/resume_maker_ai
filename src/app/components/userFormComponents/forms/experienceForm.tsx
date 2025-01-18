'use client';
import { deleteRecord, getDBTableInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateExperience,
    FormExperienceStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Button, Input } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { z } from 'zod';

const userSchema = z.object({
    company_name: z.string().min(1, 'Company Name is required'),
    job_title: z.string().min(1, 'Job Title is required'),
    //start_date: z
    //    .string()
    //    .refine((date) => new Date(date).toString() !== 'Invalid Date', {
    //        message: 'A valid date is required',
    //    }),
    //end_date: z
    //    .string()
    //    .refine((date) => new Date(date).toString() !== 'Invalid Date', {
    //        message: 'A valid date is required',
    //    })
    //    .optional(),
    //description: z.string().min(1, 'Description is required'),
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

    // State to store the errors in the form
    const [formErrors, setFormErrors] =
        useState<FormExperienceStructure>(emptyStateExperience);

    // Function to validate the user data and save it
    async function validatingAndSaving(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        // prevent the default form submission and fetch the data
        event.preventDefault();

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
        const parseUser = userSchema.safeParse(Object.fromEntries(formData));

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
                SectionTypes.Experience,
            );
            if (!experienceInfoResp) {
                return;
            }
            setInfo(experienceInfoResp.data);
        }
        // TODO ART: show a success message to the user
        console.log('=====> RESPONSE experience');
        console.log(res.ok);
        console.log(response.message);
        console.log('=====>');
        // required to refresh the UI
        setRefreshTrigger((prevTrigger) => ({
            ...prevTrigger,
            experience: !prevTrigger.experience,
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
            console.error('Error user is not Authenticated');
            return;
        }

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

    interface HandleInputChangeEvent {
        target: {
            value: string;
        };
    }
    // Function to handle the input change and also to rever the form errors
    function handleInputChange(
        event: HandleInputChangeEvent,
        type: keyof FormExperienceStructure,
        setter: Dispatch<SetStateAction<FormExperienceStructure | null>>,
        prevState: FormExperienceStructure | null,
    ) {
        if (!prevState) {
            prevState = emptyStateExperience;
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
                <>
                    <input
                        hidden
                        readOnly
                        type="text"
                        name="id"
                        defaultValue={infoQuery.id}
                    />
                    <p>Company Name: {infoQuery.company_name}</p>
                    <p>Job Title: {infoQuery.job_title}</p>
                    <Button
                        size="compact-md"
                        type="button"
                        variant="default"
                        leftSection={<IconTrash size={18} />}
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
                    <Button
                        size="compact-md"
                        type="button"
                        variant="default"
                        leftSection={<IconPencil size={18} />}
                        onClick={() => editRecord(infoQuery)}
                    >
                        Edit
                    </Button>
                </>
            )}
            {!infoQuery && (
                <>
                    <p>Add New Record</p>
                    <Input.Wrapper
                        error={
                            formErrors.company_name
                                ? formErrors.company_name
                                : ''
                        }
                    >
                        <Input
                            error={!!formErrors.company_name}
                            name="company_name"
                            placeholder="Company"
                            onChange={(event) => {
                                handleInputChange(
                                    event,
                                    'company_name',
                                    setEditRecord,
                                    getEditRecord,
                                );
                            }}
                            value={
                                getEditRecord ? getEditRecord.company_name : ''
                            }
                        />
                    </Input.Wrapper>
                    <Input.Wrapper
                        error={formErrors.job_title ? formErrors.job_title : ''}
                    >
                        <Input
                            error={!!formErrors.job_title}
                            name="job_title"
                            placeholder="Job Title"
                            onChange={(event) => {
                                handleInputChange(
                                    event,
                                    'job_title',
                                    setEditRecord,
                                    getEditRecord,
                                );
                            }}
                            value={getEditRecord ? getEditRecord.job_title : ''}
                        />
                    </Input.Wrapper>
                    <Button size="md" type="submit">
                        Save
                    </Button>
                    {getEditRecord && getEditRecord.id && (
                        <>
                            <input
                                readOnly
                                hidden
                                type="text"
                                name="id"
                                defaultValue={getEditRecord.id}
                            />
                            <Button
                                onClick={() => editRecord(null)}
                                type="button"
                                size="md"
                                variant="default"
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                </>
            )}
        </form>
    );
}
