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
import TokensModal from './tokensModal';
import { useState, useEffect } from 'react';
import { getCurrentUserProfile } from '@/app/db/user_queries';
import { SubscriptionTier, UserSubscription } from '@/utils/interfaces';
import { TOKEN_COSTS } from '@/app/config/costs.config';

export default function Header() {
    // NOTE: This state is for toggling the mobile menu.
    // The logic to close it on navigation would be added later.
    const [opened, { toggle }] = useDisclosure(false);
    const [searchOpened, { toggle: toggleSearch }] = useDisclosure(false);
    const [modalOpened, { open: openModal, close: closeModal }] =
        useDisclosure(false);
    const [tokenCount, setTokenCount] = useState(0);

    // This state now holds the complete user subscription object.
    const [userSubscription, setUserSubscription] = useState<UserSubscription>({
        tier: 'free' as SubscriptionTier, // Default to 'free'
    });

    const handleManageBilling = async () => {
        try {
            // Call your API route with the required headers and body
            const response = await fetch('/api/stripe/create-portal-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Add an empty JSON object to the body. This is crucial.
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                // Try to get a more specific error message from the server response
                const errorData = await response.json();
                throw new Error(
                    errorData.error || 'Failed to create portal link.',
                );
            }

            const { url } = await response.json();

            // Redirect the user to the Stripe Customer Portal
            window.location.href = url;
        } catch (error) {
            console.error('Error managing billing:', error);
            // TODO: Optionally show an error message to the user in the UI
        }
    };

    // Function to easily change the subscription tier
    const handleSubscriptionChange = (tier: SubscriptionTier) => {
        if (tier === 'free') {
            setUserSubscription({ tier: 'free' });
        } else if (tier === 'monthly') {
            setUserSubscription({
                tier: 'monthly',
                tokensPerRefill: TOKEN_COSTS.TOKEN_PLANS.MONTHLY.tokens,
            });
        } else if (tier === 'yearly') {
            setUserSubscription({
                tier: 'yearly',
                tokensPerRefill: TOKEN_COSTS.TOKEN_PLANS.YEARLY.tokens,
            });
        }
    };

    // Fetch the token count when the component mounts
    useEffect(() => {
        const fetchTokenCount = async () => {
            const { data, status } = await getCurrentUserProfile();
            if (status && data && data.token_balance) {
                setTokenCount(data.token_balance);
                handleSubscriptionChange(
                    data.subscription_tier as SubscriptionTier,
                );
            }
        };
        fetchTokenCount();
    }, []);

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
                            <Text className={styles.logoText}>Fazume</Text>
                        </Group>
                    </Link>

                    {/* This Group will be hidden on mobile by the CSS media query */}
                    <Group className={styles.mainNav}>
                        {/* This is the new conditional search bar section */}
                        {/* TODO THIS IS THE SEARCH BAR it is a feature for future
                        searchOpened ? (
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
                        )*/}

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
                            {/*

                            <Anchor
                                component={Link}
                                href="/dashboard"
                                className={styles.navLink}
                            >
                                Dashboard
                            </Anchor>
                                */}
                            <Anchor
                                component={Link}
                                href="/applications"
                                className={styles.navLink}
                            >
                                My Applications
                            </Anchor>
                            <Anchor
                                variant="transparent"
                                onClick={handleManageBilling}
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
                            {/*
                            <Anchor
                                component={Link}
                                href="/dashboard"
                                className={styles.mobileNavLink}
                                onClick={toggle} 
                            >
                                Dashboard
                            </Anchor>
                            */}
                            <Anchor
                                component={Link}
                                href="/applications"
                                className={styles.mobileNavLink}
                                onClick={toggle} /* Close drawer on click */
                            >
                                My Applications
                            </Anchor>
                            <Anchor
                                variant="transparent"
                                onClick={() => {
                                    handleManageBilling();
                                    toggle();
                                }}
                                className={styles.mobileNavLink}
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
