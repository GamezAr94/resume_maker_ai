'user client';
import { Dispatch, SetStateAction, useState } from 'react';
import EducationInfoForm from '../forms/educationInfoForm';
import { FormEducationStructure, RefreshSections } from '@/utils/interfaces';
import ShowUserDataSection from '../showUserDataSection';

interface Params {
    setEducationInfo: Dispatch<
        SetStateAction<false | [FormEducationStructure]>
    >;
    educationInfo: [FormEducationStructure] | [];
    setRefreshTrigger: Dispatch<SetStateAction<RefreshSections>>;
    className: string;
}

export default function EducationContainerForm({
    setEducationInfo,
    educationInfo,
    setRefreshTrigger,
    className,
}: Params) {
    const [getEditRecord, setEditRecord] =
        useState<FormEducationStructure | null>(null);
    return (
        <>
            <div>
                <h2>Education</h2>
            </div>
            <div className={className}>
                <EducationInfoForm
                    infoQuery={null}
                    setInfo={null}
                    setRefreshTrigger={setRefreshTrigger}
                    getEditRecord={getEditRecord}
                    setEditRecord={setEditRecord}
                />
                <ShowUserDataSection>
                    {educationInfo.length > 0
                        ? educationInfo.map((item, index) => (
                              <EducationInfoForm
                                  key={index}
                                  infoQuery={item}
                                  setInfo={setEducationInfo}
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
