// src/app/(auth-pages)/message.tsx
'use client';

import { Alert } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function ActionMsg() {
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get('error');
    const successMessage = searchParams.get('success');

    const router = useRouter();
    const pathname = usePathname();

    // This function will remove the query params from the URL, hiding the alert.
    const handleClose = () => {
        router.replace(pathname);
    };

    // If there's an error message in the URL, display a red error alert
    if (errorMessage) {
        return (
            <Alert
                title="Error"
                color="red"
                icon={<IconX />}
                mt="md"
                variant="light"
                withCloseButton
                onClose={handleClose}
            >
                {decodeURIComponent(errorMessage)}
            </Alert>
        );
    }

    // If there's a success message in the URL, display a green success alert
    if (successMessage) {
        return (
            <Alert
                title="Success"
                color="teal"
                icon={<IconCheck />}
                mt="md"
                variant="light"
                withCloseButton
                onClose={handleClose}
            >
                {decodeURIComponent(successMessage)}
            </Alert>
        );
    }

    // If there are no messages, render nothing
    return null;
}
