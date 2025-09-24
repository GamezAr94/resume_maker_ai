import React from 'react';
import {
    IconBriefcase,
    IconCalendar,
    IconExternalLink,
    IconTrash,
} from '@tabler/icons-react';
import {
    Title,
    Text,
    Paper,
    Group,
    ActionIcon,
    rem,
    Modal,
    Button,
    Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ApplicationData } from '@/utils/interfaces';

interface ApplicationCardProps {
    application: ApplicationData;
    onDelete: (id: string) => void;
}

/**
 * Displays a single job application card.
 * @param {{ application: { id: string; jobTitle: string; company: string; appliedDate: string; description: string; link: string; } }} props
 */
export function ApplicationCard({
    application,
    onDelete,
}: ApplicationCardProps) {
    // Destructure the properties from the application object
    const { id, jobTitle, company, appliedDate, description, link } =
        application;

    // Hook to control the confirmation modal's visibility
    const [opened, { open, close }] = useDisclosure(false);

    // Handler that calls the onDelete prop and closes the modal
    const handleDelete = () => {
        onDelete(id);
        close();
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                title="Confirm Deletion"
                centered
            >
                <Stack>
                    <Text>
                        Are you sure you want to delete your application for the{' '}
                        <strong>{jobTitle}</strong> position at{' '}
                        <strong>{company}</strong>?
                    </Text>
                    <Text c="dimmed" size="sm">
                        This action cannot be undone.
                    </Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={close}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={handleDelete}>
                            Delete Application
                        </Button>
                    </Group>
                </Stack>
            </Modal>

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
                <Group
                    justify="space-between"
                    align="flex-start"
                    display="flex"
                    wrap="nowrap"
                >
                    {/* Left side content */}
                    <div
                        style={{
                            display: 'flex',
                            width: '95%',
                            flexDirection: 'column',
                        }}
                    >
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
                        <Text
                            mt="md"
                            size="sm"
                            style={{ color: '#334155' }}
                            lineClamp={2}
                        >
                            {description}
                        </Text>
                    </div>

                    {/* Right side icon */}
                    <Stack gap="xs" align="center">
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            component="a"
                            href={link}
                            rel="noopener noreferrer"
                            aria-label={`View application for ${jobTitle}`}
                        >
                            <IconExternalLink
                                style={{ width: '70%', height: '70%' }}
                                stroke={1.5}
                            />
                        </ActionIcon>

                        {/* The delete button that opens the modal */}
                        <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={open} // This opens the confirmation modal
                            aria-label={`Delete application for ${jobTitle}`}
                        >
                            <IconTrash
                                style={{ width: '70%', height: '70%' }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Stack>
                </Group>
            </Paper>
        </>
    );
}
