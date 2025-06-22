import {
    Modal,
    Text,
    Button,
    Group,
    List,
    Paper,
    Flex,
    Title,
    rem,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import styles from './IncompleteProfileModal.module.css';

interface IncompleteProfileModalProps {
    opened: boolean;
    onClose: () => void;
    onGenerate: () => void;
}

export function IncompleteProfileModal({
    opened,
    onClose,
    onGenerate,
}: IncompleteProfileModalProps) {
    const profileCompletion = 71;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Flex align="center" gap="xs">
                    <IconAlertTriangle
                        style={{ width: rem(24), height: rem(24) }}
                        color="var(--mantine-color-orange-6)"
                    />
                    <Title order={4}>Generate with Incomplete Profile?</Title>
                </Flex>
            }
            centered
            size="lg"
            radius="md"
        >
            <Text c="dimmed" size="sm" mb="lg">
                Your profile is {profileCompletion}% complete. For the best
                results, we recommend completing your profile first.
            </Text>

            {/* Missing Information Section */}
            <Paper
                withBorder
                p="md"
                radius="md"
                className={styles.warningBox}
                mb="lg"
            >
                <Text fw={500}>Missing Information:</Text>
                <List spacing="xs" size="sm" mt="xs" ml="xs">
                    <List.Item>1 more Work experiences</List.Item>
                    <List.Item>3 more Skills</List.Item>
                    <List.Item>1 more Projects</List.Item>
                </List>
            </Paper>

            {/* Recommended Completion Section */}
            <Paper
                withBorder
                p="md"
                radius="md"
                className={styles.recommendationBox}
                mb="xl"
            >
                <Text fw={500}>Recommended Complete Profile:</Text>
                <List spacing="xs" size="sm" mt="xs" ml="xs" c="dimmed">
                    <List.Item>
                        Complete personal information (name, email, phone,
                        LinkedIn)
                    </List.Item>
                    <List.Item>
                        At least 2 work experiences with detailed descriptions
                    </List.Item>
                    <List.Item>
                        8+ relevant skills for your target roles
                    </List.Item>
                    <List.Item>2+ projects showcasing your abilities</List.Item>
                    <List.Item>Educational background</List.Item>
                </List>
            </Paper>

            <Group justify="flex-end">
                <Button variant="default" onClick={onClose} radius="md">
                    Complete Profile First
                </Button>
                <Button
                    onClick={onGenerate}
                    className={styles.generateButton}
                    radius="md"
                >
                    Generate Anyway
                </Button>
            </Group>
        </Modal>
    );
}
