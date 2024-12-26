import type { Metadata } from 'next';

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
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
