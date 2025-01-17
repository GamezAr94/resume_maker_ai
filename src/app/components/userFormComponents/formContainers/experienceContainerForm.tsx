'user client';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormExperienceStructure, RefreshSections } from '@/utils/interfaces';
import ExperienceForm from '../forms/experienceForm';
import ShowUserDataSection from '../showUserDataSection';

interface Params {
    setExperienceInfo: Dispatch<
        SetStateAction<false | [FormExperienceStructure]>
    >;
    experienceInfo: [FormExperienceStructure] | [];
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    className: string;
}

export default function ExperienceContainerForm({
    setExperienceInfo,
    experienceInfo,
    setRefreshTrigger,
    className,
}: Params) {
    const [getEditRecord, setEditRecord] =
        useState<FormExperienceStructure | null>(null);
    return (
        <>
            <div>
                <h2>Experience</h2>
            </div>
            <div className={className}>
                <ExperienceForm
                    infoQuery={null}
                    setInfo={null}
                    setRefreshTrigger={setRefreshTrigger}
                    getEditRecord={getEditRecord}
                    setEditRecord={setEditRecord}
                />
                <ShowUserDataSection>
                    {experienceInfo.length > 0
                        ? experienceInfo.map((item, index) => (
                              <ExperienceForm
                                  key={index}
                                  infoQuery={item}
                                  setInfo={setExperienceInfo}
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
