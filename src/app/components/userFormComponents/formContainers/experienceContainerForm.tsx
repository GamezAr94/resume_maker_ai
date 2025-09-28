'user client';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormExperienceStructure, RefreshSections } from '@/utils/interfaces';
import ExperienceForm from '../forms/experienceForm';
import ShowUserDataSection from '../showUserDataSection';
import styles from './formContainerStyles.module.css';

interface Params {
    setExperienceInfo: Dispatch<
        SetStateAction<false | [FormExperienceStructure]>
    >;
    experienceInfo: [FormExperienceStructure] | [];
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
}

export default function ExperienceContainerForm({
    setExperienceInfo,
    experienceInfo,
    setRefreshTrigger,
}: Params) {
    const [getEditRecord, setEditRecord] =
        useState<FormExperienceStructure | null>(null);
    return (
        <div>
            {/* --- Card for the Add/Edit Form --- */}
            <div className={styles.formCard}>
                <h2 className={styles.formCardTitle}>Experience Management</h2>
                <h3 className={styles.formCardSubtitle}>
                    {getEditRecord ? 'Edit Experience' : 'Add New Experience'}
                </h3>
                <ExperienceForm
                    infoQuery={null}
                    setInfo={null}
                    setRefreshTrigger={setRefreshTrigger}
                    getEditRecord={getEditRecord}
                    setEditRecord={setEditRecord}
                />
            </div>

            {/* --- Card for the List of Existing Experiences --- */}
            {experienceInfo.length > 0 && (
                <div className={`${styles.formCard} ${styles.infoDisplayCard}`}>
                    <h3 className={styles.formCardSubtitle}>
                        My Saved Experience
                    </h3>
                    <div className={styles.scrollableRecordList}>
                        <ShowUserDataSection>
                            {experienceInfo.map((item, index) => (
                                <ExperienceForm
                                    key={index}
                                    infoQuery={item}
                                    setInfo={setExperienceInfo}
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
