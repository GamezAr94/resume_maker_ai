import { Card, Text, Progress, Group, Button, ThemeIcon } from '@mantine/core';
import {
    IconTargetArrow,
    IconCheck,
    IconClock,
    IconChevronDown,
    IconAsterisk,
} from '@tabler/icons-react';
import styles from './ProfileCompletionCard.module.css';

// This is a placeholder for the component we planned in the first step.
// We will build this next.
const StatusItem = ({
    icon,
    text,
    label,
}: {
    icon: React.ReactNode;
    text: string;
    label: string;
}) => (
    <Group gap="xs" align="center">
        <ThemeIcon
            variant="light"
            radius="xl"
            size="sm"
            color={label.startsWith('✓') ? 'green' : 'gray'}
        >
            {icon}
        </ThemeIcon>
        <Text size="sm" c="dimmed">
            {text}
        </Text>
    </Group>
);

interface ProfileCompletionCardProps {
    onCompleteProfileClick: () => void;
    percentage: number;
    sectionCounts: {
        [key: string]: {
            current: number;
            required: number;
            label: string;
            value: string;
        };
    };
}

export function ProfileCompletionCard({
    onCompleteProfileClick,
    percentage,
    sectionCounts,
}: ProfileCompletionCardProps) {
    const statusItems = Object.values(sectionCounts).map(
        ({ current, required, label }) => {
            const isComplete = current >= required;
            const displayLabel = label === 'Personal Info' ? 'Info' : label;
            return {
                icon: isComplete ? (
                    <IconCheck size={14} />
                ) : (
                    <IconClock size={14} />
                ),
                text:
                    required <= current
                        ? `${displayLabel}`
                        : `${current}/${required} ${displayLabel}`,
                label: isComplete ? '✓' : '🕓',
            };
        },
    );

    return (
        <Card withBorder radius="md" p="lg" className={styles.card}>
            {/* Header Section */}
            <Group justify="space-between">
                <Group>
                    <ThemeIcon size="xl" radius="md" variant="light">
                        <IconTargetArrow
                            style={{ width: '70%', height: '70%' }}
                        />
                    </ThemeIcon>
                    <div>
                        <Text fw={500}>Profile Completion</Text>
                        <Text size="sm" c="dimmed">
                            To create a great resume, complete your profile. The
                            more records and details you add, the better your
                            resume will be.
                        </Text>
                    </div>
                </Group>
                <div className={styles.percentage}>
                    <Text size="xl" fw={700} c="orange">
                        {percentage}%
                    </Text>
                    <Text size="sm" c="dimmed">
                        Complete
                    </Text>
                </div>
            </Group>

            {/* Progress Bar Section */}
            <Progress value={percentage} mt="lg" size="lg" radius="xl" />

            {/* Status Details Section */}
            <div className={styles.statusWrapper}>
                {statusItems.map((item, index) => (
                    <StatusItem
                        key={index}
                        icon={item.icon}
                        text={item.text}
                        label={item.label}
                    />
                ))}
            </div>

            {/* Footer Section */}
            <div className={styles.footer}>
                <Group gap="xs">
                    <IconAsterisk
                        size={12}
                        color="var(--mantine-color-blue-6)"
                    />
                    <Text size="sm" c="blue" fw={500}>
                        Add more details to improve your resume quality
                    </Text>
                </Group>
                <Button
                    onClick={onCompleteProfileClick}
                    rightSection={<IconChevronDown size={16} />}
                    variant="default"
                >
                    Add More
                </Button>
            </div>
        </Card>
    );
}
