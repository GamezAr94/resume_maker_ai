import { FormPersonalStructure, RefreshSections } from '@/utils/interfaces';
import { Dispatch, SetStateAction } from 'react';
import PersonalInfoForm from '../forms/personalInfoForm';

interface Params {
    personalInfo: FormPersonalStructure;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    className: string;
}
export default function PersonalContainerForm({
    personalInfo,
    setRefreshTrigger,
    className,
}: Params) {
    return (
        <>
            <div>
                <h2>Personal</h2>
            </div>
            <div className={className}>
                <PersonalInfoForm
                    infoQuery={personalInfo}
                    setRefreshTrigger={setRefreshTrigger}
                />
            </div>
        </>
    );
}
