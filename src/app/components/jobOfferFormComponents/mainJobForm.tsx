'use client';

import { SectionTypes } from '@/utils/enums';
import { emptyStateJobOffer, FormJobOfferStructure } from '@/utils/interfaces';
import { useState } from 'react';
import { z } from 'zod';

// creating the zod schema to validate the user data
const userSchema = z.object({
    company_name: z.string().min(2, 'Company Name is required'),
    job_position: z.string().min(2, 'Job Position is required'),
    job_description: z.string().min(2, 'Job Description is required'),
});
export default function MainJobForm() {
    const [formErrors, setFormErrors] =
        useState<FormJobOfferStructure>(emptyStateJobOffer);
    const [userInfo, setUserInfo] = useState<FormJobOfferStructure | false>(
        false,
    );

    // Function to validate the JOB OFFER data save it and GENERATE the resume
    async function validatingAndSaving(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        // prevent the default form submission and fetch the data
        event.preventDefault();
        // get the form data
        const formData = new FormData(event.currentTarget);
        // parse the user data with the zod schema
        const parseJobOffer = userSchema.safeParse(
            Object.fromEntries(formData),
        );

        // reset the errors in the state
        setFormErrors(emptyStateJobOffer);

        // if the user data is not valid, store the errors in the state and return
        if (!parseJobOffer.success) {
            const error = parseJobOffer.error;
            let newErrors = emptyStateJobOffer;
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
                type: SectionTypes.JobOffer,
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
        console.log('=====> RESPONSE job offer');
        console.log(res.ok);
        console.log(response.message);
        console.log('=====>');
    }

    return (
        <div>
            <form onSubmit={validatingAndSaving}>
                Job Offer
                <input
                    type="text"
                    name="company_name"
                    placeholder="Company Name"
                />
                {formErrors.company_name && <p>{formErrors.company_name}</p>}
                <input
                    type="text"
                    name="job_position"
                    placeholder="Job Position"
                />
                {formErrors.job_position && <p>{formErrors.job_position}</p>}
                <input
                    type="text"
                    name="job_description"
                    placeholder="Job Description"
                />
                {formErrors.job_description && (
                    <p>{formErrors.job_description}</p>
                )}
                <button type="submit">Generate Resume</button>
            </form>
        </div>
    );
}
