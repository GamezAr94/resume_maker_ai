'use client';
import { FormSkillStructure, RefreshSections } from '@/utils/interfaces';
import { Dispatch, SetStateAction, useState } from 'react';
import SkillsInfoForm from '../forms/skillsInfoForm';
import ShowUserDataSection from '../showUserDataSection';
import styles from './formContainerStyles.module.css';

interface Params {
    setSkillInfo: Dispatch<SetStateAction<false | [FormSkillStructure]>>;
    skillInfo: [FormSkillStructure] | [];
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
}
export default function SkillContainerForm({
    setSkillInfo,
    skillInfo,
    setRefreshTrigger,
}: Params) {
    const [getEditRecord, setEditRecord] = useState<FormSkillStructure | null>(
        null,
    );
    return (
        <div>
            {/* --- Card for the Add/Edit Form --- */}
            <div className={styles.formCard}>
                <h2 className={styles.formCardTitle}>Skills Management</h2>
                <h3 className={styles.formCardSubtitle}>
                    {getEditRecord ? 'Edit Skill' : 'Add New Skill'}
                </h3>
                <SkillsInfoForm
                    infoQuery={null}
                    setInfo={null}
                    setRefreshTrigger={setRefreshTrigger}
                    getEditRecord={getEditRecord}
                    setEditRecord={setEditRecord}
                />
            </div>

            {/* --- Card for the List of Existing Skills --- */}
            {skillInfo.length > 0 && (
                <div className={`${styles.formCard} ${styles.infoDisplayCard}`}>
                    <h3 className={styles.formCardSubtitle}>My Saved Skills</h3>
                    <div className={styles.scrollableRecordList}>
                        <ShowUserDataSection>
                            {skillInfo.map((item, index) => (
                                <SkillsInfoForm
                                    key={index}
                                    infoQuery={item}
                                    setInfo={setSkillInfo}
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
