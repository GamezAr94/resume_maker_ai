import { createClient } from '@/utils/supabase/server';
import Header from '../components/header/Header';
import { redirect } from 'next/navigation';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // This code redirect to the dashboard if it is authenticated
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/sign-in');
    }
    return (
        <>
            <Header />
            {children}
        </>
    );
}
