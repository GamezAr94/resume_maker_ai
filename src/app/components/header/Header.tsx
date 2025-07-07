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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconCoinFilled,
    IconSearch,
    IconBriefcase,
    IconX,
} from '@tabler/icons-react';
import Link from 'next/link';
import styles from './header.module.css'; // Use the new styles
import { signOutAction } from '@/app/actions';
import TokensModal, { UserSubscription } from './tokensModal';
import { useState, useEffect, use } from 'react';
import { getCurrentUserProfile } from '@/app/db/user_queries';

type SubscriptionTier = 'free' | 'monthly' | 'yearly';

export default function Header() {
    // NOTE: This state is for toggling the mobile menu.
    // The logic to close it on navigation would be added later.
    const [opened, { toggle }] = useDisclosure(false);
    const [searchOpened, { toggle: toggleSearch }] = useDisclosure(false);
    const [modalOpened, { open: openModal, close: closeModal }] =
        useDisclosure(false);
    const [tokenCount, setTokenCount] = useState(0);

    // Fetch the token count when the component mounts
    useEffect(() => {
        const fetchTokenCount = async () => {
            const { data, status } = await getCurrentUserProfile();
            if (status && data && data.token_balance) {
                setTokenCount(data.token_balance);
            }
        };
        fetchTokenCount();
    }, []);

    // === MOCK DATA FOR USER SUBSCRIPTION ===
    // Change the 'tier' value here to 'free', 'monthly', or 'yearly' to test different views
    const userSubscription = {
        tier: 'free' as SubscriptionTier, // <--  TODO CHANGE THIS VALUE TO TEST
        tokensPerRefill: 500, // Example for 'monthly'
        renewalDate: new Date('2025-07-15T00:00:00Z'), // Example for 'monthly' or 'yearly'
    };

    return (
        <>
            <header className={styles.header}>
                <Container size="xxl" className={styles.inner}>
                    <Link
                        href="/"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Group className={styles.logoSection}>
                            <IconBriefcase
                                size={28}
                                color="var(--mantine-color-blue-5)"
                            />{' '}
                            {/* Your Logo */}
                            <Text className={styles.logoText}>
                                ResumeCraft AI
                            </Text>
                        </Group>
                    </Link>

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
                            <form action={signOutAction} style={{ margin: 0 }}>
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
                                action={signOutAction}
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
            <TokensModal
                opened={modalOpened}
                onClose={closeModal}
                tokenCount={tokenCount}
                userSubscription={
                    userSubscription as UserSubscription
                } /* Cast to UserSubscription type */
            />
        </>
    );
}
