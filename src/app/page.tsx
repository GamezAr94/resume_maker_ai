import styles from './page.module.css';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MainUserForm from './components/userFormComponents/mainUserForm';
import MainJobForm from './components/jobOfferFormComponents/mainJobForm';
import Header from './components/header/Header';
import { Divider } from '@mantine/core';

export default async function Home() {
    // This code redirect to the dashboard if it is authenticated
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/sign-in');
    }

    return (
        <div>
            <Header />
            <main className={styles.main}>
                <MainJobForm className={styles.container_form} />
                <Divider my="xs" color="gray.1" />
                <MainUserForm className={styles.container_form} />
            </main>
        </div>
    );
}
