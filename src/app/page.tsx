import styles from './page.module.css';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import UserInfoForm from './components/userFormComponents/mainForm';

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
        <main className={styles.main}>
            <UserInfoForm />
            <div>Resume Maker</div>
        </main>
    );
}
