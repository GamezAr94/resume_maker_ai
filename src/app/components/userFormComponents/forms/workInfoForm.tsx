'use client';
import { deleteRecord, getExperienceInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateExperience,
    FormExperienceStructure,
} from '@/utils/interfaces';
import { Dispatch, SetStateAction, useState } from 'react';
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
    setRefreshTrigger: Dispatch<
        SetStateAction<{
            experience: boolean;
            education: boolean;
            skill: boolean;
            project: boolean;
        }>
    >;
}
export default function WorkInfoForm({
    infoQuery,
    setInfo,
    setRefreshTrigger,
}: Params) {
    // State to store the visibility of the form
    const [visible, setVisible] = useState<boolean>(true);
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
        const formData = new FormData(event.currentTarget);
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
            const experienceInfoResp = await getExperienceInfo();
            if (!experienceInfoResp) {
                return;
            }
            setInfo(experienceInfoResp);
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
    }

    // Function to delete the record and refresh the UI
    async function submitDeleteRecord(
        table: string,
        column: string,
        value: string,
    ) {
        const response = await deleteRecord(table, column, value);
        if (!response) {
            // TODO ART: show an error message to the user
            console.error('Error user is not Authenticated');
            return;
        }
        setVisible(false);
    }

    return (
        <>
            {visible && (
                <form onSubmit={validatingAndSaving}>
                    {infoQuery && (
                        <input
                            type="text"
                            name="id"
                            defaultValue={infoQuery.id}
                            readOnly
                        />
                    )}
                    <input
                        type="text"
                        name="company_name"
                        placeholder="Company"
                        defaultValue={infoQuery ? infoQuery.company_name : ''}
                    />
                    {formErrors.company_name && (
                        <p>{formErrors.company_name}</p>
                    )}
                    <input
                        type="text"
                        name="job_title"
                        placeholder="Job Title"
                        defaultValue={infoQuery ? infoQuery.job_title : ''}
                    />
                    {formErrors.job_title && <p>{formErrors.job_title}</p>}
                    <button type="submit">Save</button>
                    {infoQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                submitDeleteRecord(
                                    'experience',
                                    'id',
                                    infoQuery.id,
                                );
                            }}
                        >
                            Delete
                        </button>
                    )}
                </form>
            )}
        </>
    );
}
