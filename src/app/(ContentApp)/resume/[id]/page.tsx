'use client';
import { getDBTableInfo } from '@/app/db/user_queries';
import { SectionTypes } from '@/utils/enums';
import {
    emptyStateJobDataOffer,
    FormJobOfferDataStructure,
} from '@/utils/interfaces';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, SetStateAction } from 'react';
import styles from './page.module.css';
import ResumeEditor from '@/app/components/resumeViewer/resumeEditor';
import dynamic from 'next/dynamic';
import { ensureLayoutIsOrderedArray } from '@/utils/utils';
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

    const [viewerKey, setViewerKey] = useState(0);

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
                // TODO we dont need to fetch the supabase_id from the user info

                // IMPORTANT: The order of the layout items is important for the viewer
                // We want to reorder the layout items to match the desired order
                // The desired order is:
                const desiredSectionsOrder = {
                    narrative: 0,
                    experience: 1,
                    projects: 2,
                    education: 3,
                    skills: 4,
                };

                // TODO we also need to sort the items in the experience and projects sections
                const reorderedLayoutArray = ensureLayoutIsOrderedArray(
                    resumeData.layout,
                    desiredSectionsOrder,
                    'id',
                );

                // set the data returned from the database to the state and prepare
                // it to set the data for the resumeViewer and the resumeEditor
                setDataResume({
                    ...data.data[0],
                    resume_generated: {
                        layout: reorderedLayoutArray,
                        recommendations: resumeData.recommendations,
                        explanation: resumeData.explanation,
                        // TODO: hmm not sure if this is the best way to do it using the selected_narrative
                        selected_narrative:
                            resumeData.selected_narrative || 'summary',
                        contact_info: {
                            name:
                                resumeData.contact_info?.name !== null &&
                                resumeData.contact_info?.name !== undefined
                                    ? resumeData.contact_info.name
                                    : userInfo.data.first_name +
                                      ' ' +
                                      userInfo.data.last_name,
                            email:
                                resumeData.contact_info?.email !== null &&
                                resumeData.contact_info?.email !== undefined
                                    ? resumeData.contact_info.email
                                    : userInfo.data.email,
                            phone:
                                resumeData.contact_info?.phone !== null &&
                                resumeData.contact_info?.phone !== undefined
                                    ? resumeData.contact_info.phone
                                    : userInfo.data.phone,
                            linkedin:
                                resumeData.contact_info?.linkedin !== null &&
                                resumeData.contact_info?.linkedin !== undefined
                                    ? resumeData.contact_info.linkedin
                                    : userInfo.data.linkedin_url,
                            github:
                                resumeData.contact_info?.github !== null &&
                                resumeData.contact_info?.github !== undefined
                                    ? resumeData.contact_info.github
                                    : userInfo.data.github_url,
                            portfolio:
                                resumeData.contact_info?.portfolio !== null &&
                                resumeData.contact_info?.portfolio !== undefined
                                    ? resumeData.contact_info.portfolio
                                    : userInfo.data.portfolio_url,
                        },
                        styles: {
                            theme: resumeData.styles?.theme || 'classic',
                        },
                    },
                });
            };
            fetchData();
        }
    }, [router, id]);

    // Function to update the resume data and remount the viewer
    // This is useful when the user edits the resume and we want to refresh the viewer
    // to reflect the changes immediately without having to reload the page
    // This function is passed to the ResumeEditor component
    // and is called when the user saves the changes in the editor
    const updateResumeAndRemountViewer = (
        updater: SetStateAction<FormJobOfferDataStructure>,
    ) => {
        setDataResume(updater);
        setViewerKey((prevKey) => prevKey + 1);
    };

    return (
        <div className={styles.main_container}>
            <div className={styles.editor_container}>
                <ResumeEditor
                    setDataResume={updateResumeAndRemountViewer}
                    dataResume={dataResume}
                />
            </div>
            {dataResume.id ? (
                <DynamicResumeViewer
                    dataResume={dataResume}
                    viewerKey={viewerKey}
                />
            ) : (
                // Mientras carga los datos o si el ID es inválido, no muestra el viewer
                // Puedes mostrar un mensaje más específico si quieres
                <p>Loading resume data...</p>
            )}
        </div>
    );
}
