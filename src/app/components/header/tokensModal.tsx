'use client';

import {
    Modal,
    Stack,
    Group,
    Text,
    Divider,
    Paper,
    Badge,
    Button,
    rem,
    Anchor,
} from '@mantine/core';
import {
    IconCoinFilled,
    IconSparkles,
    IconArrowRight,
    IconDiamond,
    IconCalendar,
    IconShoppingCart,
} from '@tabler/icons-react';
import Link from 'next/link';
import styles from './tokensModal.module.css';

// Define the shape of the subscription data the modal will receive
type SubscriptionTier = 'free' | 'monthly' | 'yearly';
export interface UserSubscription {
    tier: SubscriptionTier;
    tokensPerRefill: number;
    renewalDate: Date;
}

// Define the props for the component
interface TokensModalProps {
    opened: boolean;
    onClose: () => void;
    tokenCount: number;
    userSubscription: UserSubscription;
}

export default function TokensModal({
    opened,
    onClose,
    tokenCount,
    userSubscription,
}: TokensModalProps) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Token Balance & Plan"
            centered
            size="lg"
        >
            <Stack gap="lg">
                {/* Current Balance Section */}
                <Group justify="space-between">
                    <Text fw={500}>Your Current Balance:</Text>
                    <div
                        className={`${styles.tokenDisplay} ${styles.modalTokenDisplay}`}
                    >
                        <Text size="lg" className={styles.tokenValue}>
                            {tokenCount.toLocaleString()}
                        </Text>
                        <IconCoinFilled
                            style={{ width: rem(20), height: rem(20) }}
                            color="var(--mantine-color-yellow-5)"
                        />
                    </div>
                </Group>

                <Divider my="xs" label="Your Plan" labelPosition="center" />

                {/* Plan Details & Actions - Conditional Rendering */}
                {userSubscription.tier === 'free' && (
                    <Paper
                        withBorder
                        radius="md"
                        p="xl"
                        bg="var(--mantine-color-gray-0)"
                    >
                        <Stack align="center" gap="xs">
                            <IconSparkles
                                size={36}
                                color="var(--mantine-color-yellow-6)"
                            />
                            <Text fw={700} size="lg" mt="sm">
                                You're on the Free Tier
                            </Text>
                            <Text c="dimmed" size="sm" ta="center" maw={350}>
                                Upgrade for more monthly tokens, advanced AI
                                features, and priority support.
                            </Text>
                            <Button
                                component={Link}
                                href="/pricing"
                                onClick={onClose}
                                mt="md"
                                size="md"
                                variant="gradient"
                                gradient={{ from: 'blue', to: 'cyan' }}
                                rightSection={<IconArrowRight size={16} />}
                            >
                                View Plans & Upgrade
                            </Button>
                        </Stack>
                    </Paper>
                )}

                {(userSubscription.tier === 'monthly' ||
                    userSubscription.tier === 'yearly') && (
                    <Paper
                        withBorder
                        radius="md"
                        p="md"
                        bg="var(--mantine-color-gray-0)"
                    >
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Text fw={500}>Current Plan:</Text>
                                <Badge
                                    size="lg"
                                    variant="filled"
                                    color={
                                        userSubscription.tier === 'monthly'
                                            ? 'teal'
                                            : 'violet'
                                    }
                                    leftSection={<IconDiamond size={16} />}
                                >
                                    {userSubscription.tier === 'monthly'
                                        ? 'Monthly Pro'
                                        : 'Yearly Premium'}
                                </Badge>
                            </Group>
                            <Group justify="space-between">
                                <Text c="dimmed" size="sm">
                                    Next Refill:
                                </Text>
                                <Group gap="xs">
                                    <IconCalendar size={16} />
                                    <Text size="sm">
                                        +{userSubscription.tokensPerRefill}{' '}
                                        tokens on{' '}
                                        {userSubscription.renewalDate.toLocaleDateString(
                                            'en-US',
                                            { month: 'long', day: 'numeric' },
                                        )}
                                    </Text>
                                </Group>
                            </Group>
                            <Button
                                component={Link}
                                href="/billing"
                                onClick={onClose}
                                variant="light"
                                fullWidth
                                mt="sm"
                            >
                                Manage Subscription
                            </Button>
                        </Stack>
                    </Paper>
                )}

                {/* One-Time Purchase Section */}
                <Paper withBorder radius="md" p="md">
                    <Group justify="space-between" align="center">
                        <Stack gap={0}>
                            <Text fw={500}>Need a quick top-up?</Text>
                            <Text size="xs" c="dimmed">
                                Get more tokens instantly.
                            </Text>
                        </Stack>
                        <Button
                            component={Link}
                            href="/buy-tokens"
                            onClick={onClose}
                            variant="outline"
                            leftSection={<IconShoppingCart size={16} />}
                        >
                            Buy Token Packs
                        </Button>
                    </Group>
                </Paper>
            </Stack>
        </Modal>
    );
}
