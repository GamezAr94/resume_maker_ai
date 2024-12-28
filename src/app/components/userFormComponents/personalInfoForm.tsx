'use client';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { SectionTypes } from '@/utils/enums';
import { getUserInfo } from '@/app/db/user_queries';
import { emptyStatePersonal, FormPersonalStructure } from '@/utils/interfaces';

const userSchema = z.object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    /*
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().optional(),
    linkedin: z.string().url().optional(),
    // ... other fields ...
    workExperience: z.array(
        z.object({
            company: z.string().min(1, 'Company is required'),
            position: z.string().min(1, 'Position is required'),
            start_date: z.date(),
            // ... other work experience fields ...
        }),
    ),
    */
    // ... education, skills, projects ...
});
export default function PersonalInfoForm() {
    const [formErrors, setFormErrors] =
        useState<FormPersonalStructure>(emptyStatePersonal);
    const [userInfo, setUserInfo] = useState<FormPersonalStructure | false>(
        false,
    );

    // Fetch the user data when the component mounts
    useEffect(() => {
        const fetchUserInfo = async () => {
            const userInfoResp = await getUserInfo();
            // If the user doesn't exist, return
            if (!userInfoResp) {
                return;
            }
            // Set the user info in the state
            setUserInfo(userInfoResp[0]);
        };
        fetchUserInfo();
    }, []);

    // Function to validate the user data and save it
    async function validatingAndSaving(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        // prevent the default form submission and fetch the data
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const parseUser = userSchema.safeParse(Object.fromEntries(formData));

        // reset the errors in the state
        setFormErrors(emptyStatePersonal);

        // if the user data is not valid, store the errors in the state and return
        if (!parseUser.success) {
            const error = parseUser.error;
            let newErrors = emptyStatePersonal;
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
                type: SectionTypes.Personal,
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
        console.log('=====> RESPONSE');
        console.log(res.ok);
        console.log(response.message);
        console.log('=====>');
    }

    return (
        <form onSubmit={validatingAndSaving}>
            <p>Personal Information</p>
            <input
                type="text"
                name="first_name"
                placeholder="First Name"
                defaultValue={userInfo ? userInfo?.first_name : ''}
            />
            {formErrors.first_name && <p>{formErrors.first_name}</p>}
            <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                defaultValue={userInfo ? userInfo?.last_name : ''}
            />
            {formErrors.last_name && <p>{formErrors.last_name}</p>}
            {/*
            <input type="tel" name="phone" placeholder="Phone" />
            <input type="text" name="address" placeholder="Address" />
            <input type="url" name="linkedin" placeholder="LinkedIn" />
            <input type="url" name="github" placeholder="GitHub" />
            <input type="url" name="portfolio" placeholder="Portfolio" />
            <input type="url" name="link" placeholder="Link" />
                */}
            <button type="submit">Save</button>
        </form>
    );
}
