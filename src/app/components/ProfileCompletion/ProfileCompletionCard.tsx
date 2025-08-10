import {
    Card,
    Text,
    Progress,
    Group,
    Button,
    ThemeIcon,
    Grid,
    Stack,
} from '@mantine/core';
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

    if (percentage === 100) {
        return (
            <Card withBorder radius="md" p="lg" className={styles.card}>
                {/* Header Section */}
                <Group>
                    <ThemeIcon
                        size="xl"
                        radius="md"
                        variant="light"
                        color="green"
                    >
                        <IconTargetArrow
                            style={{ width: '70%', height: '70%' }}
                        />
                    </ThemeIcon>
                    <div>
                        <Text fw={500}>Profile Complete!</Text>
                        <Text size="sm" c="dimmed">
                            Keep adding details to generate even better resumes.
                        </Text>
                    </div>
                </Group>
                <Grid mt="xl" align="center">
                    {/* Column 1: Percentage (takes only the space it needs) */}
                    <Grid.Col span="content">
                        <Stack align="center" gap={0}>
                            <Text size="xl" fw={700} c="green">
                                {percentage}%
                            </Text>
                            <Text size="sm" c="dimmed">
                                Complete
                            </Text>
                        </Stack>
                    </Grid.Col>

                    {/* Column 2: Reminder Text (takes the rest of the space) */}
                    <Grid.Col span="auto">
                        <Text c="dimmed" size="sm">
                            To generate stronger resumes, continue adding
                            detailed projects, experiences, and skills. The more
                            specific you are, the better your results will be.
                        </Text>
                    </Grid.Col>
                </Grid>

                {/* Footer Section (Optional, but good to keep) */}
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

    return (
        <Card withBorder radius="md" p="lg" className={styles.card}>
            {/* Header Section */}
            <Group wrap="nowrap" align="flex-start">
                <ThemeIcon size="xl" radius="md" variant="light">
                    <IconTargetArrow style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>

                {/* Use a Stack for the vertical text block */}
                <Stack gap={0}>
                    <Text fw={500}>Profile Completion</Text>
                    <Text size="sm" c="dimmed">
                        To create a great resume, complete your profile. The
                        more records and details you add, the better your resume
                        will be.
                    </Text>
                </Stack>
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
