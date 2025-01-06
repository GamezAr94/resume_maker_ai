import { FormSkillStructure, RefreshSections } from '@/utils/interfaces';
import { Dispatch, SetStateAction } from 'react';
import SkillsInfoForm from '../forms/skillsInfoForm';
import ShowUserDataSection from '../showUserDataSection';

interface Params {
    setSkillInfo: Dispatch<SetStateAction<false | [FormSkillStructure]>>;
    skillInfo: [FormSkillStructure] | [];
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    className: string;
}
export default function SkillContainerForm({
    setSkillInfo,
    skillInfo,
    setRefreshTrigger,
    className,
}: Params) {
    return (
        <>
            <div>
                <h2>Skills</h2>
            </div>
            <div className={className}>
                <SkillsInfoForm
                    infoQuery={null}
                    setInfo={null}
                    setRefreshTrigger={setRefreshTrigger}
                />
                <ShowUserDataSection>
                    {skillInfo.length > 0
                        ? skillInfo.map((item, index) => (
                              <SkillsInfoForm
                                  key={index}
                                  infoQuery={item}
                                  setInfo={setSkillInfo}
                                  setRefreshTrigger={setRefreshTrigger}
                              />
                          ))
                        : null}
                </ShowUserDataSection>
            </div>
        </>
    );
}
