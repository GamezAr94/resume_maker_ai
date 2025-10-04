/* === NEW and IMPROVED header.tsx === */
'use client';

import {
    Container,
    Group,
    Button,
    Text,
    //ActionIcon,
    Burger,
    Drawer,
    Stack,
    rem,
    Anchor,
    //TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconCoinFilled,
    IconMessageCircle,
    //IconSearch,
    //IconX,
} from '@tabler/icons-react';
import Link from 'next/link';
import styles from './header.module.css'; // Use the new styles
import { signOutAction } from '@/app/actions';
import TokensModal from './tokensModal';
import { useState, useEffect } from 'react';
import { SubscriptionTier, UserSubscription } from '@/utils/interfaces';
import { TOKEN_COSTS } from '@/app/config/costs.config';
import FeedbackModal from '../Feedback/FeedbackModal';

export default function Header() {
    // NOTE: This state is for toggling the mobile menu.
    // The logic to close it on navigation would be added later.
    const [opened, { toggle }] = useDisclosure(false);
    // TODO this is for the search bar in the header maybe we should move it to its own component
    //const [searchOpened, { toggle: toggleSearch }] = useDisclosure(false);
    const [modalOpened, { open: openModal, close: closeModal }] =
        useDisclosure(false);
    const [
        feedbackModalOpened,
        { open: openFeedbackModal, close: closeFeedbackModal },
    ] = useDisclosure(false);

    const [tokenCount, setTokenCount] = useState(0);
    const [userEmail, setUserEmail] = useState('');

    // This state now holds the complete user subscription object.
    const [userSubscription, setUserSubscription] = useState<UserSubscription>({
        tier: 'free' as SubscriptionTier, // Default to 'free'
    });

    /*
    TODO: enable this function when we enable the settings page in the header to let the users manage their payments, this is for the beta users
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
    */

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
        const fetchUserData = async () => {
            try {
                // Replace the old client-side call...
                // const { data, status } = await getCurrentUserProfile();

                // ...with the new server-side API call.
                const response = await fetch('/api/profile');

                if (!response.ok) {
                    // If the server returns an error, we can't get user data
                    console.error('Failed to fetch user profile.');
                    return;
                }

                const data = await response.json();

                // The rest of the logic remains the same
                if (data) {
                    if (data.token_balance) {
                        setTokenCount(data.token_balance);
                    }
                    if (data.email) {
                        setUserEmail(data.email);
                    }
                    handleSubscriptionChange(
                        data.subscription_tier as SubscriptionTier,
                    );
                }
            } catch (error) {
                console.error(
                    'An error occurred while fetching user data:',
                    error,
                );
            }
        };
        fetchUserData();
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
                            {/* TODO Your Logo */}
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

                            <Button
                                variant="default"
                                size="xs"
                                leftSection={<IconMessageCircle size={16} />}
                                onClick={openFeedbackModal}
                            >
                                Feedback
                            </Button>

                            {/*
                                TODO: Enable the settings again to allow the users to manage their payment methods, this is temporary for the beta users only
                            <Anchor
                                variant="transparent"
                                onClick={handleManageBilling}
                                className={styles.navLink}
                            >
                                Settings
                            </Anchor>
                                */}
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

                            <Button
                                variant="default"
                                fullWidth
                                leftSection={<IconMessageCircle size={18} />}
                                classNames={{
                                    root: styles.mobileNavLink,
                                    label: styles.mobileNavLink,
                                }}
                                onClick={() => {
                                    openFeedbackModal();
                                    toggle(); // Also close the drawer
                                }}
                                styles={{
                                    root: {
                                        height: 'auto',
                                        border: '1px solid var(--mantine-color-gray-3)',
                                        padding: 'var(--mantine-spacing-md) 0',
                                    },
                                    label: { borderBottom: 'none' },
                                }}
                            >
                                Feedback
                            </Button>

                            {/*
                                TODO: Enable the settings again to allow the users to manage their payment methods, this is temporary for the beta users only
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
                                */}

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
            <FeedbackModal
                opened={feedbackModalOpened}
                onClose={closeFeedbackModal}
                userEmail={userEmail}
            />
        </>
    );
}
