'use client';

import {
    Paper,
    Stack,
    Group,
    Text,
    Button,
    Alert,
    Accordion,
    Textarea,
    CopyButton,
    ActionIcon,
    Tooltip,
    Divider,
} from '@mantine/core';
import {
    IconExternalLink,
    IconUsers,
    IconCopy,
    IconCheck,
} from '@tabler/icons-react';
import React from 'react';
import { NetworkingLink } from '@/utils/interfaces';

// --- UPDATE: Add props for the message templates ---
interface NetworkingDisplayProps {
    networkingLinks: NetworkingLink[] | null | undefined;
    userName: string;
    jobTitle: string;
    companyName: string;
}

export default function NetworkingDisplay({
    networkingLinks,
    userName,
    jobTitle,
    companyName,
}: NetworkingDisplayProps) {
    if (!networkingLinks || networkingLinks.length === 0) {
        return (
            <Alert color="blue" title="No Networking Links">
                Networking links are generated when a new resume is created with
                a company name.
            </Alert>
        );
    }

    // --- NEW: Dynamic Message Templates ---
    const recruiterMessage = `Hi [Recruiter Name],

I noticed you're a recruiter for ${companyName} and saw the opening for the ${jobTitle} position. My background in [mention 1-2 key skills from your resume] seems like a strong match for the role's requirements.

I've just submitted my application, but I wanted to reach out directly to express my strong interest in joining the team at ${companyName}. Would you be open to a brief chat next week?

Best regards,
${userName}`;

    const managerMessage = `Hi [Hiring Manager Name],

I'm writing to express my strong interest in the ${jobTitle} position at ${companyName}, which I found on [Platform, e.g., LinkedIn/company website].

With my experience in [mention a key skill or accomplishment from your resume], I was particularly excited to see the emphasis on [mention something from the job description]. I'm confident I can contribute to your team's goals.

I've submitted my application and look forward to hearing from your team soon.

Best regards,
${userName}`;

    const teammateMessage = `Hi [Teammate Name],

I hope you don't mind me reaching out. I'm applying for the ${jobTitle} role at ${companyName} and saw that you're currently on the team. I'm really impressed by [mention something about the company or its product].

I'd love to quickly ask you about your experience working at ${companyName} if you have a moment. Any insight would be greatly appreciated as I go through the application process.

Thanks,
${userName}`;

    return (
        <Paper p="md" withBorder>
            <Stack gap="lg">
                <Group gap="xs">
                    <IconUsers size={24} stroke={1.5} />
                    <Text fw={700} size="lg">
                        Find Key People on LinkedIn
                    </Text>
                </Group>
                <Text size="sm" c="dimmed">
                    Use these direct search links to find recruiters, potential
                    managers, and teammates. Networking is a powerful way to get
                    noticed.
                </Text>

                {/* --- LinkedIn Search Links --- */}
                <Stack gap="sm">
                    {networkingLinks.map((link) => (
                        <Button
                            key={link.label}
                            component="a"
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="default"
                            fullWidth
                            justify="space-between"
                            rightSection={<IconExternalLink size={18} />}
                        >
                            {link.label}
                        </Button>
                    ))}
                </Stack>

                <Divider
                    my="md"
                    label="Copyable Message Templates"
                    labelPosition="center"
                />

                {/* --- NEW: Accordion for Messages --- */}
                <Accordion variant="separated" defaultValue="recruiter">
                    <Accordion.Item value="recruiter">
                        <Accordion.Control>
                            Message Template for Recruiters
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Textarea
                                value={recruiterMessage}
                                autosize
                                minRows={8}
                                readOnly
                            />
                            <CopyButton value={recruiterMessage} timeout={2000}>
                                {({ copied, copy }) => (
                                    <Button
                                        color={copied ? 'teal' : 'gray'}
                                        onClick={copy}
                                        leftSection={
                                            copied ? (
                                                <IconCheck size={16} />
                                            ) : (
                                                <IconCopy size={16} />
                                            )
                                        }
                                        fullWidth
                                        mt="sm"
                                    >
                                        {copied
                                            ? 'Copied to Clipboard'
                                            : 'Copy Message'}
                                    </Button>
                                )}
                            </CopyButton>
                        </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item value="manager">
                        <Accordion.Control>
                            Message Template for Hiring Managers
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Textarea
                                value={managerMessage}
                                autosize
                                minRows={8}
                                readOnly
                            />
                            <CopyButton value={managerMessage} timeout={2000}>
                                {({ copied, copy }) => (
                                    <Button
                                        color={copied ? 'teal' : 'gray'}
                                        onClick={copy}
                                        leftSection={
                                            copied ? (
                                                <IconCheck size={16} />
                                            ) : (
                                                <IconCopy size={16} />
                                            )
                                        }
                                        fullWidth
                                        mt="sm"
                                    >
                                        {copied
                                            ? 'Copied to Clipboard'
                                            : 'Copy Message'}
                                    </Button>
                                )}
                            </CopyButton>
                        </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item value="teammate">
                        <Accordion.Control>
                            Message Template for Potential Teammates
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Textarea
                                value={teammateMessage}
                                autosize
                                minRows={8}
                                readOnly
                            />
                            <CopyButton value={teammateMessage} timeout={2000}>
                                {({ copied, copy }) => (
                                    <Button
                                        color={copied ? 'teal' : 'gray'}
                                        onClick={copy}
                                        leftSection={
                                            copied ? (
                                                <IconCheck size={16} />
                                            ) : (
                                                <IconCopy size={16} />
                                            )
                                        }
                                        fullWidth
                                        mt="sm"
                                    >
                                        {copied
                                            ? 'Copied to Clipboard'
                                            : 'Copy Message'}
                                    </Button>
                                )}
                            </CopyButton>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </Stack>
        </Paper>
    );
}
