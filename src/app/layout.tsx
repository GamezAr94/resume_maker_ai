import type { Metadata } from 'next';

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
    return (
        <html lang="en">
            <body>
                <form action={signOutAction}>
                    <button type="submit">Exit</button>
                </form>
                {children}
            </body>
        </html>
    );
}
