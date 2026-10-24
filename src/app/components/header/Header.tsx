'use client';

import {
    Container,
    Group,
    Text,
    Burger,
    Drawer,
    Stack,
    Anchor,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import styles from './header.module.css';

export default function Header() {
    const [opened, { toggle }] = useDisclosure(false);

    return (
        <header className={styles.header}>
            <Container size="xxl" className={styles.inner}>
                <Link
                    href="/"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <Group className={styles.logoSection}>
                        <Text className={styles.logoText}>Resume Maker AI</Text>
                    </Group>
                </Link>

                {/* Desktop Navigation */}
                <Group className={styles.mainNav}>
                    <Group gap="xl">
                        <Anchor
                            component={Link}
                            href="/"
                            className={styles.navLink}
                        >
                            Master Profile & Builder
                        </Anchor>
                        <Anchor
                            component={Link}
                            href="/applications"
                            className={styles.navLink}
                        >
                            My Applications
                        </Anchor>
                    </Group>
                </Group>

                {/* Mobile Hamburger Menu */}
                <Group className={styles.hamburger}>
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        color="white"
                        size="sm"
                        aria-label="Toggle navigation"
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
                    zIndex={2000}
                >
                    <Stack gap="lg" mt="md">
                        <Anchor
                            component={Link}
                            href="/"
                            className={styles.mobileNavLink}
                            onClick={toggle}
                        >
                            Master Profile & Builder
                        </Anchor>
                        <Anchor
                            component={Link}
                            href="/applications"
                            className={styles.mobileNavLink}
                            onClick={toggle}
                        >
                            My Applications
                        </Anchor>
                    </Stack>
                </Drawer>
            </Container>
        </header>
    );
}
