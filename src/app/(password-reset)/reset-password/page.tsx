'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
    Paper,
    Title,
    Text,
    PasswordInput,
    Button,
    Container,
    Center,
    rem,
    ThemeIcon,
    Box,
    Alert,
    Progress,
    Popover,
} from '@mantine/core';
import {
    IconCheck,
    IconCircleCheck,
    IconLock,
    IconX,
} from '@tabler/icons-react';
import { resetPasswordAction } from '@/app/actions';
import ActionMsg from '@/app/(auth-pages)/message'; // Assuming your ActionMsg is here

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

const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
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

export default function ResetPasswordPage() {
    const [isSuccess, setIsSuccess] = useState(false);
    const searchParams = useSearchParams();

    // --- State for password validation (Copied from sign-up page) ---
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

    useEffect(() => {
        const status = searchParams.get('success');
        if (status && status != '') {
            setIsSuccess(true);
        }
    }, [searchParams]);

    // Client-side validation before submitting the form
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        setClientError('');

        if (password.length < 8) {
            event.preventDefault();
            setClientError('Password must be at least 8 characters long.');
            return;
        }
        for (const requirement of requirements) {
            if (!requirement.re.test(password)) {
                event.preventDefault();
                setClientError(
                    `Password requirement not met: ${requirement.label}.`,
                );
                return;
            }
        }
        if (password !== confirmPassword) {
            event.preventDefault();
            setClientError('Passwords do not match. Please try again.');
            return;
        }
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Container size={460} my={30} style={{ width: '100%' }}>
                <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
                    <Center>
                        <ThemeIcon
                            variant="light"
                            size={60}
                            radius="md"
                            // Change icon color on success
                            color={isSuccess ? 'teal' : 'blue'}
                        >
                            {isSuccess ? (
                                <IconCircleCheck
                                    style={{ width: rem(32), height: rem(32) }}
                                />
                            ) : (
                                <IconLock
                                    style={{ width: rem(32), height: rem(32) }}
                                />
                            )}
                        </ThemeIcon>
                    </Center>

                    <Title ta="center" mt="md">
                        {/* Change title on success */}
                        {isSuccess ? 'Password Updated!' : 'Set a new password'}
                    </Title>
                    <Text c="dimmed" fz="sm" ta="center">
                        {/* Change text on success */}
                        {isSuccess
                            ? 'You can now sign in with your new password.'
                            : 'Please enter and confirm your new password below.'}
                    </Text>

                    {/* 4. We conditionally render the form OR the success button */}
                    {isSuccess ? (
                        <>
                            {/* We still show ActionMsg to display the success message */}
                            <ActionMsg />
                            <Button
                                component={Link}
                                href="/"
                                fullWidth
                                mt="xl"
                                variant="light"
                            >
                                Go to Dashboard
                            </Button>
                        </>
                    ) : (
                        <form
                            action={resetPasswordAction}
                            onSubmit={handleSubmit}
                        >
                            <Popover
                                opened={popoverOpened}
                                position="bottom"
                                width="target"
                                transitionProps={{ transition: 'pop' }}
                            >
                                <Popover.Target>
                                    <div
                                        onFocusCapture={() =>
                                            setPopoverOpened(true)
                                        }
                                        onBlurCapture={() =>
                                            setPopoverOpened(false)
                                        }
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
                                            label="New Password"
                                            placeholder="Your new password"
                                            name="password"
                                            required
                                            mt="md"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(
                                                    event.currentTarget.value,
                                                )
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
                                        style={{
                                            width: rem(16),
                                            height: rem(16),
                                        }}
                                    />
                                }
                                label="Confirm New Password"
                                placeholder="Confirm your new password"
                                name="confirmPassword"
                                required
                                mt="md"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.currentTarget.value,
                                    )
                                }
                            />

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
                                Update Password
                            </Button>
                        </form>
                    )}
                </Paper>
            </Container>
        </Suspense>
    );
}
