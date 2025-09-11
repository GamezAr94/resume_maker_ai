// src/app/(auth-pages)/sign-up/page.tsx
'use client';

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
    ThemeIcon,
    Divider,
    Popover,
    Progress,
    Alert,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconBriefcase,
    IconLock,
    IconAt,
    IconUser,
    IconX,
    IconCheck,
} from '@tabler/icons-react';
import Link from 'next/link';
import { signUpAction } from '@/app/actions';
import ActionMsg from '../message';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

// --- Start of Password Strength Component ---
function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
    return (
        <Text
            component="div"
            c={met ? 'teal' : 'red'}
            style={{ display: 'flex', alignItems: 'center' }}
            mt={7}
            size="sm"
        >
            {met ? (
                <IconCheck style={{ width: rem(14), height: rem(14) }} />
            ) : (
                <IconX style={{ width: rem(14), height: rem(14) }} />
            )}{' '}
            <Box ml={10}>{label}</Box>
        </Text>
    );
}

// NOTE: this controls the client-side password strength validation
// we need to also check the server-side password strength in /src/app/actions.ts
const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    //{ re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
    let multiplier = password.length > 7 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}
// --- End of Password Strength Component ---

// --- Social Login Icons ---
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

export default function SignUpPage() {
    const [popoverOpened, setPopoverOpened] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [clientError, setClientError] = useState('');

    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement
            key={index}
            label={requirement.label}
            met={requirement.re.test(password)}
        />
    ));
    const strength = getStrength(password);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        setClientError(''); // Reset errors on a new submission attempt

        // --- CLIENT-SIDE CHECKS ---
        // Check if the password is provided
        if (password.length < 8) {
            event.preventDefault(); // Stop the form submission
            setClientError('Password must be at least 8 characters long.');
            return;
        }

        // Check if the password meets all requirements
        for (const requirement of requirements) {
            if (!requirement.re.test(password)) {
                event.preventDefault(); // Stop form submission
                // Create an error message directly from the requirement label
                setClientError(
                    `Password requirement not met: ${requirement.label}.`,
                );
                return;
            }
        }

        // Check if the confirm password matches the password
        if (password !== confirmPassword) {
            event.preventDefault(); // Stop the form submission
            setClientError('Passwords do not match. Please try again.');
            return;
        }

        // If all checks pass, the form will submit to the server action as normal.
    };

    const handleSignInWithGoogle = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // You can specify a redirect URL here if needed,
                // otherwise it will redirect to your site's base URL.
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
                target="_blank"
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
                    <ThemeIcon variant="light" size={60} radius="md">
                        <IconBriefcase
                            style={{ width: rem(32), height: rem(32) }}
                        />
                    </ThemeIcon>
                </Center>

                <Title ta="center" mt="md">
                    Create your account
                </Title>
                <Text c="dimmed" fz="sm" ta="center">
                    Start building professional resumes with AI
                </Text>

                <form action={signUpAction} onSubmit={handleSubmit}>
                    <Group grow>
                        <TextInput
                            leftSectionPointerEvents="none"
                            leftSection={
                                <IconUser
                                    style={{ width: rem(16), height: rem(16) }}
                                />
                            }
                            label="First name"
                            name="first_name"
                            placeholder="John"
                            required
                        />
                        <TextInput
                            leftSectionPointerEvents="none"
                            leftSection={
                                <IconUser
                                    style={{ width: rem(16), height: rem(16) }}
                                />
                            }
                            label="Last name"
                            name="last_name"
                            placeholder="Doe"
                            required
                        />
                    </Group>
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

                    <Popover
                        opened={popoverOpened}
                        position="bottom"
                        width="target"
                        transitionProps={{ transition: 'pop' }}
                    >
                        <Popover.Target>
                            <div
                                onFocusCapture={() => setPopoverOpened(true)}
                                onBlurCapture={() => setPopoverOpened(false)}
                            >
                                <PasswordInput
                                    leftSectionPointerEvents="none"
                                    leftSection={
                                        <IconLock
                                            style={{
                                                width: rem(16),
                                                height: rem(16),
                                            }}
                                        />
                                    }
                                    label="Password"
                                    name="password"
                                    placeholder="Create a password"
                                    required
                                    mt="md"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.currentTarget.value)
                                    }
                                />
                            </div>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Progress
                                color={color}
                                value={strength}
                                size={5}
                                mb="xs"
                            />
                            <PasswordRequirement
                                label="Includes at least 8 characters"
                                met={password.length > 7}
                            />
                            {checks}
                        </Popover.Dropdown>
                    </Popover>

                    <PasswordInput
                        leftSectionPointerEvents="none"
                        leftSection={
                            <IconLock
                                style={{ width: rem(16), height: rem(16) }}
                            />
                        }
                        label="Confirm password"
                        name="confirm_password"
                        placeholder="Confirm your password"
                        required
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(event.currentTarget.value)
                        }
                        mt="md"
                    />
                    <Checkbox
                        label={
                            <Text size="sm">
                                I agree to the{' '}
                                <Anchor
                                    href="https://www.fazume.com/terms"
                                    target="_blank"
                                >
                                    Terms of Service
                                </Anchor>{' '}
                                and{' '}
                                <Anchor
                                    href="https://www.fazume.com/privacy"
                                    target="_blank"
                                >
                                    Privacy Policy
                                </Anchor>
                            </Text>
                        }
                        mt="lg"
                        required
                    />

                    {/* --- This section displays client-side errors --- */}
                    {clientError && (
                        <Alert
                            title="Validation Error"
                            color="red"
                            icon={<IconX />}
                            mt="md"
                            withCloseButton
                            onClose={() => setClientError('')}
                        >
                            {clientError}
                        </Alert>
                    )}
                    <ActionMsg />

                    <Button type="submit" fullWidth mt="xl">
                        Create account
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
                    >
                        Google
                    </Button>
                </Group>
            </Paper>

            <Text c="dimmed" size="sm" ta="center" mt="md">
                Already have an account?{' '}
                <Anchor size="sm" component={Link} href="/sign-in">
                    Sign in
                </Anchor>
            </Text>
        </Container>
    );
}
