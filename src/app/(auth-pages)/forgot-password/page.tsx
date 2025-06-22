// src/app/(auth-pages)/forgot-password/page.tsx
'use client';

import {
    Paper,
    Title,
    Text,
    TextInput,
    Button,
    Container,
    Anchor,
    Center,
    Box,
    rem,
    ThemeIcon,
    Alert,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconKey,
    IconAt,
    IconAlertCircle,
} from '@tabler/icons-react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/app/actions';
import ActionMsg from '../message';

export default function ForgotPasswordPage() {
    return (
        <Container size={460} my={30} style={{ width: '100%' }}>
            <Anchor component={Link} href="/sign-in" c="dimmed" size="sm">
                <Center inline>
                    <IconArrowLeft
                        style={{ width: rem(12), height: rem(12) }}
                    />
                    <Box ml={5}>Back to sign in</Box>
                </Center>
            </Anchor>

            <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
                <Center>
                    <ThemeIcon variant="light" size={60} radius="md">
                        <IconKey style={{ width: rem(32), height: rem(32) }} />
                    </ThemeIcon>
                </Center>

                <Title ta="center" mt="md">
                    Forgot your password?
                </Title>
                <Text c="dimmed" fz="sm" ta="center">
                    No worries! Enter your email and we&apos;ll send you a reset
                    link.
                </Text>

                <form action={forgotPasswordAction}>
                    <TextInput
                        leftSectionPointerEvents="none"
                        leftSection={
                            <IconAt
                                style={{ width: rem(16), height: rem(16) }}
                            />
                        }
                        label="Email"
                        placeholder="your.email@example.com"
                        name="email"
                        required
                        mt="md"
                    />

                    {/* Note: The ActionMsg component is used to display messages from the server action.*/}
                    <ActionMsg />

                    <Button type="submit" fullWidth mt="xl">
                        Send reset link
                    </Button>
                </form>
            </Paper>

            <Alert
                variant="light"
                color="blue"
                title="Security Tip"
                icon={<IconAlertCircle />}
                mt="lg"
            >
                The reset link will expire in 1 hour for your security. Make
                sure to check your spam folder if you don&apos;t see the email.
            </Alert>

            <Text c="dimmed" size="sm" ta="center" mt="md">
                Remember your password?{' '}
                <Anchor size="sm" component={Link} href="/sign-in">
                    Sign in
                </Anchor>
            </Text>
        </Container>
    );
}
