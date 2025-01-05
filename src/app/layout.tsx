import type { Metadata } from 'next';

import '@mantine/core/styles.css';
import {
    ButtonProps,
    ColorSchemeScript,
    MantineProvider,
    createTheme,
    mantineHtmlProps,
} from '@mantine/core';

import './globals.css';
import { signOutAction } from './actions';

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
                    <form action={signOutAction}>
                        <button type="submit">Exit</button>
                    </form>
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
