'use client';
import {
    emptyStateJobDataOffer,
    FormJobOfferDataStructure,
} from '@/utils/interfaces';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, SetStateAction } from 'react';
import styles from './page.module.css';
import ResumeEditor from '@/app/components/resumeViewer/resumeEditor';
import dynamic from 'next/dynamic';
import {
    ensureLayoutIsOrderedArray,
    generateNetworkingLinks,
} from '@/utils/utils';
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
                try {
                    const appResponse = await fetch(`/api/applications/${id}`);
                    if (!appResponse.ok) {
                        router.push(`/`); // Redirect if resume not found or not authorized
                        return;
                    }
                    const data = { data: [await appResponse.json()] }; // Match original structure

                    const userResponse = await fetch('/api/profile');
                    if (!userResponse.ok)
                        throw new Error('Could not fetch user profile.');
                    const userInfo = { data: await userResponse.json() }; // Match original structure

                    let resumeData = data.data[0].resume_generated;
                    // make sure we are sending a JSON object
                    if (typeof resumeData != 'object') {
                        resumeData = JSON.parse(resumeData);
                    }

                    // generating links for linkedin
                    let networkingLinks = resumeData.networkingLinks;
                    // Check if links are missing or empty
                    if (!networkingLinks || networkingLinks.length === 0) {
                        // Generate them since they don't exist
                        networkingLinks = generateNetworkingLinks(
                            data.data[0].company_name,
                            data.data[0].job_position,
                        );
                    }

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
                            outreachMessages: resumeData.outreachMessages || null,
                            feedback: resumeData.feedback || null,
                            keywords: resumeData.keywords || [],
                            networkingLinks: networkingLinks,
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
                                    resumeData.contact_info?.linkedin !==
                                        null &&
                                    resumeData.contact_info?.linkedin !==
                                        undefined
                                        ? resumeData.contact_info.linkedin
                                        : userInfo.data.linkedin_url,
                                github:
                                    resumeData.contact_info?.github !== null &&
                                    resumeData.contact_info?.github !==
                                        undefined
                                        ? resumeData.contact_info.github
                                        : userInfo.data.github_url,
                                portfolio:
                                    resumeData.contact_info?.portfolio !==
                                        null &&
                                    resumeData.contact_info?.portfolio !==
                                        undefined
                                        ? resumeData.contact_info.portfolio
                                        : userInfo.data.portfolio_url,
                            },
			    styles: {
                                theme: resumeData.styles?.theme || 'modern',
                                accentColor: resumeData.styles?.accentColor,
                                headerColor: resumeData.styles?.headerColor,
                                fontSize: resumeData.styles?.fontSize || 'medium',
                                lineSpacing: resumeData.styles?.lineSpacing || 'normal',
                                pageMargin: resumeData.styles?.pageMargin || 'normal',
                            },
                        },
                    });
                } catch (error) {
                    console.error('Failed to fetch resume data:', error);
                }
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
                    setDataResume={setDataResume}
                />
            ) : (
                // Mientras carga los datos o si el ID es inválido, no muestra el viewer
                // Puedes mostrar un mensaje más específico si quieres
                <p>Loading resume data...</p>
            )}
        </div>
    );
}
