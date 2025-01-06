'use client';
import { deleteRecord, getDBTableInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateEducation,
    FormEducationStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Dispatch, SetStateAction, useState } from 'react';
import { z } from 'zod';

const userSchema = z.object({
    school_name: z.string().min(1, 'School Name is required'),
    field_of_study: z.string().min(1, 'Field of Study is required'),
});
interface Params {
    setInfo: React.Dispatch<false | [FormEducationStructure]> | null;
    infoQuery: FormEducationStructure | null;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
}
export default function EducationInfoForm({
    infoQuery,
    setInfo,
    setRefreshTrigger,
}: Params) {
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
        const formData = new FormData(event.currentTarget);
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
        }));
    }

    return (
        <form onSubmit={validatingAndSaving}>
            {infoQuery && (
                <input type="text" name="id" defaultValue={infoQuery.id} />
            )}
            <input
                type="text"
                name="school_name"
                placeholder="School Name"
                defaultValue={infoQuery ? infoQuery.school_name : ''}
            />
            {formErrors.school_name && <p>{formErrors.school_name}</p>}
            <input
                type="text"
                name="field_of_study"
                placeholder="Field of Study"
                defaultValue={infoQuery ? infoQuery.field_of_study : ''}
            />
            {formErrors.field_of_study && <p>{formErrors.field_of_study}</p>}
            <button type="submit">Save</button>
            {infoQuery && (
                <button
                    type="button"
                    onClick={() => {
                        submitDeleteRecord(
                            SectionTypes.Education,
                            'id',
                            infoQuery.id,
                        );
                    }}
                >
                    Delete {infoQuery.id}
                </button>
            )}
        </form>
    );
}
