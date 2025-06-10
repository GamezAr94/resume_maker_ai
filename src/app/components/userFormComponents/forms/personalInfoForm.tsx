'use client';
import { Dispatch, SetStateAction, useState } from 'react';
import { z } from 'zod';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStatePersonal,
    FormPersonalStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Button, TextInput, Stack } from '@mantine/core'; // Using TextInput and Stack for consistency

// creating the zod schema to validate the user data
const userSchema = z.object({
    first_name: z.string().min(2, 'First Name is required'),
    last_name: z.string().min(2, 'Last Name is required'),
    email: z.string().email('A valid email is required'),
    phone: z
        .string()
        .min(10, 'Phone number must be at least 10 digits if provided')
        .or(z.literal('')), // Allows an empty string
    linkedin: z
        .string()
        .url('A valid URL is required')
        .optional()
        .or(z.literal('')), // Optional but must be a valid URL if provided
    github: z
        .string()
        .url('A valid URL is required')
        .optional()
        .or(z.literal('')),
    portfolio: z
        .string()
        .url('A valid URL is required')
        .optional()
        .or(z.literal('')),
    link: z
        .string()
        .url('A valid URL is required')
        .optional()
        .or(z.literal('')),
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
            <Stack>
                <TextInput
                    label="First Name"
                    placeholder="Your first name"
                    name="first_name"
                    value={infoQuery.first_name}
                    onChange={(event) =>
                        handleUserInputChange(
                            event,
                            'first_name',
                            setUserInfo,
                            infoQuery,
                        )
                    }
                    error={formErrors.first_name || undefined}
                    required
                />
                <TextInput
                    label="Last Name"
                    placeholder="Your last name"
                    name="last_name"
                    value={infoQuery.last_name}
                    onChange={(event) =>
                        handleUserInputChange(
                            event,
                            'last_name',
                            setUserInfo,
                            infoQuery,
                        )
                    }
                    error={formErrors.last_name || undefined}
                    required
                />

                {/* === NEWLY ADDED FIELDS === */}
                <TextInput
                    label="Email Address"
                    placeholder="your.email@example.com"
                    name="email"
                    type="email"
                    value={infoQuery.email || ''}
                    onChange={(event) =>
                        handleUserInputChange(
                            event,
                            'email',
                            setUserInfo,
                            infoQuery,
                        )
                    }
                    error={formErrors.email || undefined}
                    required
                />
                <TextInput
                    label="Phone Number"
                    placeholder="e.g., (123) 456-7890"
                    name="phone"
                    value={infoQuery.phone || ''}
                    onChange={(event) =>
                        handleUserInputChange(
                            event,
                            'phone',
                            setUserInfo,
                            infoQuery,
                        )
                    }
                    error={formErrors.phone || undefined}
                />
                <TextInput
                    label="LinkedIn Profile URL"
                    placeholder="https://linkedin.com/in/yourprofile"
                    name="linkedin_url"
                    value={infoQuery.linkedin_url || ''}
                    onChange={(event) =>
                        handleUserInputChange(
                            event,
                            'linkedin_url',
                            setUserInfo,
                            infoQuery,
                        )
                    }
                    error={formErrors.linkedin_url || undefined}
                />
                <TextInput
                    label="GitHub URL"
                    placeholder="https://github.com/your-username"
                    name="github_url"
                    value={infoQuery.github_url || ''}
                    onChange={(event) =>
                        handleUserInputChange(
                            event,
                            'github_url',
                            setUserInfo,
                            infoQuery,
                        )
                    }
                    error={formErrors.github_url || undefined}
                />
                <TextInput
                    label="Portfolio URL"
                    placeholder="https://your-portfolio.com"
                    name="portfolio_url"
                    value={infoQuery.portfolio_url || ''}
                    onChange={(event) =>
                        handleUserInputChange(
                            event,
                            'portfolio_url',
                            setUserInfo,
                            infoQuery,
                        )
                    }
                    error={formErrors.portfolio_url || undefined}
                />
                <TextInput
                    label="Other Website URL"
                    placeholder="e.g., your personal blog"
                    name="other_url"
                    value={infoQuery.other_url || ''}
                    onChange={(event) =>
                        handleUserInputChange(
                            event,
                            'other_url',
                            setUserInfo,
                            infoQuery,
                        )
                    }
                    error={formErrors.other_url || undefined}
                />

                <Button type="submit" mt="md">
                    Save Changes
                </Button>
            </Stack>
        </form>
    );
}
