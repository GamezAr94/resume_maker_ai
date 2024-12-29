'use client';
import { getExperienceInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateExperience,
    FormExperienceStructure,
} from '@/utils/interfaces';
import { useEffect, useState } from 'react';
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
export default function WorkInfoForm() {
    const [formErrors, setFormErrors] =
        useState<FormExperienceStructure>(emptyStateExperience);
    const [experienceInfo, setExperienceInfo] = useState<
        [FormExperienceStructure] | false
    >(false);

    // Fetch the user data when the component mounts
    useEffect(() => {
        const fetchUserInfo = async () => {
            const experienceInfoResp = await getExperienceInfo();
            // If the user doesn't exist, return
            if (!experienceInfoResp) {
                return;
            }
            // TODO ART I need to print the existing records
            console.log(experienceInfoResp);
            // Set the user info in the state
            setExperienceInfo(experienceInfoResp);
        };
        fetchUserInfo();
    }, []);

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
            console.log(newErrors);
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
        // TODO ART: show a success message to the user
        console.log('=====> RESPONSE experience');
        console.log(res.ok);
        console.log(response.message);
        console.log('=====>');
    }
    return (
        <form onSubmit={validatingAndSaving}>
            <p>Work Experience</p>
            {
                // TODO ART: I need to show the ID if it is an existing recod, otherwise I dont need to show the id so that I can generate a new record
                <input type="text" name="id" defaultValue="1" readOnly />
            }
            <input type="text" name="company_name" placeholder="Company" />
            {formErrors.company_name && <p>{formErrors.company_name}</p>}
            <input type="text" name="job_title" placeholder="Job Title" />
            {/*
            {formErrors.job_title && <p>{formErrors.job_title}</p>}
            <input type="date" name="start_date" placeholder="Start Date" />
            {formErrors.start_date && (
                <p>
                    {typeof formErrors.start_date == 'string'
                        ? formErrors.start_date
                        : 'Invalid start Date'}
                </p>
            )}
            <input type="date" name="end_date" placeholder="End Date" />
            {formErrors.end_date && (
                <p>
                    {typeof formErrors.end_date == 'string'
                        ? formErrors.end_date
                        : 'Invalid end Date'}
                </p>
            )}
            <input type="text" name="description" placeholder="Description" />
            {formErrors.description && <p>{formErrors.description}</p>}
                */}
            <button type="submit">Save</button>
        </form>
    );
}
