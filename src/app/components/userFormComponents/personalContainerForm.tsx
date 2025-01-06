import { FormPersonalStructure, RefreshSections } from '@/utils/interfaces';
import { Dispatch, SetStateAction } from 'react';
import PersonalInfoForm from './forms/personalInfoForm';

interface Params {
    personalInfo: FormPersonalStructure;
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
}
export default function PersonalContainerForm({
    personalInfo,
    setRefreshTrigger,
}: Params) {
    return (
        <>
            <p>Personal</p>
            <PersonalInfoForm
                infoQuery={personalInfo}
                setRefreshTrigger={setRefreshTrigger}
            />
        </>
    );
}
