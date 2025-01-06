import { Dispatch, SetStateAction } from 'react';
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
                />
                <ShowUserDataSection>
                    {experienceInfo.length > 0
                        ? experienceInfo.map((item, index) => (
                              <ExperienceForm
                                  key={index}
                                  infoQuery={item}
                                  setInfo={setExperienceInfo}
                                  setRefreshTrigger={setRefreshTrigger}
                              />
                          ))
                        : null}
                </ShowUserDataSection>
            </div>
        </>
    );
}
