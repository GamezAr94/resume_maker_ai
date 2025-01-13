'use client';
import { Dispatch, SetStateAction, useState } from 'react';
import { z } from 'zod';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStatePersonal,
    FormPersonalStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Button, Input } from '@mantine/core';

// creating the zod schema to validate the user data
const userSchema = z.object({
    first_name: z.string().min(2, 'First Name is required'),
    last_name: z.string().min(2, 'Last Name is required'),
});
interface Params {
    infoQuery: FormPersonalStructure;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    setUserInfo: Dispatch<SetStateAction<false | FormPersonalStructure>>;
}
export default function PersonalInfoForm({
    infoQuery,
    setRefreshTrigger,
    setUserInfo,
}: Params) {
    const [formErrors, setFormErrors] =
        useState<FormPersonalStructure>(emptyStatePersonal);

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
        console.log('=====> RESPONSE personal');
        console.log(res.ok);
        console.log(response.message);
        console.log('=====>');

        // required to refresh the UI
        setRefreshTrigger((prevTrigger) => ({
            ...prevTrigger,
            personal: !prevTrigger.personal,
        }));
    }

    interface HandleInputChangeEvent {
        target: {
            value: string;
        };
    }
    // Function to handle the input change and also to rever the form errors
    function handleUserInputChange(
        event: HandleInputChangeEvent,
        type: keyof FormPersonalStructure,
        setter: Dispatch<SetStateAction<false | FormPersonalStructure>>,
        prevState: FormPersonalStructure,
    ) {
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
        <form onSubmit={validatingAndSaving}>
            <p>
                Remember to keep up to date all your information for best
                results
            </p>
            {/*
            <input type="tel" name="phone" placeholder="Phone" />
            <input type="text" name="address" placeholder="Address" />
            <input type="url" name="linkedin" placeholder="LinkedIn" />
            <input type="url" name="github" placeholder="GitHub" />
            <input type="url" name="portfolio" placeholder="Portfolio" />
            <input type="url" name="link" placeholder="Link" />
                */}
            <Input.Wrapper
                error={formErrors.first_name ? formErrors.first_name : ''}
            >
                <Input
                    error={!!formErrors.first_name}
                    placeholder="First Name"
                    name="first_name"
                    onChange={(event) => {
                        handleUserInputChange(
                            event,
                            'first_name',
                            setUserInfo,
                            infoQuery,
                        );
                    }}
                    value={infoQuery.first_name}
                />
            </Input.Wrapper>
            <Input.Wrapper
                error={formErrors.last_name ? formErrors.last_name : ''}
            >
                <Input
                    error={!!formErrors.last_name}
                    placeholder="Last Name"
                    name="last_name"
                    onChange={(event) => {
                        handleUserInputChange(
                            event,
                            'last_name',
                            setUserInfo,
                            infoQuery,
                        );
                    }}
                    value={infoQuery.last_name}
                />
            </Input.Wrapper>
            <Button size="md" type="submit">
                Update
            </Button>
        </form>
    );
}
