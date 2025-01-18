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
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

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
    project_name: z.string().min(1, 'Project Name is required'),
    project_description: z
        .string()
        .min(1, 'Provide a description for the project'),
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

    // State to store the errors in the form
    const [formErrors, setFormErrors] =
        useState<FormProjectStructure>(emptyStateProject);

    const [getCategory, setGetCategory] = useState<{
        personal_type: boolean;
        experience_type: boolean;
        education_type: boolean;
    }>({ personal_type: true, experience_type: false, education_type: false });

    useEffect(() => {
        if (infoQuery?.experience_id) {
            setGetCategory({
                personal_type: false,
                experience_type: true,
                education_type: false,
            });
        } else if (infoQuery?.education_id) {
            setGetCategory({
                personal_type: false,
                experience_type: false,
                education_type: true,
            });
        }
    }, [infoQuery?.education_id, infoQuery?.experience_id]);
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
            const projectInfoResp = await getDBTableInfo(SectionTypes.Project);
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
        if (value == null) {
            setSelectedType('personal_type');
        }
        if (value?.experience_id != null) {
            setSelectedType('experience_type');
        }
        if (value?.education_id != null) {
            setSelectedType('education_type');
        }
        setEditRecord(value);
    }

    // Function to set the project type experience or education
    function setType(event: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedType(
            event.target.value as
                | 'personal_type'
                | 'experience_type'
                | 'education_type',
        );
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

    return (
        <form ref={formRef} onSubmit={validatingAndSaving}>
            {infoQuery && (
                <>
                    <input
                        readOnly
                        hidden
                        type="text"
                        name="id"
                        defaultValue={infoQuery.id}
                    />
                    <p>Project Name: {infoQuery.project_name}</p>
                    <p>
                        Project Type:{' '}
                        {infoQuery.education_id
                            ? 'School'
                            : infoQuery.experience_id
                            ? 'Job'
                            : 'Personal'}
                    </p>
                    <p>Project Description: {infoQuery.project_description}</p>
                    <p>
                        project{' '}
                        {infoQuery.education_id
                            ? 'edu'
                            : infoQuery.experience_id
                            ? 'exp'
                            : 'personal'}
                        :{' '}
                        {infoQuery.education_id
                            ? infoQuery.education_id
                            : infoQuery.experience_id
                            ? infoQuery.experience_id
                            : 'personal'}
                    </p>
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
                        name="project_name"
                        placeholder="Project Name"
                        onChange={(event) => {
                            handleInputChange(
                                event,
                                'project_name',
                                setEditRecord,
                                getEditRecord,
                            );
                        }}
                        value={getEditRecord ? getEditRecord.project_name : ''}
                    />
                    {formErrors.project_name && (
                        <p>{formErrors.project_name}</p>
                    )}
                    <label>Proyect Type:</label>
                    <select value={selectedType} onChange={setType}>
                        <option value="personal_type">Personal</option>
                        <option
                            disabled={experienceInfo.length <= 0}
                            hidden={experienceInfo.length <= 0}
                            value="experience_type"
                        >
                            Experience
                        </option>
                        <option
                            disabled={educationInfo.length <= 0}
                            hidden={educationInfo.length <= 0}
                            value="education_type"
                        >
                            Education
                        </option>
                    </select>
                    {selectedType == 'experience_type' && (
                        <select
                            value={getEditRecord?.experience_id ?? ''}
                            name="experience_id"
                            onChange={(event) => {
                                handleInputChange(
                                    event,
                                    'experience_id',
                                    setEditRecord,
                                    getEditRecord,
                                );
                            }}
                        >
                            {experienceInfo.map((item, index) => (
                                <option key={index} value={item.id}>
                                    {item.company_name}
                                </option>
                            ))}
                        </select>
                    )}
                    {selectedType == 'education_type' && (
                        <select
                            value={getEditRecord?.education_id ?? ''}
                            name="education_id"
                            onChange={(event) => {
                                handleInputChange(
                                    event,
                                    'education_id',
                                    setEditRecord,
                                    getEditRecord,
                                );
                            }}
                        >
                            {educationInfo.map((item, index) => (
                                <option key={index} value={item.id}>
                                    {item.school_name} {item.degree}
                                </option>
                            ))}
                        </select>
                    )}
                    <input
                        type="text"
                        name="project_description"
                        placeholder="Project Description"
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
                    {formErrors.project_description && (
                        <p>{formErrors.project_description}</p>
                    )}
                    <button type="submit">Save</button>
                    {getEditRecord && getEditRecord.id && (
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
