import { Paper, Stack, Group, Text, Divider } from '@mantine/core';
import {
    IconFileDescription,
    IconBriefcase,
    IconBuilding,
} from '@tabler/icons-react';
import React from 'react';
import classes from './JobDescriptionDisplay.module.css';

interface JobDescriptionDisplayProps {
    jobDescription: string | null | undefined;
    jobPosition: string | null | undefined;
    companyName: string | null | undefined;
}

export default function JobDescriptionDisplay({
    jobDescription,
    jobPosition,
    companyName,
}: JobDescriptionDisplayProps) {
    return (
        <Paper p="md" withBorder>
            <Stack gap="md">
                <Group gap="xs">
                    <IconFileDescription size={24} stroke={1.5} />
                    <Text fw={700} size="lg">
                        Job Offer Details
                    </Text>
                </Group>

                {/* === NEW: Section to display Job Position and Company === */}
                <Stack gap="xs" mt="xs">
                    {jobPosition && (
                        <Group gap="xs" wrap="nowrap">
                            <IconBriefcase
                                size={20}
                                stroke={1.5}
                                color="var(--mantine-color-gray-6)"
                            />
                            <Text fw={600} size="md">
                                {jobPosition}
                            </Text>
                        </Group>
                    )}
                    {companyName && (
                        <Group gap="xs" wrap="nowrap">
                            <IconBuilding
                                size={20}
                                stroke={1.5}
                                color="var(--mantine-color-gray-6)"
                            />
                            <Text size="md" c="dimmed">
                                {companyName}
                            </Text>
                        </Group>
                    )}
                </Stack>
                {/* === End of New Section === */}

                {/* Add a divider if there is a job description to display */}
                {(jobPosition || companyName) && jobDescription && (
                    <Divider my="xs" />
                )}

                {jobDescription ? (
                    <Paper p="md" withBorder bg="gray.0" radius="md">
                        <Text
                            component="div"
                            className={classes.descriptionText}
                        >
                            {jobDescription}
                        </Text>
                    </Paper>
                ) : (
                    <Text c="dimmed" ta="center" p="xl">
                        No job description has been provided.
                    </Text>
                )}
            </Stack>
        </Paper>
    );
}
