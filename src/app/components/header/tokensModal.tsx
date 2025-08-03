'use client';

import {
    Modal,
    Stack,
    Group,
    Text,
    Paper,
    Badge,
    Button,
    rem,
    Tabs,
    Alert,
    List,
    ThemeIcon,
    SegmentedControl,
    Box,
    Divider,
    NavLink,
} from '@mantine/core';
import {
    IconCoinFilled,
    IconCrown,
    IconBolt,
    IconInfoCircle,
    IconCheck,
    IconCalendar,
    IconDiamond,
    IconSettings,
} from '@tabler/icons-react';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import styles from './tokensModal.module.css';
import {
    TokenPack,
    SubscriptionTier,
    SubscriptionPlan,
    UserSubscription,
} from '@/utils/interfaces';
import { TOKEN_COSTS } from '@/app/config/costs.config';
import Link from 'next/link';

// --- Types and Data Structures ---

// Props for the modal component
interface TokensModalProps {
    opened: boolean;
    onClose: () => void;
    tokenCount: number;
    userSubscription: UserSubscription;
}

// --- Configuration & Mock Data ---

// Replace these with your actual Stripe Price IDs
const tokenPacks: TokenPack[] = [
    TOKEN_COSTS.TOKEN_PACKAGES.BASIC,
    TOKEN_COSTS.TOKEN_PACKAGES.PREMIUM,
    TOKEN_COSTS.TOKEN_PACKAGES.ULTIMATE,
];

const subscriptionPlans: SubscriptionPlan[] = [
    TOKEN_COSTS.TOKEN_PLANS.MONTHLY,
    TOKEN_COSTS.TOKEN_PLANS.YEARLY,
];

// Initialize Stripe outside of the component render
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

