'use client';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateJobDataOffer,
    FormJobOfferDataStructure,
} from '@/utils/interfaces';
import { useState } from 'react';
import { z } from 'zod';

import styles from './resumeBuilderForm.module.css';
import { useRouter } from 'next/navigation';
import {
    Button,
    TextInput,
    Textarea,
    Stack,
    Title,
    Text,
    Box,
    LoadingOverlay,
} from '@mantine/core';

// the limits for the content of each input field in the forms
import { CHARACTER_LIMITS } from '@/utils/configLimits';

import CharacterCounter from '@/app/components/CharacterCounter/CharacterCounter';

// creating the zod schema to validate the user data
const userSchema = z.object({
    company_name: z
        .string()
        .min(2, 'Company Name is required')
        .max(
            CHARACTER_LIMITS.company,
            `Cannot exceed ${CHARACTER_LIMITS.company} characters`,
        ),
    job_position: z
        .string()
        .min(2, 'Job Position is required')
        .max(
            CHARACTER_LIMITS.title,
            `Cannot exceed ${CHARACTER_LIMITS.title} characters`,
        ),
    job_description: z
        .string()
        .min(2, 'Job Description is required')
        .max(
            CHARACTER_LIMITS.jobDescription,
            `Cannot exceed ${CHARACTER_LIMITS.jobDescription} characters`,
        ),
});

export default function ResumeBuilderForm() {
    const router = useRouter();
    const [jobDescription, setJobDescription] = useState('');
    const [formErrors, setFormErrors] = useState<FormJobOfferDataStructure>(
        emptyStateJobDataOffer,
    );
    // this will manage the status of the button to show the user that the resume is being generated
    const [isGenerating, setIsGenerating] = useState(false);

    // Function to validate the JOB OFFER data save it and GENERATE the resume
    async function validatingAndSaving(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        // prevent the default form submission and fetch the data
        event.preventDefault();
        // if the isGenerating is true, we dont want to generate the resume again
        if (isGenerating) return;

        // get the form data
        const formData = new FormData(event.currentTarget);
        // parse the user data with the zod schema
        const parseJobOffer = userSchema.safeParse(
            Object.fromEntries(formData),
        );

        // reset the errors in the state
        setFormErrors(emptyStateJobDataOffer);

        // if the user data is not valid, store the errors in the state and return
        if (!parseJobOffer.success) {
            const error = parseJobOffer.error;
            let newErrors = emptyStateJobDataOffer;
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

        // If the user data is valid, we can proceed to generate the resume
        // set the isGenerating to true to show the user that the resume is being generated
        setIsGenerating(true);

        try {
            // Generate the resume usin Gemini
            const resGemini = await fetch('api/geminiResumeInteraction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: SectionTypes.JobOffer,
                    data: Object.fromEntries(formData),
                }),
            });
            const responseGemini = await resGemini.json();
            // show a message to the user. Error generating the new resume
            if (!resGemini.ok) {
                // TODO ART: show an error message to the user. Error processing the job offer, try again
                console.error(responseGemini.message);
                // Reset the isGenerating state
                setIsGenerating(false);
                return;
            }

            // After getting responseGemini.message (which is the JSON string from Gemini)
            const geminiJsonString = responseGemini.message;
            let resumeGeneratedObject;
            try {
                resumeGeneratedObject = JSON.parse(geminiJsonString);
            } catch (e) {
                console.error("Failed to parse Gemini's JSON response:", e);
                // Handle error - maybe show message to user
                return;
            }

            // Now, when preparing data for 'api/saveUserInfo'
            const jobOfferData = Object.fromEntries(formData); // Gets company_name, job_position, etc.
            delete jobOfferData.resume_generated; // Remove the string version if it was ever on formData directly

            const dataForSave = {
                ...jobOfferData, // company_name, job_position, job_description
                resume_generated: resumeGeneratedObject, // Attach the PARSED OBJECT here
            };

            // Saving the job offer AND the resume generated by Gemini
            const resSaving = await fetch('api/saveUserInfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: SectionTypes.JobOffer,
                    data: dataForSave, // Now data.resume_generated is an object
                }),
            });

            const responseSaving = await resSaving.json();
            // show a message to the user. Error saving the new resume
            if (!resSaving.ok) {
                // TODO ART: show an error message to the user. Error processing the job offer, try again
                console.error(responseSaving.message);
                // Reset the isGenerating state
                setIsGenerating(false);
                return;
            }

            // TODO ART: show a success message to the user
            console.log(
                '=====> Resume Generated and Saved Successfully <=====',
            );

            /*
            // NOTE: Uncomment to see the response from the API
            console.log(responseSaving.id);
            console.log(responseGemini.message);
            */

            const idResume = +responseSaving.id;
            if (isNaN(idResume) || idResume <= 0) {
                // TODO we can fetch the id of the newest element in the DB
                console.error(
                    'error getting the id of the saved data ' + idResume,
                );
                alert(
                    'An error occurred after saving. Could not retrieve resume ID.',
                );
                // Reset the isGenerating state
                setIsGenerating(false);
                return;
            }

            // Redirect to Resume with data
            router.push(`/resume/${idResume}`);
        } catch (err) {
            if (err instanceof Error) {
                console.error('unexpected error: ' + err.message);
            } else {
                console.error('unexpected error', err);
            }
        }
    }
    return (
        <Box className={styles.formWrapper} pos="relative">
            <LoadingOverlay
                visible={isGenerating}
                zIndex={1000}
                overlayProps={{ radius: 'sm', blur: 2 }}
            />
            <div className={styles.header}>
                <Title order={2} className={styles.mainTitle}>
                    AI Resume Builder
                </Title>
                <Text className={styles.subTitle}>
                    Enter the job details below to generate a tailored
                    AI-powered resume.
                </Text>
            </div>

            <form onSubmit={validatingAndSaving}>
                <Stack gap="lg">
                    <TextInput
                        label="Company Name"
                        maxLength={CHARACTER_LIMITS.company}
                        placeholder="e.g., Google, Microsoft, Netflix"
                        name="company_name"
                        error={formErrors.company_name || undefined}
                        required
                        disabled={isGenerating}
                    />

                    <TextInput
                        label="Job Position"
                        maxLength={CHARACTER_LIMITS.title}
                        placeholder="e.g., Senior Frontend Engineer"
                        name="job_position"
                        error={formErrors.job_position || undefined}
                        required
                        disabled={isGenerating}
                    />

                    <div className={styles.inputWrapper}>
                        <Textarea
                            label="Job Description"
                            placeholder="Paste the full job description here..."
                            name="job_description"
                            value={jobDescription}
                            onChange={(event) =>
                                setJobDescription(event.currentTarget.value)
                            }
                            maxLength={CHARACTER_LIMITS.jobDescription}
                            error={formErrors.job_description || undefined}
                            required
                            autosize
                            minRows={6}
                            disabled={isGenerating}
                        />
                        <CharacterCounter
                            currentLength={jobDescription.length}
                            maxLength={CHARACTER_LIMITS.jobDescription}
                        />
                    </div>

                    <Button
                        size="lg"
                        fullWidth
                        type="submit"
                        loading={isGenerating}
                        mt="xl"
                        color="blue" /* Use your primary theme color, like in the screenshot */
                        variant="filled" /* A solid, primary button */
                    >
                        Generate Resume
                    </Button>
                </Stack>
            </form>
        </Box>
    );
}
