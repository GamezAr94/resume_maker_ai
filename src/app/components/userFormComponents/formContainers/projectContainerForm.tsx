'user client';
import {
    FormEducationStructure,
    FormExperienceStructure,
    FormProjectStructure,
    RefreshSections,
} from '@/utils/interfaces';
import { Dispatch, SetStateAction, useState } from 'react';
import ProjectsInfoForm from '../forms/projectsInfoForm';
import ShowUserDataSection from '../showUserDataSection';
import styles from './formContainerStyles.module.css';

interface Params {
    projectInfo: [FormProjectStructure] | [];
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    educationInfo: [FormEducationStructure] | [];
    experienceInfo: [FormExperienceStructure] | [];
}
export default function ProjectContainerForm({
    projectInfo,
    setRefreshTrigger,
    educationInfo,
    experienceInfo,
}: Params) {
    const [getEditRecord, setEditRecord] =
        useState<FormProjectStructure | null>(null);
    const [selectedType, setSelectedType] = useState<
        'personal_type' | 'experience_type' | 'education_type'
    >('personal_type');
    return (
        <div>
            {/* --- Card for the Add/Edit Form --- */}
            <div className={styles.formCard}>
                <h2 className={styles.formCardTitle}>Project Management</h2>
                <h3 className={styles.formCardSubtitle}>
                    {getEditRecord ? 'Edit Project' : 'Add New Project'}
                </h3>
                <ProjectsInfoForm
                    // This form is now for both adding and editing
                    infoQuery={null} // This seems to be for display-only instances, so null is correct here
                    setRefreshTrigger={setRefreshTrigger}
                    educationInfo={educationInfo}
                    experienceInfo={experienceInfo}
                    getEditRecord={getEditRecord}
                    setEditRecord={setEditRecord}
                    setSelectedType={setSelectedType}
                    selectedType={selectedType}
                />
            </div>

            {/* --- Card for the List of Existing Projects --- */}
            {projectInfo.length > 0 && (
                <div className={`${styles.formCard} ${styles.infoDisplayCard}`}>
                    <h3 className={styles.formCardSubtitle}>
                        My Saved Projects
                    </h3>
                    <div className={styles.scrollableRecordList}>
                        <ShowUserDataSection>
                            {projectInfo.map((item, index) => (
                                <ProjectsInfoForm
                                    key={index}
                                    infoQuery={item} // Passing the item here makes it a display instance
                                    setRefreshTrigger={setRefreshTrigger}
                                    educationInfo={educationInfo}
                                    experienceInfo={experienceInfo}
                                    setEditRecord={setEditRecord}
                                    getEditRecord={getEditRecord}
                                    setSelectedType={setSelectedType}
                                    selectedType={selectedType}
                                />
                            ))}
                        </ShowUserDataSection>
                    </div>
                </div>
            )}
        </div>
    );
}
