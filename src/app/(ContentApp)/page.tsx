'use client';

import styles from './page.module.css';

import MainUserForm from '../components/userFormComponents/mainUserForm';
import MainJobForm from '../components/jobOfferFormComponents/mainJobForm';
import { Divider } from '@mantine/core';
import { ProfileCompletionCard } from '../components/ProfileCompletion/ProfileCompletionCard';
import { useRef } from 'react';

export default function Home() {
    const mainFormRef = useRef<HTMLDivElement>(null);

    const handleScrollToForm = () => {
        mainFormRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };
    return (
        <div>
            <main className={styles.main}>
                <ProfileCompletionCard
                    onCompleteProfileClick={handleScrollToForm}
                />
                <MainJobForm className={styles.container_form} />
                <Divider my="xs" color="gray.1" />
                <MainUserForm
                    ref={mainFormRef}
                    className={styles.container_form}
                />
            </main>
        </div>
    );
}
