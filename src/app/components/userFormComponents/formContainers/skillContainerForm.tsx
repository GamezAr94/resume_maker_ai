'use client';
import { FormSkillStructure, RefreshSections } from '@/utils/interfaces';
import { Dispatch, SetStateAction, useState } from 'react';
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
    const [getEditRecord, setEditRecord] = useState<FormSkillStructure | null>(
        null,
    );
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
                    getEditRecord={getEditRecord}
                    setEditRecord={setEditRecord}
                />
                <ShowUserDataSection>
                    {skillInfo.length > 0
                        ? skillInfo.map((item, index) => (
                              <SkillsInfoForm
                                  key={index}
                                  infoQuery={item}
                                  setInfo={setSkillInfo}
                                  setRefreshTrigger={setRefreshTrigger}
                                  setEditRecord={setEditRecord}
                                  getEditRecord={getEditRecord}
                              />
                          ))
                        : null}
                </ShowUserDataSection>
            </div>
        </>
    );
}
