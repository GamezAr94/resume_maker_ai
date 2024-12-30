'use client';

import WorkInfoForm from './workInfoForm';
import EducationInfoForm from './educationInfoForm';
import ProjectsInfoForm from './projectsInfoForm';
import SkillsInfoForm from './skillsInfoForm';
import PersonalInfoForm from './personalInfoForm';

import { FormExperienceStructure } from '@/utils/interfaces';
import { useEffect, useState } from 'react';
import { getExperienceInfo } from '@/app/db/user_queries';
import exp from 'constants';

export default function UserInfoForm() {
    const [experienceInfo, setExperienceInfo] = useState<
        [FormExperienceStructure] | false
    >(false);

    // Fetch the user data when the component mounts
    useEffect(() => {
        const fetchUserFormInfo = async () => {
            // TODO ART maybe I can fetch all the data with one query instead with multiple queries
            const experienceInfoResp = await getExperienceInfo();
            if (!experienceInfoResp) {
                return;
            }
            // Set the experience info in the state
            setExperienceInfo(experienceInfoResp);
        };
        fetchUserFormInfo();
    }, []);

    return (
        <div>
            <p>Personal Information</p>
            <PersonalInfoForm />

            <p>Work Experience</p>
            {experienceInfo &&
                experienceInfo.map((item, index) => (
                    <WorkInfoForm key={index} infoQuery={item} />
                ))}
            <WorkInfoForm infoQuery={null} />

            <p>Education</p>
            <EducationInfoForm />

            <p>Skills</p>
            <SkillsInfoForm />

            <p>Projects</p>
            <ProjectsInfoForm />
        </div>
    );
}
