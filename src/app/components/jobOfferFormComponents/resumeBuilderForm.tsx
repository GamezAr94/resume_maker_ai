'use client';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateJobDataOffer,
    FormJobOfferDataStructure,
} from '@/utils/interfaces';
import { useState, useRef } from 'react';
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
    Group,
    Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IncompleteProfileModal } from './IncompleteProfileModal';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconSparkles, IconX } from '@tabler/icons-react';
import { CHARACTER_LIMITS } from '@/utils/configLimits';
import CharacterCounter from '@/app/components/CharacterCounter/CharacterCounter';

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

interface SectionCount {
    current: number;
    required: number;
    label: string;
    value: string;
}

interface Props {
    status: 'disabled' | 'warn' | 'ready';
    percentage: number;
    sectionCounts: Record<string, SectionCount>;
    onCompleteProfileClick: () => void;
}

export default function ResumeBuilderForm({
    status,
    percentage,
    sectionCounts,
    onCompleteProfileClick,
}: Props) {
    const router = useRouter();
    const [jobDescription, setJobDescription] = useState('');
    const [formErrors, setFormErrors] = useState<FormJobOfferDataStructure>(
        emptyStateJobDataOffer,
    );
    const [isGenerating, setIsGenerating] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);
    const formRef = useRef<HTMLFormElement>(null);

    async function proceedToGenerate() {
        if (isGenerating || !formRef.current) return;
        const formData = new FormData(formRef.current);
        const parseJobOffer = userSchema.safeParse(
            Object.fromEntries(formData),
        );
        setFormErrors(emptyStateJobDataOffer);

        if (!parseJobOffer.success) {
            const error = parseJobOffer.error;
            let newErrors = emptyStateJobDataOffer;
            for (const issue of error.errors) {
                newErrors = {
                    ...newErrors,
                    [issue.path[0]]: issue.message,
                };
            }
            setFormErrors(newErrors);
            return;
        }

        setIsGenerating(true);
        notifications.show({
            id: 'generating-resume',
            loading: true,
            title: 'Generating Resume',
            message: 'Please wait while we tailor your resume...',
            autoClose: false,
            withCloseButton: false,
        });

        try {
            const resGemini = await fetch('/api/geminiResumeInteraction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: SectionTypes.JobOffer,
                    data: Object.fromEntries(formData),
                }),
            });
            const responseGemini = await resGemini.json();

            if (!resGemini.ok) {
                notifications.update({
                    id: 'generating-resume',
                    color: 'red',
                    title: 'Error Generating Resume',
                    message:
                        responseGemini.message ||
                        'An unknown error occurred while generating the resume.',
                    icon: <IconX />,
                    loading: false,
                    autoClose: 5000,
                });
                setIsGenerating(false);
                return;
            }

            let geminiJsonString = responseGemini.message;
            let resumeGeneratedObject;
            try {
                const firstBrace = geminiJsonString.indexOf('{');
                const lastBrace = geminiJsonString.lastIndexOf('}');
                if (
                    firstBrace !== -1 &&
                    lastBrace !== -1 &&
                    lastBrace > firstBrace
                ) {
                    geminiJsonString = geminiJsonString.substring(
                        firstBrace,
                        lastBrace + 1,
                    );
                }
                resumeGeneratedObject = JSON.parse(geminiJsonString);
            } catch (e) {
                console.error('Error parsing Gemini response:', e);
                notifications.update({
                    id: 'generating-resume',
                    color: 'red',
                    title: 'Error Processing Resume',
                    message:
                        'There was an issue processing the generated resume.',
                    icon: <IconX />,
                    loading: false,
                    autoClose: 5000,
                });
                setIsGenerating(false);
                return;
            }

            const jobOfferData = Object.fromEntries(formData);
            delete jobOfferData.resume_generated;
            const dataForSave = {
                ...jobOfferData,
                resume_generated: resumeGeneratedObject,
            };

            const resSaving = await fetch('/api/saveUserInfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: SectionTypes.JobOffer,
                    data: dataForSave,
                }),
            });
            const responseSaving = await resSaving.json();

            if (!resSaving.ok) {
                notifications.update({
                    id: 'generating-resume',
                    color: 'red',
                    title: 'Error Saving Resume',
                    message:
                        responseSaving.message ||
                        'An unknown error occurred while saving the resume.',
                    icon: <IconX />,
                    loading: false,
                    autoClose: 5000,
                });
                setIsGenerating(false);
                return;
            }

            notifications.update({
                id: 'generating-resume',
                color: 'teal',
                title: 'Success!',
                message: 'Your new resume has been generated and saved.',
                icon: <IconCheck />,
                loading: false,
                autoClose: 4000,
            });

            if (responseSaving.id) {
                router.push(`/resume/${responseSaving.id}`);
            } else {
                setIsGenerating(false);
            }
        } catch (error) {
            console.error('Unexpected error generating resume:', error);
            notifications.update({
                id: 'generating-resume',
                color: 'red',
                title: 'Error',
                message: 'An unexpected error occurred.',
                icon: <IconX />,
                loading: false,
                autoClose: 5000,
            });
            setIsGenerating(false);
        }
    }

    function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (status === 'disabled') {
            open();
            return;
        }
        if (status === 'warn') {
            open();
            return;
        }
        proceedToGenerate();
    }

    return (
        <>
            <IncompleteProfileModal
                opened={opened}
                onClose={close}
                onGenerate={() => {
                    close();
                    proceedToGenerate();
                }}
                onCompleteProfileClick={onCompleteProfileClick}
                percentage={percentage}
                sectionCounts={sectionCounts}
                status={status}
            />
            <Box pos="relative" className={styles.formWrapper} mx="auto">
                <LoadingOverlay
                    visible={isGenerating}
                    zIndex={1000}
                    overlayProps={{ radius: 'sm', blur: 2 }}
                />
                <div className={styles.header}>
                    <Title order={1} className={styles.mainTitle}>
                        Tailor Your Resume
                    </Title>
                    <Text size="md" className={styles.subTitle}>
                        Paste the job description below and let AI craft a
                        tailored resume from your master profile.
                    </Text>
                </div>
                <form ref={formRef} onSubmit={handleFormSubmit}>
                    <Stack gap="md">
                        <Group grow>
                            <TextInput
                                label="Company Name"
                                placeholder="e.g., Acme Corp"
                                name="company_name"
                                maxLength={CHARACTER_LIMITS.company}
                                error={formErrors.company_name || undefined}
                                required
                            />
                            <TextInput
                                label="Job Position"
                                placeholder="e.g., Senior Full-Stack Engineer"
                                name="job_position"
                                maxLength={CHARACTER_LIMITS.title}
                                error={formErrors.job_position || undefined}
                                required
                            />
                        </Group>
                        <div className={styles.inputWrapper}>
                            <Textarea
                                label="Job Description"
                                placeholder="Paste the full job description here..."
                                name="job_description"
                                autosize
                                minRows={8}
                                maxRows={18}
                                maxLength={CHARACTER_LIMITS.jobDescription}
                                value={jobDescription}
                                onChange={(e) =>
                                    setJobDescription(e.currentTarget.value)
                                }
                                error={formErrors.job_description || undefined}
                                required
                            />
                            <CharacterCounter
                                currentLength={jobDescription.length}
                                maxLength={CHARACTER_LIMITS.jobDescription}
                            />
                        </div>
                        <Tooltip
                            label="Please add basic profile details first"
                            disabled={status !== 'disabled'}
                        >
                            <Button
                                type="submit"
                                size="lg"
                                fullWidth
                                mt="md"
                                loading={isGenerating}
                                leftSection={<IconSparkles size={20} />}
                            >
                                Generate Tailored Resume
                            </Button>
                        </Tooltip>
                    </Stack>
                </form>
            </Box>
        </>
    );
}
