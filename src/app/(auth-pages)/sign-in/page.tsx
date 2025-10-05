// src/app/(auth-pages)/sign-in/page.tsx
'use client';

import { useState } from 'react';
import {
    Paper,
    Title,
    Text,
    TextInput,
    PasswordInput,
    Button,
    Container,
    Group,
    Anchor,
    Checkbox,
    Center,
    Box,
    rem,
    Divider,
    ThemeIcon, // <--- Import ThemeIcon
} from '@mantine/core';
import {
    IconArrowLeft,
    IconBriefcase, // <--- Use the briefcase icon
    IconLock,
    IconAt,
} from '@tabler/icons-react';
import Link from 'next/link';
import { signInAction } from '@/app/actions';
import ActionMsg from '../message';
import { createClient } from '@/utils/supabase/client';

// You can create a separate component for these SVG icons if you want
const GoogleIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="20px"
        height="20px"
    >
        <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
      c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
      c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
      C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
      c-5.222,0-9.582-3.333-11.127-7.962l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238
      C42.022,35.638,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
    </svg>
);

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSignInWithGoogle = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    return (
        <Container size={460} my={30} style={{ width: '100%' }}>
            <Anchor
                href="https://www.fazume.com"
                c="dimmed"
                size="sm"
                rel="noopener noreferrer"
            >
                <Center inline>
                    <IconArrowLeft
                        style={{ width: rem(12), height: rem(12) }}
                    />
                    <Box ml={5}>Back to home</Box>
                </Center>
            </Anchor>

            <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
                <Center>
                    {/* --- THIS IS THE UPDATED SECTION --- */}
                    <ThemeIcon variant="light" size={60} radius="md">
                        <IconBriefcase
                            style={{ width: rem(32), height: rem(32) }}
                        />
                    </ThemeIcon>
                </Center>

                <Title ta="center" mt="md">
                    Welcome back
                </Title>
                <Text c="dimmed" fz="sm" ta="center">
                    Sign in to your ResumeAI account
                </Text>

                <form action={signInAction} onSubmit={() => setIsLoading(true)}>
                    <TextInput
                        leftSectionPointerEvents="none"
                        leftSection={
                            <IconAt
                                style={{ width: rem(16), height: rem(16) }}
                            />
                        }
                        label="Email"
                        name="email"
                        placeholder="you@example.com"
                        required
                        mt="md"
                    />
                    <PasswordInput
                        leftSectionPointerEvents="none"
                        leftSection={
                            <IconLock
                                style={{ width: rem(16), height: rem(16) }}
                            />
                        }
                        label="Password"
                        name="password"
                        placeholder="Your password"
                        required
                        mt="md"
                    />
                    <Group justify="space-between" mt="lg">
                        <Checkbox label="Remember me" name="rememberMe" />
                        <Anchor
                            component={Link}
                            href="/forgot-password"
                            size="sm"
                        >
                            Forgot password?
                        </Anchor>
                    </Group>
                    <ActionMsg />
                    <Button type="submit" fullWidth mt="xl" loading={isLoading}>
                        Sign in
                    </Button>
                </form>

                <Divider
                    label="Or continue with"
                    labelPosition="center"
                    my="lg"
                />

                <Group grow>
                    <Button
                        leftSection={<GoogleIcon />}
                        onClick={handleSignInWithGoogle}
                        variant="default"
                        loading={isLoading}
                    >
                        Google
                    </Button>
                </Group>
            </Paper>

            <Text c="dimmed" size="sm" ta="center" mt="md">
                Don&apos;t have an account?{' '}
                <Anchor size="sm" component={Link} href="/sign-up">
                    Sign up
                </Anchor>
            </Text>
        </Container>
    );
}
