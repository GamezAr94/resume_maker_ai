'use client';
import {
    Paper,
    Stack,
    Group,
    Text,
    Divider,
    Alert,
    RingProgress,
    Badge,
    ThemeIcon,
    List,
    Button,
    Loader,
} from '@mantine/core';
import {
    IconBulb,
    IconTargetArrow,
    IconTools,
    IconClipboardText,
    IconCheck,
    IconSparkles,
    IconRefresh,
    IconAlertTriangle,
    IconClock,
    IconX,
} from '@tabler/icons-react';
import React from 'react';
import { AiFeedback, FormJobOfferDataStructure } from '@/utils/interfaces';

interface AiFeedbackDisplayProps {
    feedback: AiFeedback | null | undefined;
    keywords: string[] | null | undefined;
    dataResume: FormJobOfferDataStructure;
    isGeneratingCoach: boolean;
    coachStep: number;
    coachElapsed: number;
    coachError: string | null;
    onGenerateCoach: () => void;
}

const getRatingDetails = (score: number) => {
    if (score >= 85) return { rating: 'Strong Match', color: 'teal' };
    if (score >= 70) return { rating: 'Good Match', color: 'blue' };
    if (score >= 50) return { rating: 'Moderate Gap', color: 'orange' };
    return { rating: 'Significant Gap', color: 'red' };
};

