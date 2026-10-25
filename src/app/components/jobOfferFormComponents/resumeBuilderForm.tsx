'use client';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateJobDataOffer,
    FormJobOfferDataStructure,
} from '@/utils/interfaces';
import { useState, useRef, useEffect } from 'react';
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
    Group,
    Tooltip,
    Paper,
    ThemeIcon,
    Loader,
    Alert,
    Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IncompleteProfileModal } from './IncompleteProfileModal';
import {
    IconCheck,
    IconSparkles,
    IconX,
    IconClock,
    IconAlertTriangle,
} from '@tabler/icons-react';
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

    // Visual Step-by-Step Progress State
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
    const [scoutPreview, setScoutPreview] = useState<{
        angle: string;
        keywordCount: number;
    } | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const [opened, { open, close }] = useDisclosure(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (!isGenerating) return;
        const interval = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isGenerating]);

    async function proceedToGenerate() {
        if (isGenerating || !formRef.current) return;
        const formData = new FormData(formRef.current);
        const rawJobData = Object.fromEntries(formData);
        const parseJobOffer = userSchema.safeParse(rawJobData);
        setFormErrors(emptyStateJobDataOffer);

        if (!parseJobOffer.success) {
            const error = parseJobOffer.error;
            let newErrors = emptyStateJobDataOffer;
            for (const issue of error.issues) {
                newErrors = {
                    ...newErrors,
                    [issue.path[0]]: issue.message,
                };
            }
            setFormErrors(newErrors);
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);
        setScoutPreview(null);
        setElapsedSeconds(0);
        setCurrentStep(1); // Step 1: Validating Profile & Job Offer

        try {
            // STEP 2: AI Scout (Selects Best Projects & ATS Keywords)
            setCurrentStep(2);
            const resScout = await fetch('/api/geminiResumeInteraction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    step: 'scout',
                    data: rawJobData,
                }),
            });
            const scoutResult = await resScout.json();

            if (!resScout.ok) {
                throw new Error(
                    scoutResult.message ||
                        'Step 2 (AI Scout) failed to analyze job description.',
                );
            }

            const scoutPlan = scoutResult.scoutPlan;
            setScoutPreview({
                angle: scoutPlan.coreNarrativeAngle,
                keywordCount: scoutPlan.targetKeywords?.length || 0,
            });

            // STEP 3: AI Writer (Crafts Tailored Resume Bullets)
            setCurrentStep(3);
            const resWriter = await fetch('/api/geminiResumeInteraction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    step: 'writer',
                    data: rawJobData,
                    scoutPlan,
                }),
            });
            const writerResult = await resWriter.json();

            if (!resWriter.ok) {
                throw new Error(
                    writerResult.message ||
                        'Step 3 (AI Resume Writer) failed to generate resume.',
                );
            }

            let geminiJsonString = writerResult.message;
            const firstBrace = geminiJsonString.indexOf('{');
            const lastBrace = geminiJsonString.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                geminiJsonString = geminiJsonString.substring(
                    firstBrace,
                    lastBrace + 1,
                );
            }
            const resumeGeneratedObject = JSON.parse(geminiJsonString);

            // STEP 4: Save to Local SQLite Database
            setCurrentStep(4);
            const dataForSave = {
                ...rawJobData,
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
                throw new Error(
                    responseSaving.message ||
                        'Step 4 (Save to Database) failed.',
                );
            }

            setCurrentStep(5); // Complete!
            if (responseSaving.id) {
                router.push(`/resume/${responseSaving.id}`);
            } else {
                setIsGenerating(false);
            }
        } catch (error) {
            console.error('Resume generation error:', error);
            setGenerationError(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred during generation.',
            );
            setIsGenerating(false);
        }
    }

    function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (status === 'disabled' || status === 'warn') {
            open();
            return;
        }
        proceedToGenerate();
    }

    const stepsList = [
        {
            stepNum: 1,
            label: 'Step 1: Fetching your Master Profile from SQLite',
        },
        {
            stepNum: 2,
            label: 'Step 2: AI Scout selecting best projects & extracting ATS keywords',
        },
        {
            stepNum: 3,
            label: 'Step 3: AI Writer tailoring high-impact STAR bullet points',
        },
        {
            stepNum: 4,
            label: 'Step 4: Saving tailored resume & opening live editor',
        },
    ];

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
                <div className={styles.header}>
                    <Title order={1} className={styles.mainTitle}>
                        Tailor Your Resume
                    </Title>
                    <Text size="md" className={styles.subTitle}>
                        Paste the job description below and let AI craft a
                        tailored resume from your master profile.
                    </Text>
                </div>

                {/* --- Detailed Error Display if Generation Crashed --- */}
                {generationError && (
                    <Alert
                        color="red"
                        title={`Generation Stopped at Step ${currentStep}`}
                        icon={<IconX size={18} />}
                        mb="md"
                        withCloseButton
                        onClose={() => setGenerationError(null)}
                    >
                        <Text size="sm">{generationError}</Text>
                        <Text size="xs" c="dimmed" mt={4}>
                            Your form inputs below are still intact. Check your
                            GEMINI_API_KEY or network connection and click
                            Generate again.
                        </Text>
                    </Alert>
                )}

                {/* --- Live Visual Step-by-Step Progress Card --- */}
                {isGenerating && (
                    <Paper p="lg" mb="lg" withBorder radius="md" bg="orange.0">
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Group gap="xs">
                                    <Loader size="sm" color="orange" />
                                    <Text fw={700} size="md">
                                        Building Your Tailored Resume...
                                    </Text>
                                </Group>
                                <Badge color="orange" variant="filled" size="lg">
                                    Elapsed: {elapsedSeconds}s
                                </Badge>
                            </Group>

                            <Alert
                                color="red"
                                variant="light"
                                icon={<IconAlertTriangle size={18} />}
                                py="xs"
                            >
                                <Text size="xs" fw={700}>
                                    PLEASE DO NOT REFRESH OR CLOSE THIS TAB WHILE
                                    GENERATING — refreshing before Step 4
                                    completes will cancel the AI generation.
                                </Text>
                            </Alert>

                            <Stack gap="xs">
                                {stepsList.map((s) => {
                                    const isDone = currentStep > s.stepNum;
                                    const isCurrent = currentStep === s.stepNum;
                                    return (
                                        <Group key={s.stepNum} gap="sm">
                                            {isDone ? (
                                                <ThemeIcon
                                                    color="teal"
                                                    size={22}
                                                    radius="xl"
                                                >
                                                    <IconCheck size={14} />
                                                </ThemeIcon>
                                            ) : isCurrent ? (
                                                <Loader
                                                    size={20}
                                                    color="orange"
                                                />
                                            ) : (
                                                <ThemeIcon
                                                    color="gray"
                                                    variant="light"
                                                    size={22}
                                                    radius="xl"
                                                >
                                                    <IconClock size={14} />
                                                </ThemeIcon>
                                            )}
                                            <Text
                                                size="sm"
                                                fw={isCurrent ? 700 : 500}
                                                c={
                                                    isDone
                                                        ? 'teal.8'
                                                        : isCurrent
                                                          ? 'orange.9'
                                                          : 'dimmed'
                                                }
                                            >
                                                {s.label}{' '}
                                                <b>
                                                    {isDone
                                                        ? '— Checked!'
                                                        : isCurrent
                                                          ? '— In Progress...'
                                                          : '— Pending'}
                                                </b>
                                            </Text>
                                        </Group>
                                    );
                                })}
                            </Stack>

                            {scoutPreview && (
                                <Paper p="xs" withBorder radius="sm" bg="white">
                                    <Text size="xs" fw={600} c="teal.8">
                                        ✓ AI Scout Locked Target Angle:{' '}
                                        {scoutPreview.angle} ({scoutPreview.keywordCount}{' '}
                                        ATS keywords matched)
                                    </Text>
                                </Paper>
                            )}
                        </Stack>
                    </Paper>
                )}

                <form ref={formRef} onSubmit={handleFormSubmit}>
                    <Stack gap="md">
                        <Group grow>
                            <TextInput
                                label="Company Name"
                                placeholder="e.g., Acme Corp"
                                name="company_name"
                                maxLength={CHARACTER_LIMITS.company}
                                error={formErrors.company_name || undefined}
                                disabled={isGenerating}
                                required
                            />
                            <TextInput
                                label="Job Position"
                                placeholder="e.g., Senior Full-Stack Engineer"
                                name="job_position"
                                maxLength={CHARACTER_LIMITS.title}
                                error={formErrors.job_position || undefined}
                                disabled={isGenerating}
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
                                disabled={isGenerating}
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
