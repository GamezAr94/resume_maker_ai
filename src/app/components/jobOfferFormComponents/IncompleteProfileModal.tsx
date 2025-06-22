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
import { PROFILE_COMPLETION_WEIGHTS } from '@/app/config/profile.config';

interface SectionCount {
    current: number;
    required: number;
    label: string;
    value: string;
}

interface IncompleteProfileModalProps {
    opened: boolean;
    onClose: () => void;
    onGenerate: () => void;
    onCompleteProfileClick: () => void;
    percentage: number;
    sectionCounts: Record<string, SectionCount>;
    status: 'disabled' | 'warn' | 'ready';
}

export function IncompleteProfileModal({
    opened,
    onClose,
    onGenerate,
    onCompleteProfileClick,
    percentage,
    sectionCounts,
    status,
}: IncompleteProfileModalProps) {
    const missingItems = Object.values(sectionCounts)
        .map((section) => {
            const missing = section.required - section.current;
            if (missing > 0) {
                if (
                    section.value === 'personal' ||
                    section.value === 'education'
                ) {
                    if (section.current < section.required) {
                        return (
                            <List.Item
                                key={section.label}
                            >{`Add ${section.label}`}</List.Item>
                        );
                    }
                } else {
                    const plural = missing > 1 ? 's' : '';
                    return (
                        <List.Item
                            key={section.label}
                        >{`${missing} more ${section.label}${plural}`}</List.Item>
                    );
                }
            }
            return null;
        })
        .filter(Boolean);

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
                Your profile is {Math.round(percentage)}% complete. For the best
                results, we recommend completing your profile first.
            </Text>

            {missingItems.length > 0 && (
                <Paper
                    withBorder
                    p="md"
                    radius="md"
                    className={styles.warningBox}
                    mb="lg"
                >
                    <Text fw={500}>Missing Information:</Text>
                    <List spacing="xs" size="sm" mt="xs" ml="xs">
                        {missingItems}
                    </List>
                </Paper>
            )}

            {/* Recommended Completion Section */}
            <Paper
                withBorder
                p="md"
                radius="md"
                className={styles.recommendationBox}
                mb="xl"
            >
                <Text fw={500}>
                    We recommend the following for a strong profile:
                </Text>
                <List spacing="xs" size="sm" mt="xs" ml="xs" c="dimmed">
                    <List.Item>
                        Complete personal information (name, email, phone,
                        LinkedIn)
                    </List.Item>
                    <List.Item>
                        At least{' '}
                        {
                            PROFILE_COMPLETION_WEIGHTS.MAX_EXPERIENCE_ENTRIES_FOR_SCORE
                        }{' '}
                        work experiences with very detailed descriptions
                    </List.Item>
                    <List.Item>
                        {PROFILE_COMPLETION_WEIGHTS.MAX_SKILLS_FOR_SCORE}{' '}
                        relevant skills for your target roles
                    </List.Item>
                    <List.Item>
                        {PROFILE_COMPLETION_WEIGHTS.MAX_PROJECTS_FOR_SCORE}{' '}
                        projects showcasing your abilities with very detailed
                        descriptions
                    </List.Item>
                    <List.Item>
                        {PROFILE_COMPLETION_WEIGHTS.MAX_EDUCATION_FOR_SCORE}{' '}
                        Educational background
                    </List.Item>
                </List>
            </Paper>

            <Group justify="flex-end">
                <Button
                    variant="default"
                    onClick={() => {
                        onClose();
                        onCompleteProfileClick();
                    }}
                    radius="md"
                >
                    Complete Profile First
                </Button>
                {status === 'disabled' ? (
                    ''
                ) : (
                    <Button
                        onClick={onGenerate}
                        className={styles.generateButton}
                        radius="md"
                    >
                        Generate Anyway
                    </Button>
                )}
            </Group>
        </Modal>
    );
}
