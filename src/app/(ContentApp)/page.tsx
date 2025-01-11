import styles from './page.module.css';

import MainUserForm from '../components/userFormComponents/mainUserForm';
import MainJobForm from '../components/jobOfferFormComponents/mainJobForm';
import { Divider } from '@mantine/core';

export default async function Home() {
    return (
        <div>
            <main className={styles.main}>
                <MainJobForm className={styles.container_form} />
                <Divider my="xs" color="gray.1" />
                <MainUserForm className={styles.container_form} />
            </main>
        </div>
    );
}
