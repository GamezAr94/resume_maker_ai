'use client';

import { useState, useEffect } from 'react';
import {
    Modal,
    Stack,
    Select,
    Textarea,
    Button,
    Group,
    Text,
    TextInput,
} from '@mantine/core';
import { IconSend, IconMessageChatbot } from '@tabler/icons-react';
import styles from './FeedbackModal.module.css';
import { notifications } from '@mantine/notifications';

interface FeedbackModalProps {
    opened: boolean;
    onClose: () => void;
    userEmail: string;
}

export default function FeedbackModal({
    opened,
    onClose,
    userEmail,
}: FeedbackModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    // --- State management with useState ---
    const [feedbackType, setFeedbackType] = useState<string | null>(null);
    const [email, setEmail] = useState(userEmail);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Update the email field if the userEmail prop changes
    useEffect(() => {
        setEmail(userEmail);
    }, [userEmail]);

    const handleClose = () => {
        // Reset state when closing the modal
        setFeedbackType(null);
        setMessage('');
        setError('');
        setEmail(userEmail);
        onClose();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission
        setError(''); // Clear previous errors

        // --- Manual Validation ---
        if (!feedbackType) {
            setError('Please select a feedback type.');
            return;
        }
        if (message.length < 10) {
            setError('Feedback must be at least 10 characters long.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/send-general-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feedbackType: feedbackType,
                    message: message,
                    userEmail: email,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to send feedback.');
            }

            notifications.show({
                title: 'Feedback Sent!',
                message: 'Thank you for helping us improve.',
                color: 'teal',
            });

            handleClose(); // Close and reset the modal on success
        } catch (err) {
            notifications.show({
                title: 'Error',
                message: (err as Error).message,
                color: 'red',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={
                <div className={styles.header}>
                    <IconMessageChatbot size={20} />
                    <Text fw={600}>Share Your Feedback</Text>
                </div>
            }
            centered
            size="md"
            radius="md"
            classNames={{ header: styles.headerContainer }}
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                    <Text size="sm" c="dimmed">
                        Help us improve by sharing your thoughts, suggestions,
                        or reporting any issues.
                    </Text>

                    <Select
                        label="What type of feedback is this?"
                        placeholder="Select feedback type"
                        data={[
                            { value: 'Bug Report', label: 'Bug Report' },
                            {
                                value: 'Feature Request',
                                label: 'Feature Request',
                            },
                            {
                                value: 'Improvement Suggestion',
                                label: 'Improvement Suggestion',
                            },
                            {
                                value: 'General Feedback',
                                label: 'General Feedback',
                            },
                            { value: 'Other', label: 'Other' },
                        ]}
                        required
                        value={feedbackType}
                        onChange={setFeedbackType}
                        error={error.includes('type') ? error : undefined}
                    />

                    <TextInput
                        label="Contact Email (optional)"
                        placeholder="your@email.com"
                        description="Defaults to your account email. Change if you want a follow-up elsewhere."
                        value={email}
                        onChange={(event) =>
                            setEmail(event.currentTarget.value)
                        }
                    />

                    <Textarea
                        label="Your feedback"
                        placeholder="Tell us what's on your mind..."
                        autosize
                        minRows={4}
                        required
                        value={message}
                        onChange={(event) =>
                            setMessage(event.currentTarget.value)
                        }
                        error={
                            error.includes('Feedback must be')
                                ? error
                                : undefined
                        }
                    />

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="default"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            leftSection={<IconSend size={16} />}
                            loading={isSubmitting}
                        >
                            Send Feedback
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
