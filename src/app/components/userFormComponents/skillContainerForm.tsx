import { FormSkillStructure, RefreshSections } from '@/utils/interfaces';
import { Dispatch, SetStateAction } from 'react';
import SkillsInfoForm from './forms/skillsInfoForm';

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
    return (
        <>
            <p>Skills</p>
            {skillInfo &&
                skillInfo.map((item, index) => (
                    <SkillsInfoForm
                        key={index}
                        infoQuery={item}
                        setInfo={setSkillInfo}
                        setRefreshTrigger={setRefreshTrigger}
                    />
                ))}
            <SkillsInfoForm
                infoQuery={null}
                setInfo={null}
                setRefreshTrigger={setRefreshTrigger}
            />
        </>
    );
}
