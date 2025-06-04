'use client';
import { getDBTableInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateJobDataOffer,
    FormJobOfferDataStructure,
} from '@/utils/interfaces';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import ResumeEditor from '@/app/components/resumeViewer/resumeEditor';
import dynamic from 'next/dynamic';
const DynamicResumeViewer = dynamic(
    () => import('@/app/components/resumeViewer/resumeViewer'),
    {
        ssr: false, // <-- Deshabilita renderizado en servidor (¡Clave!)
        loading: () => <p>Loading PDF Viewer...</p>, // Opcional
    },
);

export default function Resume() {
    const [dataResume, setDataResume] = useState<FormJobOfferDataStructure>(
        emptyStateJobDataOffer,
    );

    const router = useRouter();
    const params = useParams();
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
                // set the data returned from the database to the state and prepare
                // it to set the data for the resumeViewer and the resumeEditor
                setDataResume({
                    ...data.data[0],
                    resume_generated: {
                        ...resumeData,
                        selected_narrative:
                            resumeData.selected_narrative || 'summary',
                        contact_info: {
                            name: resumeData.contact_info.name
                                ? resumeData.contact_info.name
                                : userInfo.data.first_name +
                                  ' ' +
                                  userInfo.data.last_name,
                            email: resumeData.contact_info.email
                                ? resumeData.contact_info.email
                                : userInfo.data.email,
                            phone: resumeData.contact_info.phone
                                ? resumeData.contact_info.phone
                                : 'PHONE',
                            linkedin: resumeData.contact_info.linkedin
                                ? resumeData.contact_info.linkedin
                                : 'LINKEDIN',
                        },
                    },
                });
            };
            fetchData();
        }
    }, [router, id]);

    return (
        <div className={styles.main_container}>
            <div className={styles.editor_container}>
                <ResumeEditor
                    setDataResume={setDataResume}
                    dataResume={dataResume}
                />
            </div>
            {dataResume.id ? (
                <DynamicResumeViewer dataResume={dataResume} />
            ) : (
                // Mientras carga los datos o si el ID es inválido, no muestra el viewer
                // Puedes mostrar un mensaje más específico si quieres
                <p>Loading resume data...</p>
            )}
        </div>
    );
}
