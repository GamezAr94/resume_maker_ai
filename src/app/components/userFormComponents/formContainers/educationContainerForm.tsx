'user client';
import { Dispatch, SetStateAction, useState } from 'react';
import EducationInfoForm from '../forms/educationInfoForm';
import { FormEducationStructure, RefreshSections } from '@/utils/interfaces';
import ShowUserDataSection from '../showUserDataSection';
import styles from './formContainerStyles.module.css';

interface Params {
    educationInfo: [FormEducationStructure] | [];
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
}

export default function EducationContainerForm({
    educationInfo,
    setRefreshTrigger,
}: Params) {
    const [getEditRecord, setEditRecord] =
        useState<FormEducationStructure | null>(null);
    return (
        <div>
            {/* --- Card for the Add/Edit Form --- */}
            <div className={styles.formCard}>
                <h2 className={styles.formCardTitle}>Education Management</h2>
                <h3 className={styles.formCardSubtitle}>
                    {getEditRecord ? 'Edit Education' : 'Add New Education'}
                </h3>
                <EducationInfoForm
                    infoQuery={null}
                    setRefreshTrigger={setRefreshTrigger}
                    getEditRecord={getEditRecord}
                    setEditRecord={setEditRecord}
                />
            </div>

            {/* --- Card for the List of Existing Education Entries --- */}
            {educationInfo.length > 0 && (
                <div className={`${styles.formCard} ${styles.infoDisplayCard}`}>
                    <h3 className={styles.formCardSubtitle}>
                        My Saved Education
                    </h3>
                    <div className={styles.scrollableRecordList}>
                        <ShowUserDataSection>
                            {educationInfo.map((item, index) => (
                                <EducationInfoForm
                                    key={index}
                                    infoQuery={item}
                                    setRefreshTrigger={setRefreshTrigger}
                                    setEditRecord={setEditRecord}
                                    getEditRecord={getEditRecord}
                                />
                            ))}
                        </ShowUserDataSection>
                    </div>
                </div>
            )}
        </div>
    );
}
