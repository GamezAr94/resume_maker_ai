/* === NEW and IMPROVED header.tsx === */
'use client';

import {
    Container,
    Group,
    Button,
    Text,
    ActionIcon,
    Burger,
    Drawer,
    Stack,
    rem,
    Anchor,
    TextInput,
    Modal,
    Paper,
    Divider,
    Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconCoinFilled,
    IconSearch,
    IconBriefcase,
    IconX,
    IconSparkles,
    IconArrowRight,
    IconDiamond,
    IconCalendar,
    IconShoppingCart,
} from '@tabler/icons-react';
import Link from 'next/link';
import styles from './header.module.css'; // Use the new styles

type SubscriptionTier = 'free' | 'monthly' | 'yearly';

export default function Header() {
    // NOTE: This state is for toggling the mobile menu.
    // The logic to close it on navigation would be added later.
    const [opened, { toggle }] = useDisclosure(false);
    const [searchOpened, { toggle: toggleSearch }] = useDisclosure(false);
    const [modalOpened, { open: openModal, close: closeModal }] =
        useDisclosure(false);

    // === MOCK DATA FOR USER SUBSCRIPTION ===
    // Change the 'tier' value here to 'free', 'monthly', or 'yearly' to test different views
    const userSubscription = {
        tier: 'yearly' as SubscriptionTier, // <--  TODO CHANGE THIS VALUE TO TEST
        tokensPerRefill: 500, // Example for 'monthly'
        renewalDate: new Date('2025-07-15T00:00:00Z'), // Example for 'monthly' or 'yearly'
    };
    // NOTE: This would come from user data later.
    const tokenCount = 1000;

    return (
        <>
            <header className={styles.header}>
                <Container size="xxl" className={styles.inner}>
                    <Group className={styles.logoSection}>
                        <IconBriefcase
                            size={28}
                            color="var(--mantine-color-blue-5)"
                        />{' '}
                        {/* Your Logo */}
                        <Text className={styles.logoText}>ResumeCraft AI</Text>
                    </Group>

                    {/* This Group will be hidden on mobile by the CSS media query */}
                    <Group className={styles.mainNav}>
                        {/* This is the new conditional search bar section */}
                        {searchOpened ? (
                            <Group gap="xs">
                                <TextInput
                                    placeholder="Search company (e.g., Innovate Hub)"
                                    className={styles.searchInput}
                                />
                                <Button>Search</Button>
                                <ActionIcon
                                    variant="transparent"
                                    c="gray.4"
                                    title="Close search"
                                    onClick={toggleSearch}
                                >
                                    <IconX
                                        style={{
                                            width: rem(18),
                                            height: rem(18),
                                        }}
                                    />
                                </ActionIcon>
                            </Group>
                        ) : (
                            <ActionIcon
                                variant="transparent"
                                c="gray.4"
                                title="Search"
                                onClick={toggleSearch}
                            >
                                <IconSearch
                                    style={{ width: rem(18), height: rem(18) }}
                                />
                            </ActionIcon>
                        )}

                        <div
                            className={styles.tokenDisplay}
                            onClick={openModal}
                        >
                            <Text size="sm">Tokens:</Text>
                            <Text size="sm" className={styles.tokenValue}>
                                {tokenCount}
                            </Text>
                            <IconCoinFilled
                                style={{ width: rem(16), height: rem(16) }}
                                color="var(--mantine-color-yellow-5)"
                            />
                        </div>

                        <Group gap="xl">
                            <Anchor
                                component={Link}
                                href="/dashboard"
                                className={styles.navLink}
                            >
                                Dashboard
                            </Anchor>
                            <Anchor
                                component={Link}
                                href="/my-applications"
                                className={styles.navLink}
                            >
                                My Applications
                            </Anchor>
                            <Anchor
                                component={Link}
                                href="/settings"
                                className={styles.navLink}
                            >
                                Settings
                            </Anchor>
                            <form
                                action="/auth/sign-out"
                                method="post"
                                style={{ margin: 0 }}
                            >
                                <Button
                                    type="submit"
                                    variant="transparent"
                                    classNames={{
                                        root: styles.navLink,
                                    }} /* Apply navLink styles to the button */
                                >
                                    Logout
                                </Button>
                            </form>
                        </Group>
                    </Group>
                    <Group className={styles.hamburger}>
                        {/* This is the token display, now outside the mainNav group */}
                        <div
                            className={styles.tokenDisplay}
                            onClick={openModal}
                        >
                            <Text size="sm">Tokens:</Text>
                            <Text size="sm" className={styles.tokenValue}>
                                {tokenCount}
                            </Text>
                            <IconCoinFilled
                                style={{ width: rem(16), height: rem(16) }}
                                color="var(--mantine-color-yellow-5)"
                            />
                        </div>

                        {/* Mobile Hamburger Menu */}
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            color="white"
                            size="sm"
                            aria-label="Toggle navigation" /* Accessibility improvement */
                        />
                    </Group>

                    {/* Mobile Drawer Menu */}
                    <Drawer
                        opened={opened}
                        onClose={toggle}
                        position="right"
                        size="100%"
                        padding="md"
                        title={
                            <Text fw={700} size="lg">
                                Menu
                            </Text>
                        }
                        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
                        zIndex={
                            2000
                        } /* Ensure drawer is on top of the fixed header */
                    >
                        <Stack gap="lg" mt="md">
                            <Anchor
                                component={Link}
                                href="/dashboard"
                                className={styles.mobileNavLink}
                                onClick={toggle} /* Close drawer on click */
                            >
                                Dashboard
                            </Anchor>
                            <Anchor
                                component={Link}
                                href="/my-applications"
                                className={styles.mobileNavLink}
                                onClick={toggle} /* Close drawer on click */
                            >
                                My Applications
                            </Anchor>
                            <Anchor
                                component={Link}
                                href="/settings"
                                className={styles.mobileNavLink}
                                onClick={toggle} /* Close drawer on click */
                            >
                                Settings
                            </Anchor>

                            {/* Logout button at the bottom of the drawer */}
                            <form
                                action="/auth/sign-out"
                                method="post"
                                style={{ marginTop: 'auto' }}
                            >
                                <Button
                                    type="submit"
                                    variant="default"
                                    fullWidth
                                >
                                    Logout
                                </Button>
                            </form>
                        </Stack>
                    </Drawer>
                </Container>
            </header>
            <Modal
                opened={modalOpened}
                onClose={closeModal}
                title="Token Balance & Plan"
                centered
                size="lg"
            >
                <Stack gap="lg">
                    {/* Current Balance Section - Same for all tiers */}
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

                    <Divider my="sm" />

                    {/* Plan Details & Actions - This part is conditional */}
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
                                <Text
                                    c="dimmed"
                                    size="sm"
                                    ta="center"
                                    maw={350}
                                >
                                    Upgrade for more monthly tokens, advanced AI
                                    features, and priority support.
                                </Text>
                                <Button
                                    component={Link}
                                    href="/pricing"
                                    onClick={closeModal}
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
                                                {
                                                    month: 'long',
                                                    day: 'numeric',
                                                },
                                            )}
                                        </Text>
                                    </Group>
                                </Group>
                                <Button
                                    component={Link}
                                    href="/billing"
                                    onClick={closeModal}
                                    variant="light"
                                    fullWidth
                                    mt="sm"
                                >
                                    Manage Subscription
                                </Button>
                            </Stack>
                        </Paper>
                    )}

                    {/* One-Time Purchase Section - Same for all tiers */}
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
                                onClick={closeModal}
                                variant="outline"
                                leftSection={<IconShoppingCart size={16} />}
                            >
                                Buy Token Packs
                            </Button>
                        </Group>
                    </Paper>
                </Stack>
            </Modal>
        </>
    );
}
