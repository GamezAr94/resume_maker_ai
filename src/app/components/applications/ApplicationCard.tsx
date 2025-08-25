import React from 'react';
import { Title, Text, Paper, Group, ActionIcon, rem } from '@mantine/core';
import {
    IconBriefcase,
    IconCalendar,
    IconExternalLink,
} from '@tabler/icons-react';
import { ApplicationData } from '@/utils/interfaces';

/**
 * Displays a single job application card.
 * @param {{ application: { id: string; jobTitle: string; company: string; appliedDate: string; description: string; link: string; } }} props
 */
export function ApplicationCard({
    application,
}: {
    application: ApplicationData;
}) {
    // Destructure the properties from the application object
    const { jobTitle, company, appliedDate, description, link } = application;

    return (
        <Paper
            shadow="sm"
            p="lg"
            radius="md"
            withBorder
            style={{
                borderLeft: `${rem(4)} solid #3b82f6`,
                transition: 'box-shadow 150ms ease',
            }}
        >
            <Group justify="space-between" align="flex-start">
                {/* Left side content */}
                <div style={{ flexGrow: 1 }}>
                    <Title order={3} style={{ color: '#0f172a' }}>
                        {jobTitle}
                    </Title>

                    {/* Metadata: Company and Date */}
                    <Group mt="sm" gap="lg">
                        <Group gap="xs" align="center">
                            <IconBriefcase
                                style={{ width: rem(16), height: rem(16) }}
                                stroke={1.5}
                            />
                            <Text size="sm" c="dimmed">
                                {company}
                            </Text>
                        </Group>
                        <Group gap="xs" align="center">
                            <IconCalendar
                                style={{ width: rem(16), height: rem(16) }}
                                stroke={1.5}
                            />
                            <Text size="sm" c="dimmed">
                                {appliedDate}
                            </Text>
                        </Group>
                    </Group>

                    {/* Description */}
                    <Text mt="md" size="sm" style={{ color: '#334155' }}>
                        {description}
                    </Text>
                </div>

                {/* Right side icon */}
                <ActionIcon
                    variant="subtle"
                    color="gray"
                    component="a"
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View application for ${jobTitle}`}
                >
                    <IconExternalLink
                        style={{ width: '70%', height: '70%' }}
                        stroke={1.5}
                    />
                </ActionIcon>
            </Group>
        </Paper>
    );
}
