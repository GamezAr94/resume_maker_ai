import Link from 'next/link';
import styles from './page.module.css';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { signOutAction } from './actions';

export default async function Home() {
    // This code redirect to the dashboard if it is authenticated
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/sign-up');
    }

    return (
        <main className={styles.main}>
            <form action={signOutAction}>
                <button type="submit">Exit</button>
            </form>
            <div>Main Page</div>
            <div>
                <Link href="sign-up">Sign in</Link>
            </div>
        </main>
    );
}
