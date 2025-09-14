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

const siteUrl = 'https://www.fazume.com';

export const metadata: Metadata = {
    title: {
        template: '%s | Fazume',
        default:
            'Fazume | AI Resume Builder for Career Changers & Professionals',
    },
    description:
        'Stop wasting hours tailoring your resume. Fazume analyzes your entire career history against any job description to generate a perfectly optimized, job-specific resume in seconds. Ideal for career changers and professionals with a lot of experience, projects or studies.',
    keywords:
        'AI resume builder, resume tailor, automated resume, career change resume, professional resume, job-specific resume, ATS resume, resume optimization',
    metadataBase: new URL(siteUrl),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        url: siteUrl,
        title: 'Fazume: Job-Specific Resumes in Seconds',
        description:
            'Fazume analyzes your full career profile against a job offer to create the perfect resume, every time.',
        // IMPORTANT: Remember to create this social sharing image (1200x630px)
        // and place it in your `public` folder.
        images: [
            {
                url: '/social-sharing-image.png',
                width: 1200,
                height: 630,
                alt: 'Fazume AI Resume Builder Banner',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Fazume: Job-Specific Resumes in Seconds',
        description:
            'Fazume analyzes your full career profile against a job offer to create the perfect resume, every time.',
        images: ['/social-sharing-image.png'],
    },
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
