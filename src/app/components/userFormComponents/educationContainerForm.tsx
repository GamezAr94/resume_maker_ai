import { Dispatch, SetStateAction } from 'react';
import EducationInfoForm from './forms/educationInfoForm';
import { FormEducationStructure } from '@/utils/interfaces';

interface Params {
    setEducationInfo: Dispatch<
        SetStateAction<false | [FormEducationStructure]>
    >;
    educationInfo: [FormEducationStructure] | false;
    setRefreshTrigger: Dispatch<
        SetStateAction<{
            experience: boolean;
            education: boolean;
            skill: boolean;
            project: boolean;
        }>
    >;
}

export default function EducationContainerForm({
    setEducationInfo,
    educationInfo,
    setRefreshTrigger,
}: Params) {
    return (
        <>
            <p>Education</p>
            {educationInfo &&
                educationInfo.map((item, index) => (
                    <EducationInfoForm
                        key={index}
                        infoQuery={item}
                        setInfo={setEducationInfo}
                        setRefreshTrigger={setRefreshTrigger}
                    />
                ))}
            <EducationInfoForm
                infoQuery={null}
                setInfo={null}
                setRefreshTrigger={setRefreshTrigger}
            />
        </>
    );
}