export default function AiFeedbackDisplay({
    feedback,
    keywords,
    dataResume,
    isGeneratingCoach,
    coachStep,
    coachElapsed,
    coachError,
    onGenerateCoach,
}: AiFeedbackDisplayProps) {
    const hasFeedback =
        feedback &&
        feedback.candidateFit &&
        typeof feedback.candidateFit.score === 'number' &&
        feedback.candidateFit.summary;

    // Build a lowercase string of all visible text in the current resume to check keyword coverage
    const resumeTextCorpus = JSON.stringify(
        dataResume?.resume_generated?.layout || [],
    ).toLowerCase();

    const coachSteps = [
        'Reading your tailored resume & Master Profile vault',
        'Comparing achievements against target Job Description',
        'Generating Candidate Fit Score, Interview Prep & Outreach notes',
        'Auto-saving analysis to your local SQLite database',
    ];

    return (
        <Paper p="md" withBorder>
            <Stack gap="xl">
                {/* --- ATS Keywords Live Coverage Section (Always available immediately!) --- */}
                {keywords && keywords.length > 0 && (
                    <Stack gap="sm">
                        <Group justify="space-between">
                            <Group gap="xs">
                                <IconClipboardText size={22} stroke={1.5} />
                                <Text fw={700} size="md">
                                    Live ATS Keyword Coverage
                                </Text>
                            </Group>
                            <Text size="xs" c="dimmed">
                                Green = Found in your resume | Orange = Missing
                            </Text>
                        </Group>
                        <Paper p="sm" withBorder bg="gray.0" radius="md">
                            <Group gap="xs">
                                {keywords.map((keyword) => {
                                    const isPresent = resumeTextCorpus.includes(
                                        keyword.toLowerCase(),
                                    );
                                    return (
                                        <Badge
                                            key={keyword}
                                            color={isPresent ? 'teal' : 'orange'}
                                            variant={isPresent ? 'light' : 'outline'}
                                            size="md"
                                            style={{ textTransform: 'none' }}
                                        >
                                            {isPresent ? `✓ ${keyword}` : `+ ${keyword}`}
                                        </Badge>
                                    );
                                })}
                            </Group>
                        </Paper>
                    </Stack>
                )}

                {/* --- Error Alert if Coach API Failed --- */}
                {coachError && (
                    <Alert
                        color="red"
                        title="AI Coaching Generation Failed"
                        icon={<IconX size={18} />}
                    >
                        <Text size="sm">{coachError}</Text>
                        <Button
                            mt="sm"
                            size="xs"
                            color="red"
                            variant="outline"
                            onClick={onGenerateCoach}
                        >
                            Retry Generation
                        </Button>
                    </Alert>
                )}

                {/* --- Loading Progress Checklist --- */}
                {isGeneratingCoach && (
                    <Paper p="lg" withBorder radius="md" bg="blue.0">
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Group gap="xs">
                                    <Loader size="sm" color="blue" />
                                    <Text fw={700} c="blue.9">
                                        AI Career Coach is Analyzing Your Fit...
                                    </Text>
                                </Group>
                                <Badge color="blue" variant="filled">
                                    Elapsed: {coachElapsed}s
                                </Badge>
                            </Group>

                            <Alert
                                color="yellow"
                                variant="light"
                                icon={<IconAlertTriangle size={16} />}
                                py="xs"
                            >
                                <Text size="xs" fw={600}>
                                    Please do not refresh the page while generating so this
                                    analysis can finish and auto-save. (Your resume itself is
                                    already safely saved!)
                                </Text>
                            </Alert>

                            <Stack gap="xs">
                                {coachSteps.map((label, idx) => {
                                    const isDone = coachStep > idx;
                                    const isCurrent = coachStep === idx;
                                    return (
                                        <Group key={idx} gap="sm">
                                            {isDone ? (
                                                <ThemeIcon
                                                    color="teal"
                                                    size={20}
                                                    radius="xl"
                                                >
                                                    <IconCheck size={13} />
                                                </ThemeIcon>
                                            ) : isCurrent ? (
                                                <Loader size={18} color="blue" />
                                            ) : (
                                                <ThemeIcon
                                                    color="gray"
                                                    variant="light"
                                                    size={20}
                                                    radius="xl"
                                                >
                                                    <IconClock size={13} />
                                                </ThemeIcon>
                                            )}
                                            <Text
                                                size="sm"
                                                fw={isCurrent ? 600 : 400}
                                                c={
                                                    isDone
                                                        ? 'teal.8'
                                                        : isCurrent
                                                          ? 'blue.9'
                                                          : 'dimmed'
                                                }
                                            >
                                                {label}{' '}
                                                {isDone
                                                    ? '— Checked!'
                                                    : isCurrent
                                                      ? '— In Progress...'
                                                      : '— Pending'}
                                            </Text>
                                        </Group>
                                    );
                                })}
                            </Stack>
                        </Stack>
                    </Paper>
                )}

                {/* --- On-Demand Prompt if Not Generated Yet --- */}
                {!hasFeedback && !isGeneratingCoach && (
                    <Paper p="xl" withBorder radius="md" ta="center" bg="gray.0">
                        <Stack align="center" gap="md">
                            <ThemeIcon size={48} radius="xl" color="orange" variant="light">
                                <IconSparkles size={26} />
                            </ThemeIcon>
                            <Text fw={700} size="lg">
                                Generate Deep Role-Fit Analysis, Interview Prep & Outreach
                            </Text>
                            <Text size="sm" c="dimmed" maw={480}>
                                We decoupled this step so your initial resume generates twice
                                as fast. Click below to run a dedicated AI Career Coach call
                                that scores your resume, prepares technical interview topics,
                                and writes personalized LinkedIn messages!
                            </Text>
                            <Button
                                size="md"
                                leftSection={<IconSparkles size={18} />}
                                onClick={onGenerateCoach}
                            >
                                Generate AI Feedback & Networking
                            </Button>
                        </Stack>
                    </Paper>
                )}

                {/* --- Render Full Feedback Once Generated --- */}
                {hasFeedback && !isGeneratingCoach && (
                    <>
                        <Group justify="space-between">
                            <Group gap="xs">
                                <IconTargetArrow size={24} stroke={1.5} />
                                <Text fw={700} size="lg">
                                    Candidate-Role Fit
                                </Text>
                            </Group>
                            <Button
                                variant="subtle"
                                size="xs"
                                leftSection={<IconRefresh size={14} />}
                                onClick={onGenerateCoach}
                            >
                                Regenerate Analysis
                            </Button>
                        </Group>

                        {(() => {
                            const { rating, color } = getRatingDetails(
                                feedback.candidateFit.score,
                            );
                            return (
                                <Paper p="md" withBorder bg="gray.0" radius="md">
                                    <Group>
                                        <RingProgress
                                            size={100}
                                            thickness={10}
                                            roundCaps
                                            sections={[
                                                {
                                                    value: feedback.candidateFit.score,
                                                    color,
                                                },
                                            ]}
                                            label={
                                                <Text
                                                    c={color}
                                                    fw={700}
                                                    ta="center"
                                                    size="xl"
                                                >
                                                    {feedback.candidateFit.score}%
                                                </Text>
                                            }
                                        />
                                        <Stack gap="xs" style={{ flex: 1 }}>
                                            <Text fw={600} size="lg">
                                                {rating}
                                            </Text>
                                            <Text size="sm" c="dimmed">
                                                {feedback.candidateFit.summary}
                                            </Text>
                                        </Stack>
                                    </Group>
                                </Paper>
                            );
                        })()}

                        {feedback.masterProfileSuggestions &&
                            feedback.masterProfileSuggestions.length > 0 && (
                                <>
                                    <Divider />
                                    <Stack gap="md">
                                        <Group gap="xs">
                                            <IconTools size={24} stroke={1.5} />
                                            <Text fw={700} size="lg">
                                                Master Profile Improvement Tips
                                            </Text>
                                        </Group>
                                        <List
                                            spacing="xs"
                                            size="sm"
                                            icon={
                                                <ThemeIcon
                                                    color="blue"
                                                    size={20}
                                                    radius="xl"
                                                >
                                                    <IconCheck
                                                        style={{ width: 14, height: 14 }}
                                                    />
                                                </ThemeIcon>
                                            }
                                        >
                                            {feedback.masterProfileSuggestions.map(
                                                (item, index) => (
                                                    <List.Item key={index}>
                                                        <b>{item.suggestion}</b>
                                                        {item.example && (
                                                            <Text
                                                                c="dimmed"
                                                                size="sm"
                                                                mt={4}
                                                            >
                                                                {item.example}
                                                            </Text>
                                                        )}
                                                    </List.Item>
                                                ),
                                            )}
                                        </List>
                                    </Stack>
                                </>
                            )}

                        <Divider />

                        <Stack gap="md">
                            <Group gap="xs">
                                <IconBulb size={24} stroke={1.5} />
                                <Text fw={700} size="lg">
                                    Tailored Interview Prep
                                </Text>
                            </Group>
                            <List
                                spacing="sm"
                                size="sm"
                                icon={
                                    <ThemeIcon color="teal" size={20} radius="xl">
                                        <IconCheck style={{ width: 14, height: 14 }} />
                                    </ThemeIcon>
                                }
                            >
                                <List.Item>
                                    <b>Company & Culture Focus:</b>{' '}
                                    {feedback.interviewPrep.companyFocus}
                                </List.Item>
                                <List.Item>
                                    <b>Technical Topics & Questions to Prepare:</b>
                                    <List
                                        withPadding
                                        listStyleType="disc"
                                        size="sm"
                                        mt={6}
                                        spacing={4}
                                    >
                                        {feedback.interviewPrep.technicalTopics.map(
                                            (topic, index) => (
                                                <List.Item key={index}>{topic}</List.Item>
                                            ),
                                        )}
                                    </List>
                                </List.Item>
                            </List>
                        </Stack>
                    </>
                )}
            </Stack>
        </Paper>
    );
}
