import { Card, Text, Progress, Group, Button, ThemeIcon } from '@mantine/core';
import {
    IconTargetArrow,
    IconCheck,
    IconClock,
    IconChevronDown,
    IconSparkles,
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
}

export function ProfileCompletionCard({
    onCompleteProfileClick,
    percentage,
}: ProfileCompletionCardProps) {
    // Placeholder data based on your design
    const statusItems = [
        { icon: <IconCheck size={14} />, text: '4/4 Info', label: '✓' },
        { icon: <IconCheck size={14} />, text: '1/1 education', label: '✓' },
        { icon: <IconClock size={14} />, text: '1/2 experience', label: '🕓' },
        { icon: <IconClock size={14} />, text: '5/8 skills', label: '🕓' },
        { icon: <IconClock size={14} />, text: '1/2 projects', label: '🕓' },
    ];

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
                            Complete your profile to generate better tailored
                            resumes
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
                    Complete Profile
                </Button>
            </div>
        </Card>
    );
}
