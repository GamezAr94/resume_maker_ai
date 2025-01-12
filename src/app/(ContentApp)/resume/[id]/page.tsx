'use client';
import { getDBTableInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Resume() {
    const router = useRouter();
    const params = useParams();
    const [dataResume, setDataResume] = useState({
        company_name: '',
        created_at: '',
        id: '',
        job_description: '',
        job_position: '',
        resume_generated: {
            // I need to set the interface for this
            education: [{ degree: '', school: '', start_end_date: '' }],
            experience: [
                {
                    company: '',
                    description: '',
                    relevance: '',
                    start_end_date: '',
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
            skills: [],
            summary: '',
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
                console.log(data.data[0].resume_generated);
                /*
                data.data[0].resume_generated = JSON.parse(
                    data.data[0].resume_generated,
                );
                console.log(data.data[0].resume_generated);
                */
                setDataResume(data.data[0]);
            };
            fetchData();
        }
    }, [id]);
    return (
        <>
            <div>Resume</div>
            <p>Company Name: {dataResume.company_name}</p>
            <p>Job Offer Id: {dataResume.id}</p>
            <p>{dataResume.resume_generated.summary}</p>
        </>
    );
}