// --- THE MODAL COMPONENT ---
export default function TokensModal({
    opened,
    onClose,
    tokenCount,
    userSubscription,
}: TokensModalProps) {
    const [balanceVisible, setBalanceVisible] = useState(true);

    const handleManageBilling = async () => {
        try {
            // Call your new API route
            const response = await fetch('/api/stripe/create-portal-link', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to create portal link.');
            }

            const { url } = await response.json();

            // Redirect the user to the Stripe Customer Portal
            window.location.href = url;
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdatePlan = async () => {
        try {
            const response = await fetch('/api/stripe/create-portal-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // ✅ This is the key part: tell the server which flow to start
                body: JSON.stringify({ flowType: 'subscription_update' }),
            });

            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(
                    error.message || 'Failed to create portal link.',
                );
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error(error);
            alert((error as Error).message);
        }
    };

    // This is your checkout logic, it remains the same.
    const handlePurchase = async (productId: string) => {
        try {
            const stripe = await stripePromise;
            if (!stripe) throw new Error('Stripe.js has not loaded yet.');
            const res = await fetch('/api/stripe/checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: productId }),
            });
            if (!res.ok) {
                console.error('Server returned an error:', await res.text());
                return;
            }
            const { sessionId } = await res.json();
            const { error } = await stripe.redirectToCheckout({ sessionId });
            if (error) console.error('Stripe redirect error:', error.message);
        } catch (error) {
            console.error('Purchase error:', (error as Error).message);
        }
    };

    // --- RENDER METHOD FOR QUICK TOP-UP TAB ---
    const renderQuickTopUp = () => {
        // Get the discount percentage based on the user's current subscription tier.
        const discount = TOKEN_COSTS.DISCOUNTED_PACKAGES[userSubscription.tier];

        return (
            <Stack gap="md" mt="md">
                <Stack gap={4} align="center">
                    <Text size="xl" fw={700}>
                        Buy Token Packs
                    </Text>
                    <Text c="dimmed" size="sm">
                        Get tokens instantly
                        {/* Show this message only if a discount is applied */}
                        {discount > 0 && (
                            <span className={styles.discountAppliedText}>
                                {' '}
                                • Subscriber discount applied
                            </span>
                        )}
                    </Text>
                </Stack>

                {tokenPacks.map((pack) => {
                    // Calculate the discounted price.
                    const discountedPrice = pack.price * (1 - discount);

                    return (
                        <div key={pack.id} className={styles.popularWrapper}>
                            {pack.isPopular && (
                                <Badge
                                    className={styles.popularBadge}
                                    color="blue"
                                    variant="filled"
                                >
                                    Most Popular
                                </Badge>
                            )}
                            <Paper
                                withBorder
                                radius="md"
                                p="md"
                                className={styles.tokenPackItem}
                                data-popular={pack.isPopular}
                            >
                                <Group justify="space-between">
                                    <Group>
                                        <IconCoinFilled
                                            style={{
                                                width: rem(24),
                                                height: rem(24),
                                            }}
                                            color="var(--mantine-color-yellow-5)"
                                        />
                                        <Text fw={600} size="lg">
                                            {pack.tokens.toLocaleString()}{' '}
                                            tokens
                                        </Text>
                                        {/* Show the discount badge if the discount is greater than 0 */}
                                        {discount > 0 && (
                                            <Badge color="teal" variant="light">
                                                {discount * 100}% off
                                            </Badge>
                                        )}
                                    </Group>
                                    <Group>
                                        <Stack gap={0} align="flex-end">
                                            <Text fw={700} size="lg">
                                                ${discountedPrice.toFixed(2)}
                                            </Text>
                                            {/* Show the original price (struck-through) if there's a discount */}
                                            {discount > 0 && (
                                                <Text
                                                    size="sm"
                                                    c="dimmed"
                                                    td="line-through"
                                                    className={
                                                        styles.originalPrice
                                                    }
                                                >
                                                    ${pack.price.toFixed(2)}
                                                </Text>
                                            )}
                                        </Stack>
                                        <Button
                                            onClick={() =>
                                                handlePurchase(pack.id)
                                            }
                                            variant="filled"
                                            color="dark"
                                        >
                                            Buy Now
                                        </Button>
                                    </Group>
                                </Group>
                            </Paper>
                        </div>
                    );
                })}
            </Stack>
        );
    };

    // --- RENDER METHOD FOR UPGRADE PLAN TAB ---
    const renderUpgradePlan = () => (
        <Stack gap="lg" mt="md">
            <Stack gap={4} align="center">
                <Text size="xl" fw={700}>
                    Upgrade Your Plan
                </Text>
                <Text c="dimmed" size="sm">
                    Get more tokens monthly + discounted top-ups
                </Text>
            </Stack>
            {subscriptionPlans.map((plan) => {
                // Check if the plan being rendered is the user's currently active plan.
                const isCurrentPlan =
                    userSubscription.tier === plan.tierIdentifier;

                // If the user is on the Yearly plan, they can't upgrade to Monthly.
                if (
                    userSubscription.tier === 'yearly' &&
                    plan.tierIdentifier === 'monthly'
                ) {
                    return <></>;
                }

                return (
                    <div key={plan.id} className={styles.popularWrapper}>
                        {plan.isPopular && !isCurrentPlan && (
                            <Badge
                                className={styles.popularBadge}
                                color="blue"
                                variant="filled"
                            >
                                Most Popular
                            </Badge>
                        )}
                        {/* If this is the current plan, show a different badge */}
                        {isCurrentPlan && (
                            <Badge
                                className={styles.popularBadge}
                                color="teal"
                                variant="filled"
                                leftSection={<IconCheck size={14} />}
                            >
                                Current Plan
                            </Badge>
                        )}
                        <Paper
                            withBorder
                            radius="md"
                            p="xl"
                            className={styles.planCard}
                            data-popular={plan.isPopular && !isCurrentPlan}
                        >
                            <Stack gap="lg">
                                <Group
                                    justify="space-between"
                                    align="flex-start"
                                >
                                    <div>
                                        <Text size="xl" fw={700}>
                                            {plan.name}
                                        </Text>
                                        <Group gap="xs" align="baseline">
                                            <Text
                                                className={styles.price}
                                                component="span"
                                            >
                                                ${plan.price.toFixed(2)}
                                            </Text>
                                            <Text
                                                c="dimmed"
                                                size="sm"
                                                component="span"
                                            >
                                                {plan.priceAnnotation}
                                            </Text>
                                            {plan.discountBadge && (
                                                <Badge
                                                    color="teal"
                                                    variant="light"
                                                    className={
                                                        styles.discountBadge
                                                    }
                                                >
                                                    {plan.discountBadge}
                                                </Badge>
                                            )}
                                        </Group>
                                    </div>
                                    {/* Show the Upgrade button ONLY if it's not the current plan */}
                                    {!isCurrentPlan && (
                                        <Button
                                            onClick={() =>
                                                userSubscription.tier === 'free'
                                                    ? handlePurchase(plan.id)
                                                    : handleUpdatePlan()
                                            }
                                            variant="filled"
                                            color="dark"
                                            size="sm"
                                        >
                                            Upgrade
                                        </Button>
                                    )}
                                </Group>

                                <List
                                    spacing="xs"
                                    size="sm"
                                    center
                                    icon={
                                        <ThemeIcon
                                            color="teal"
                                            size={24}
                                            radius="xl"
                                        >
                                            <IconCheck
                                                style={{
                                                    width: rem(16),
                                                    height: rem(16),
                                                }}
                                            />
                                        </ThemeIcon>
                                    }
                                    className={styles.featureList}
                                >
                                    {plan.features.map((feature) => (
                                        <List.Item key={feature}>
                                            {feature}
                                        </List.Item>
                                    ))}
                                </List>

                                {/* If this is the active plan, show renewal info instead of the upgrade button */}
                                {isCurrentPlan && (
                                    <Alert
                                        variant="light"
                                        color="gray"
                                        title="Plan Renewal"
                                        icon={<IconCalendar />}
                                        mt="md"
                                    >
                                        You will receive +
                                        {userSubscription.tokensPerRefill?.toLocaleString()}{' '}
                                        tokens when your subscription renews.
                                        <>
                                            <Divider
                                                my="md"
                                                label="Account Management"
                                                labelPosition="center"
                                            />
                                            <Button
                                                fullWidth
                                                variant="light"
                                                color="gray"
                                                leftSection={
                                                    <IconSettings size={16} />
                                                }
                                                onClick={handleManageBilling}
                                            >
                                                Manage subscription & billing
                                                details
                                            </Button>
                                        </>
                                    </Alert>
                                )}
                            </Stack>
                        </Paper>
                    </div>
                );
            })}
        </Stack>
    );

    // --- MAIN MODAL RENDER ---
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Text fw={700} size="xl">
                    Token Balance & Plans
                </Text>
            }
            centered
            size="lg"
            radius="md"
            padding="xl"
            classNames={{ header: styles.modalHeader, body: styles.modalBody }}
        >
            <Stack gap="lg">
                {balanceVisible && (
                    <Alert
                        variant="light"
                        color="gray"
                        withCloseButton
                        onClose={() => setBalanceVisible(false)}
                        styles={{ title: { flex: 1 }, body: { width: '100%' } }}
                        icon={<span />}
                        title={
                            <Group justify="space-between">
                                <Group gap="xs">
                                    <IconCoinFilled
                                        color="var(--mantine-color-yellow-6)"
                                        size={20}
                                    />
                                    <Text fw={500}>
                                        Current Balance:{' '}
                                        {tokenCount.toLocaleString()} tokens
                                    </Text>
                                </Group>
                                {userSubscription.tier !== 'free' && (
                                    <Badge
                                        color="teal"
                                        variant="light"
                                        leftSection={<IconDiamond size={14} />}
                                    >
                                        {userSubscription.tier
                                            .charAt(0)
                                            .toUpperCase() +
                                            userSubscription.tier.slice(1)}{' '}
                                        Pro
                                    </Badge>
                                )}
                            </Group>
                        }
                    />
                )}

                <Tabs
                    defaultValue="top-up"
                    variant="pills"
                    radius="md"
                    classNames={{ list: styles.tabsList, tab: styles.tab }}
                >
                    <Tabs.List grow>
                        <Tabs.Tab
                            value="top-up"
                            leftSection={<IconBolt size={16} />}
                        >
                            Quick Top-up
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="upgrade"
                            leftSection={<IconCrown size={16} />}
                        >
                            Upgrade Plan
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="top-up">{renderQuickTopUp()}</Tabs.Panel>
                    <Tabs.Panel value="upgrade">
                        {renderUpgradePlan()}
                    </Tabs.Panel>
                </Tabs>
                {userSubscription.tier === 'free' && (
                    <Alert
                        variant="light"
                        color="blue"
                        title="Pro Tip"
                        icon={<IconInfoCircle />}
                    >
                        Subscribe to get up to{' '}
                        {TOKEN_COSTS.DISCOUNTED_PACKAGES.yearly * 100}% off all
                        token purchases + a recurring token allowance.
                    </Alert>
                )}
                {userSubscription.tier === 'monthly' && (
                    <Alert
                        variant="light"
                        color="blue"
                        title="Pro Tip"
                        icon={<IconInfoCircle />}
                    >
                        Subscribe to the Yearly plan and get{' '}
                        {TOKEN_COSTS.DISCOUNTED_PACKAGES.yearly * 100}% off all
                        token purchases + a yearly token allowance.
                    </Alert>
                )}
            </Stack>
        </Modal>
    );
}
