import type { Metadata } from 'next';

import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import {
    ButtonProps,
    ColorSchemeScript,
    MantineProvider,
    createTheme,
    mantineHtmlProps,
} from '@mantine/core';
import '@mantine/notifications/styles.css';

import './globals.css';

export const metadata: Metadata = {
    title: 'Resume Generator AI',
    description: 'Home page of Resume Generator AI',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const theme = createTheme({
        colors: {},
        primaryColor: 'orange',
        components: {
            Button: {
                defaultProps: {
                    color: 'orange.5',
                },
            } as ButtonProps,
        },
    });

    return (
        <html lang="en" {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <MantineProvider theme={theme}>
                    <Notifications position="top-right" zIndex={9999} />
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
