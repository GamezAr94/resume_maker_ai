'use client';

import { deleteRecord, getDBTableInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateSkill,
    FormSkillStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Dispatch, SetStateAction, useState } from 'react';
import { z } from 'zod';

interface Params {
    setInfo: React.Dispatch<false | [FormSkillStructure]> | null;
    infoQuery: FormSkillStructure | null;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    setEditRecord: Dispatch<SetStateAction<FormSkillStructure | null>>;
    getEditRecord?: FormSkillStructure | null;
}
const userSchema = z.object({
    skill_name: z.string().min(1, 'Skill Name is required'),
});

export default function SkillsInfoForm({
    setInfo,
    infoQuery,
    setRefreshTrigger,
    setEditRecord,
    getEditRecord,
}: Params) {
    // State to store the errors in the form
    const [formErrors, setFormErrors] =
        useState<FormSkillStructure>(emptyStateSkill);

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
        setFormErrors(emptyStateSkill);

        // if the user data is not valid, store the errors in the state and return
        if (!parseUser.success) {
            const error = parseUser.error;
            let newErrors = emptyStateSkill;
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
                type: SectionTypes.Skill,
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
            const skillInfoResp = await getDBTableInfo(SectionTypes.Skill);
            if (!skillInfoResp) {
                return;
            }
            setInfo(skillInfoResp.data);
        }
        // TODO ART: show a success message to the user
        console.log('=====> RESPONSE skill');
        console.log(res.ok);
        console.log(response.message);
        console.log('=====>');
        // required to refresh the UI
        setRefreshTrigger((prevTrigger) => ({
            ...prevTrigger,
            skill: !prevTrigger.skill,
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
            skill: !prevTrigger.skill,
        }));
        setEditRecord(null);
    }
    function editRecord(value: FormSkillStructure | null) {
        setEditRecord(value);
    }
    return (
        <form onSubmit={validatingAndSaving}>
            {infoQuery && (
                <>
                    <input
                        hidden
                        readOnly
                        type="text"
                        name="id"
                        defaultValue={infoQuery.id}
                    />
                    <p>Skill Name: {infoQuery.skill_name}</p>
                    <p>Skill Level: {infoQuery.skill_level}</p>
                    <button
                        type="button"
                        onClick={() => {
                            submitDeleteRecord(
                                SectionTypes.Skill,
                                'id',
                                infoQuery.id,
                            );
                        }}
                    >
                        Delete
                    </button>
                    <button onClick={() => editRecord(infoQuery)} type="button">
                        Edit
                    </button>
                </>
            )}
            {!infoQuery && (
                <>
                    <p>Add New Record</p>
                    <input
                        type="text"
                        name="skill_name"
                        placeholder="Skill Name"
                        defaultValue={
                            getEditRecord ? getEditRecord.skill_name : ''
                        }
                    />
                    {formErrors.skill_name && <p>{formErrors.skill_name}</p>}
                    <input
                        type="number"
                        min="0"
                        max="10"
                        name="skill_level"
                        placeholder="Skill Level"
                        defaultValue={
                            getEditRecord ? getEditRecord.skill_level : ''
                        }
                    />
                    <button type="submit">Save</button>
                    {getEditRecord && (
                        <>
                            <input
                                readOnly
                                hidden
                                type="text"
                                name="id"
                                defaultValue={getEditRecord.id}
                            />
                            <button
                                onClick={() => editRecord(null)}
                                type="button"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </>
            )}
        </form>
    );
}
