'use client';
import ResumeViewer from '@/app/components/resumeViewer/resumeViewer';
import { getDBTableInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import { GeminiResponse } from '@/utils/interfaces';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Resume() {
    const router = useRouter();
    const params = useParams();
    const [dataResume, setDataResume] = useState<{
        company_name: string;
        created_at: string;
        id: string;
        job_description: string;
        job_position: string;
        resume_generated: GeminiResponse;
    }>({
        company_name: '',
        created_at: '',
        id: '',
        job_description: '',
        job_position: '',
        resume_generated: {
            // I need to set the interface for this
            contact_info: { name: '', email: '', phone: '', linkedin: '' },
            education: [{ degree: '', school: '', start_end_dates: '' }],
            experience: [
                {
                    company: '',
                    description: '',
                    relevance: '',
                    start_end_dates: '',
                    title: '',
                },
            ],
            keywords: [],
            projects: [
                {
                    name: '',
                    relevance: '',
                    description: '',
                    start_end_dates: '',
                },
            ],
            recommendations: '',
            explanation: '',
            summary: '',
            skills: [],
        },
    });
    const id = params.id;
    useEffect(() => {
        // Verify the id is a valid number
        if (
            id !== undefined &&
            id !== null &&
            typeof +id !== 'string' &&
            !isNaN(Number(id))
        ) {
            const fetchData = async () => {
                const data = await getDBTableInfo(
                    SectionTypes.JobOffer,
                    null,
                    +id,
                );
                if (
                    data.data == undefined ||
                    data.data == null ||
                    data.data.length <= 0
                ) {
                    // Redirect to the dashboard if there is NO resume
                    router.push(`/`);
                }
                // TODO I need to fetch the user info as well so that I can populate the contact info in the object
                // TODO I need to make sure the json is correct because if the section 'recommendations' has this symbol "" it will break the entire json object
                // console.log(data.data[0].resume_generated);
                /*
                data.data[0].contact_info.name = 'Arturo';
                data.data[0].contact_info.email = 'Arturo';
                data.data[0].contact_info.phone = 'Arturo';
                data.data[0].contact_info.linkedin = 'Arturo';
                */

                let resumeData = data.data[0].resume_generated;
                // make sure we are sending a JSON object
                if (typeof resumeData != 'object') {
                    resumeData = JSON.parse(resumeData);
                }
                // TODO validate the response of this request
                const userInfo = await getDBTableInfo('');
                setDataResume({
                    ...data.data[0],
                    resume_generated: {
                        ...resumeData,
                        contact_info: {
                            name:
                                userInfo.data.first_name +
                                ' ' +
                                userInfo.data.last_name,
                            email: userInfo.data.email,
                            phone: 'PHONE',
                            linkedin: 'LINKEDIN',
                        },
                    },
                });
            };
            fetchData();
        }
    }, [id]);
    return (
        <div>
            <ResumeViewer resumeData={dataResume} />
            <div>Resume Editor</div>
        </div>
    );
}
