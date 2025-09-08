'use client';

import { Paper, Stack, Group, Text, Divider, Alert } from '@mantine/core';
// Import relevant icons from Tabler
import { IconBulb, IconBrain } from '@tabler/icons-react';
import React from 'react';
// Import a new CSS module for this component
import classes from './AiFeedbackDisplay.module.css';

interface AiFeedbackDisplayProps {
    recommendations: string | null | undefined;
    explanation: string | null | undefined;
}

export default function AiFeedbackDisplay({
    recommendations,
    explanation,
}: AiFeedbackDisplayProps) {
    // Check if there is any feedback to display
    const hasFeedback = recommendations || explanation;

    return (
        <Paper p="md" withBorder>
            <Stack gap="xl">
                {/* --- Recommendations Section --- */}
                <Stack gap="md">
                    <Group gap="xs">
                        <IconBulb size={24} stroke={1.5} />
                        <Text fw={700} size="lg">
                            Actionable Recommendations
                        </Text>
                    </Group>
                    {recommendations ? (
                        <Paper p="md" withBorder bg="gray.0" radius="md">
                            {/* The 'div' allows us to apply the class for proper text formatting */}
                            <div
                                className={classes.feedbackText}
                                dangerouslySetInnerHTML={{
                                    __html: recommendations.replace(
                                        /\n/g,
                                        '<br />',
                                    ),
                                }}
                            />
                        </Paper>
                    ) : (
                        <Text c="dimmed" size="sm">
                            No recommendations available.
                        </Text>
                    )}
                </Stack>

                <Divider />

                {/* --- Explanation Section --- */}
                <Stack gap="md">
                    <Group gap="xs">
                        <IconBrain size={24} stroke={1.5} />
                        <Text fw={700} size="lg">
                            AI Rationale
                        </Text>
                    </Group>
                    {explanation ? (
                        <Paper p="md" withBorder bg="gray.0" radius="md">
                            <div
                                className={classes.feedbackText}
                                dangerouslySetInnerHTML={{
                                    __html: explanation.replace(
                                        /\n/g,
                                        '<br />',
                                    ),
                                }}
                            />
                        </Paper>
                    ) : (
                        <Text c="dimmed" size="sm">
                            No explanation available.
                        </Text>
                    )}
                </Stack>

                {!hasFeedback && (
                    <Alert color="blue" title="No Feedback Yet">
                        Generate a resume to see the AI's recommendations and
                        rationale here.
                    </Alert>
                )}
            </Stack>
        </Paper>
    );
}
