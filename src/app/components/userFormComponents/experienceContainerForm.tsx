import { Dispatch, SetStateAction } from 'react';
import { FormExperienceStructure, RefreshSections } from '@/utils/interfaces';
import ExperienceForm from './forms/experienceForm';

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
    return (
        <>
            <p>Work Experience</p>
            {experienceInfo &&
                experienceInfo.map((item, index) => (
                    <ExperienceForm
                        key={index}
                        infoQuery={item}
                        setInfo={setExperienceInfo}
                        setRefreshTrigger={setRefreshTrigger}
                    />
                ))}
            <ExperienceForm
                infoQuery={null}
                setInfo={null}
                setRefreshTrigger={setRefreshTrigger}
            />
        </>
    );
}
