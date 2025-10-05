'use client';

import {
    Paper,
    Stack,
    Group,
    Text,
    Divider,
    Alert,
    RingProgress,
    Chip,
    ThemeIcon,
    List,
} from '@mantine/core';
import {
    IconBulb,
    IconTargetArrow,
    IconTools,
    IconClipboardText,
    IconCheck,
} from '@tabler/icons-react';
import React from 'react';
import { AiFeedback } from '@/utils/interfaces';

interface AiFeedbackDisplayProps {
    feedback: AiFeedback | null | undefined;
    keywords: string[] | null | undefined;
}

// Helper function to get rating and color from the score
const getRatingDetails = (score: number) => {
    if (score >= 85) {
        return { rating: 'Strong Match', color: 'teal' };
    }
    if (score >= 70) {
        return { rating: 'Good Match', color: 'blue' };
    }
    if (score >= 50) {
        return { rating: 'Moderate Gap', color: 'orange' };
    }
    return { rating: 'Significant Gap', color: 'red' };
};

export default function AiFeedbackDisplay({
    feedback,
    keywords,
}: AiFeedbackDisplayProps) {
    const hasFeedback = feedback && feedback.candidateFit;

    if (!hasFeedback) {
        return (
            <Alert color="blue" title="No Feedback Yet">
                Generate a new resume to see the AI&apos;s analysis and
                recommendations.
            </Alert>
        );
    }

    const { rating, color } = getRatingDetails(feedback.candidateFit.score);

    return (
        <Paper p="md" withBorder>
            <Stack gap="xl">
                {/* --- Candidate Fit Section --- */}
                <Stack gap="md">
                    <Group gap="xs">
                        <IconTargetArrow size={24} stroke={1.5} />
                        <Text fw={700} size="lg">
                            Candidate-Role Fit
                        </Text>
                    </Group>
                    <Paper p="md" withBorder bg="gray.0" radius="md">
                        <Group>
                            <RingProgress
                                size={100}
                                thickness={10}
                                roundCaps
                                sections={[
                                    {
                                        value: feedback.candidateFit.score,
                                        color: color,
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
                </Stack>

                {/* --- Master Profile Suggestions Section --- */}
                {feedback.masterProfileSuggestions &&
                    feedback.masterProfileSuggestions.length > 0 && (
                        <>
                            <Stack gap="md">
                                <Group gap="xs">
                                    <IconTools size={24} stroke={1.5} />
                                    <Text fw={700} size="lg">
                                        Profile Improvement Tips
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
                                                style={{
                                                    width: 14,
                                                    height: 14,
                                                }}
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
                            <Divider />
                        </>
                    )}

                {/* --- Interview Prep Section --- */}
                <Stack gap="md">
                    <Group gap="xs">
                        <IconBulb size={24} stroke={1.5} />
                        <Text fw={700} size="lg">
                            Interview Prep
                        </Text>
                    </Group>
                    <List
                        spacing="xs"
                        size="sm"
                        icon={
                            <ThemeIcon color="teal" size={20} radius="xl">
                                <IconCheck style={{ width: 14, height: 14 }} />
                            </ThemeIcon>
                        }
                    >
                        <List.Item>
                            <b>Company Focus:</b>{' '}
                            {feedback.interviewPrep.companyFocus}
                        </List.Item>
                        <List.Item>
                            <b>Technical Topics to Review:</b>
                            <List withPadding listStyleType="disc" size="sm">
                                {feedback.interviewPrep.technicalTopics.map(
                                    (topic, index) => (
                                        <List.Item key={index}>
                                            {topic}
                                        </List.Item>
                                    ),
                                )}
                            </List>
                        </List.Item>
                    </List>
                </Stack>

                <Divider />

                {/* --- ATS Keywords Section --- */}
                {keywords && keywords.length > 0 && (
                    <>
                        <Stack gap="md">
                            <Group gap="xs">
                                <IconClipboardText size={24} stroke={1.5} />
                                <Text fw={700} size="lg">
                                    ATS Keywords
                                </Text>
                            </Group>
                            <Paper p="md" withBorder bg="gray.0" radius="md">
                                <Group gap="xs">
                                    {keywords.map((keyword) => (
                                        <Chip
                                            key={keyword}
                                            defaultChecked
                                            variant="filled"
                                        >
                                            {keyword}
                                        </Chip>
                                    ))}
                                </Group>
                            </Paper>
                        </Stack>
                        <Divider />
                    </>
                )}
            </Stack>
        </Paper>
    );
}
