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
    Divider,
    Badge,
    Loader,
    ThemeIcon,
} from '@mantine/core';
import {
    IconExternalLink,
    IconUsers,
    IconCopy,
    IconCheck,
    IconSparkles,
    IconBrandGoogle,
    IconBrandLinkedin,
    IconAlertTriangle,
} from '@tabler/icons-react';
import React from 'react';
import { NetworkingLink, OutreachMessages } from '@/utils/interfaces';

interface NetworkingDisplayProps {
    networkingLinks: NetworkingLink[] | null | undefined;
    outreachMessages?: OutreachMessages | null;
    userName: string;
    jobTitle: string;
    companyName: string;
    isGeneratingCoach: boolean;
    coachElapsed: number;
    coachError: string | null;
    onGenerateCoach: () => void;
}

export default function NetworkingDisplay({
    networkingLinks,
    outreachMessages,
    userName,
    jobTitle,
    companyName,
    isGeneratingCoach,
    coachElapsed,
    coachError,
    onGenerateCoach,
}: NetworkingDisplayProps) {
    const linkedinLinks = (networkingLinks || []).filter(
        (l) => !l.url.includes('google.com'),
    );
    const xrayLinks = (networkingLinks || []).filter((l) =>
        l.url.includes('google.com'),
    );

    const fallbackRecruiterNote = `Hi [Name], I just applied for the ${jobTitle} role at ${companyName}. My background building production systems aligns closely with your stack. Would love to connect! - ${userName}`;
    const fallbackManagerNote = `Hi [Name], I'm applying for the ${jobTitle} role on your team at ${companyName}. I've architected similar systems and would love to connect! - ${userName}`;
    const fallbackTeammateNote = `Hi [Name], fellow engineer here! I'm applying for the ${jobTitle} role at ${companyName} and would love to connect and learn how you like the engineering culture there. - ${userName}`;

    const messages = [
        {
            id: 'manager',
            title: 'Hiring Manager / Tech Lead Note (<280 chars)',
            badge: 'Highest Response Rate',
            badgeColor: 'teal',
            text: outreachMessages?.hiringManagerNote || fallbackManagerNote,
        },
        {
            id: 'recruiter_short',
            title: 'Technical Recruiter Connection Note (<280 chars)',
            badge: 'Fits Free LinkedIn Limit',
            badgeColor: 'blue',
            text:
                outreachMessages?.recruiterConnectionNote ||
                fallbackRecruiterNote,
        },
        {
            id: 'teammate',
            title: 'Potential Teammate / Engineer Note (<280 chars)',
            badge: 'Peer Referral',
            badgeColor: 'indigo',
            text: outreachMessages?.teammateNote || fallbackTeammateNote,
        },
        {
            id: 'recruiter_full',
            title: 'Full Cold Email / LinkedIn InMail',
            badge: 'Email / InMail',
            badgeColor: 'gray',
            text:
                outreachMessages?.recruiterFullMessage ||
                `Hi [Name],\n\nI recently applied for the ${jobTitle} position at ${companyName} and wanted to reach out directly. Would you be open to a brief 10-minute chat this week?\n\nBest regards,\n${userName}`,
        },
    ];

    return (
        <Paper p="md" withBorder>
            <Stack gap="lg">
                <Group justify="space-between">
                    <Group gap="xs">
                        <IconUsers size={24} stroke={1.5} />
                        <Text fw={700} size="lg">
                            Find Decision Makers & Outreach
                        </Text>
                    </Group>
                    {outreachMessages && !isGeneratingCoach && (
                        <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconSparkles size={14} />}
                            onClick={onGenerateCoach}
                        >
                            Regenerate AI Messages
                        </Button>
                    )}
                </Group>

                {/* --- Direct LinkedIn Links --- */}
                {linkedinLinks.length > 0 && (
                    <Stack gap="xs">
                        <Group gap={6}>
                            <IconBrandLinkedin size={18} color="#0a66c2" />
                            <Text size="sm" fw={600}>
                                Direct LinkedIn People Search
                            </Text>
                        </Group>
                        {linkedinLinks.map((link) => (
                            <Button
                                key={link.label}
                                component="a"
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="default"
                                fullWidth
                                justify="space-between"
                                rightSection={<IconExternalLink size={16} />}
                            >
                                {link.label}
                            </Button>
                        ))}
                    </Stack>
                )}

                {/* --- Google X-Ray Links --- */}
                {xrayLinks.length > 0 && (
                    <Stack gap="xs">
                        <Group gap={6}>
                            <IconBrandGoogle size={18} color="#ea4335" />
                            <Text size="sm" fw={600}>
                                Google X-Ray Search (Bypasses LinkedIn 3rd-Degree Blocks)
                            </Text>
                        </Group>
                        {xrayLinks.map((link) => (
                            <Button
                                key={link.label}
                                component="a"
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="light"
                                color="blue"
                                fullWidth
                                justify="space-between"
                                rightSection={<IconExternalLink size={16} />}
                            >
                                {link.label}
                            </Button>
                        ))}
                    </Stack>
                )}

                <Divider
                    my="xs"
                    label="AI-Tailored Outreach Messages"
                    labelPosition="center"
                />

                {coachError && (
                    <Alert color="red" title="Error Generating Messages">
                        {coachError}
                    </Alert>
                )}

                {isGeneratingCoach && (
                    <Paper p="md" withBorder bg="blue.0" radius="md">
                        <Group justify="space-between" mb="xs">
                            <Group gap="xs">
                                <Loader size="xs" />
                                <Text size="sm" fw={600}>
                                    Writing personalized outreach using your real project metrics...
                                </Text>
                            </Group>
                            <Badge color="blue">{coachElapsed}s</Badge>
                        </Group>
                        <Group gap={6}>
                            <IconAlertTriangle size={14} color="orange" />
                            <Text size="xs" c="dimmed">
                                Please do not refresh while generating so messages auto-save.
                            </Text>
                        </Group>
                    </Paper>
                )}

                {!outreachMessages && !isGeneratingCoach && (
                    <Paper p="md" withBorder bg="orange.0" radius="md">
                        <Group justify="space-between" wrap="nowrap">
                            <div>
                                <Text fw={600} size="sm">
                                    Want AI-Written Messages With Your Real Metrics?
                                </Text>
                                <Text size="xs" c="dimmed">
				    Generates 4 custom messages (&lt;280 chars) referencing your best
                                    projects AND generates your Candidate Fit & Interview Prep tab!
                                </Text>
                            </div>
                            <Button
                                size="sm"
                                leftSection={<IconSparkles size={16} />}
                                onClick={onGenerateCoach}
                            >
                                Generate with AI
                            </Button>
                        </Group>
                    </Paper>
                )}

                <Accordion variant="separated" defaultValue="manager">
                    {messages.map((msg) => (
                        <Accordion.Item key={msg.id} value={msg.id}>
                            <Accordion.Control>
                                <Group justify="space-between" pr="sm">
                                    <Text size="sm" fw={600}>
                                        {msg.title}
                                    </Text>
                                    <Badge
                                        size="xs"
                                        color={msg.badgeColor}
                                        variant="light"
                                    >
                                        {msg.badge} ({msg.text.length} chars)
                                    </Badge>
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Textarea
                                    name={`outreach-${msg.id}`}
                                    value={msg.text}
                                    autosize
                                    minRows={4}
                                    readOnly
                                />
                                <CopyButton value={msg.text} timeout={2000}>
                                    {({ copied, copy }) => (
                                        <Button
                                            color={copied ? 'teal' : 'blue'}
                                            variant={copied ? 'filled' : 'light'}
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
                                                ? 'Copied to Clipboard!'
                                                : 'Copy Message'}
                                        </Button>
                                    )}
                                </CopyButton>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Stack>
        </Paper>
    );
}
