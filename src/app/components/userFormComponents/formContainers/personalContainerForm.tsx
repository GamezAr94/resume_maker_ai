import { FormPersonalStructure, RefreshSections } from '@/utils/interfaces';
import { Dispatch, SetStateAction } from 'react';
import PersonalInfoForm from '../forms/personalInfoForm';
import styles from './formContainerStyles.module.css';

interface Params {
    personalInfo: FormPersonalStructure;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    setUserInfo: Dispatch<SetStateAction<false | FormPersonalStructure>>;
}
export default function PersonalContainerForm({
    personalInfo,
    setRefreshTrigger,
    setUserInfo,
}: Params) {
    return (
        <div className={styles.formCard}>
            <h2 className={styles.formCardTitle}>Personal Info Management</h2>
            {/* We can add another title for the specific form if needed */}
            <h3 className={styles.formCardSubtitle}>Edit Personal Info</h3>
            <div>
                <PersonalInfoForm
                    infoQuery={personalInfo}
                    setRefreshTrigger={setRefreshTrigger}
                    setUserInfo={setUserInfo}
                />
            </div>
        </div>
    );
}
