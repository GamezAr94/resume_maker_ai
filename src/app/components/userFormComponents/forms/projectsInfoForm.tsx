'use client';

import { deleteRecord, getDBTableInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import { emptyStateProject, FormProjectStructure } from '@/utils/interfaces';
import { Dispatch, SetStateAction, useState } from 'react';
import { z } from 'zod';

interface Params {
    setInfo: React.Dispatch<false | [FormProjectStructure]> | null;
    infoQuery: FormProjectStructure | null;
    setRefreshTrigger: Dispatch<
        SetStateAction<{
            experience: boolean;
            education: boolean;
            skill: boolean;
            project: boolean;
        }>
    >;
}
const userSchema = z.object({
    project_name: z.string().min(1, 'Project Name is required'),
    project_description: z
        .string()
        .min(1, 'Provide a description for the project'),
});
export default function ProjectsInfoForm({
    setInfo,
    infoQuery,
    setRefreshTrigger,
}: Params) {
    // State to store the errors in the form
    const [formErrors, setFormErrors] =
        useState<FormProjectStructure>(emptyStateProject);

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
            const projectInfoResp = await getDBTableInfo(SectionTypes.Skill);
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
    }

    return (
        <form onSubmit={validatingAndSaving}>
            {infoQuery && (
                <input type="text" name="id" defaultValue={infoQuery.id} />
            )}
            <input
                type="text"
                name="project_name"
                placeholder="Project Name"
                defaultValue={infoQuery ? infoQuery.project_name : ''}
            />
            {formErrors.project_name && <p>{formErrors.project_name}</p>}
            <input
                type="text"
                name="project_description"
                placeholder="Project Description"
                defaultValue={infoQuery ? infoQuery.project_description : ''}
            />
            {formErrors.project_description && (
                <p>{formErrors.project_description}</p>
            )}
            <button type="submit">Save</button>
            {infoQuery && (
                <button
                    type="button"
                    onClick={() => {
                        submitDeleteRecord(
                            SectionTypes.Project,
                            'id',
                            infoQuery.id,
                        );
                    }}
                >
                    Delete
                </button>
            )}
        </form>
    );
}
