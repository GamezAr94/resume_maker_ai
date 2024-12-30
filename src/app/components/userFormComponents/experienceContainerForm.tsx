import { Dispatch, SetStateAction } from 'react';
import WorkInfoForm from './forms/workInfoForm';
import { FormExperienceStructure } from '@/utils/interfaces';

interface Params {
    setExperienceInfo: Dispatch<
        SetStateAction<false | [FormExperienceStructure]>
    >;
    experienceInfo: [FormExperienceStructure] | false;
    setRefreshTrigger: Dispatch<
        SetStateAction<{
            experience: boolean;
            education: boolean;
            skill: boolean;
            project: boolean;
        }>
    >;
}

export default function ExperienceContainerForm({
    setExperienceInfo,
    experienceInfo,
    setRefreshTrigger,
}: Params) {
    return (
        <>
            <p>Work Experience</p>
            {experienceInfo &&
                experienceInfo.map((item, index) => (
                    <WorkInfoForm
                        key={index}
                        infoQuery={item}
                        setInfo={setExperienceInfo}
                        setRefreshTrigger={setRefreshTrigger}
                    />
                ))}
            <WorkInfoForm
                infoQuery={null}
                setInfo={null}
                setRefreshTrigger={setRefreshTrigger}
            />
        </>
    );
}
