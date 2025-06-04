'use client';
import React, { useEffect, useState } from 'react';
import styles_css from './resumeViewer.module.css';
import {
    Document,
    Page,
    PDFViewer,
    Font,
    StyleSheet,
    Text,
    View,
} from '@react-pdf/renderer';
import { FormJobOfferDataStructure } from '@/utils/interfaces';
import { Button } from '@mantine/core';
import { SectionTypes } from '@/utils/enums';

// this is a hack to avoid the hyphenation of words
Font.registerHyphenationCallback((word) => [word]);

// Template for the styles for the PDF Resume
const styles = StyleSheet.create({
    viewer: {
        aspectRatio: '210/297',
        maxWidth: '712px',
        width: '100%',
        fontWeight: 'bold',
    },
    page: {
        flexDirection: 'column',
        backgroundColor: 'white',
        padding: 10,
        paddingBottom: 0,
        fontSize: '13pt',
    },
    section: {
        flexGrow: 1,
        backgroundColor: '#E4E4E4',
    },
    highlight: {
        color: '#fa8072',
    },
    user_name: {
        fontFamily: 'Helvetica-Bold',
        fontSize: '28pt',
    },
    position: {
        fontFamily: 'Helvetica-Bold',
        fontSize: '20pt',
    },
    contact_section: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        flexWrap: 'wrap',
        gap: '5%',
    },
    section_title: {
        fontFamily: 'Helvetica-Bold',
        fontSize: '20pt',
    },
    divider: {
        borderBottom: '3px solid black',
    },
    section_subtitle: {
        fontSize: '17pt',
        fontFamily: 'Helvetica-Bold',
        //fontFamily: 'Roboto',
        fontWeight: 900,
    },
    subtitle_higlighted: {
        fontFamily: 'Helvetica-Bold',
        fontSize: '13pt',
    },
    content_resume: {
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
    },
});

interface Props {
    dataResume: FormJobOfferDataStructure;
}
const MyDocument = ({ dataResume }: Props) => {
    if (!dataResume.resume_generated) {
        return (
            <Document>
                <Page>
                    <View>
                        <Text>Error: Resume data missing.</Text>
                    </View>
                </Page>
            </Document>
        );
    }
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <View>
                        <Text style={styles.user_name}>
                            {dataResume.resume_generated.contact_info.name}
                        </Text>
                        <Text
                            style={{
                                ...styles.position,
                                ...styles.highlight,
                            }}
                        >
                            {dataResume.job_position}
                        </Text>
                        <View style={styles.contact_section}>
                            <Text>
                                {dataResume.resume_generated.contact_info.email}
                            </Text>
                            <Text>
                                {
                                    dataResume.resume_generated.contact_info
                                        .linkedin
                                }
                            </Text>
                            <Text>
                                {dataResume.resume_generated.contact_info.phone}
                            </Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.section_title}>Summary</Text>
                        <Text>
                            {dataResume.resume_generated.selected_narrative ==
                            'summary'
                                ? dataResume.resume_generated.summary
                                : dataResume.resume_generated.career_objective}
                        </Text>
                    </View>

                    <View style={styles.content_resume}>
                        <View style={{ width: '70%' }}>
                            <View>
                                <Text
                                    style={{
                                        ...styles.section_title,
                                        ...styles.divider,
                                    }}
                                >
                                    Experience
                                </Text>
                                {dataResume.resume_generated.experience.map(
                                    (exp, id) => {
                                        return (
                                            <View key={id}>
                                                <Text
                                                    style={
                                                        styles.section_subtitle
                                                    }
                                                >
                                                    {exp.display ||
                                                    exp.display == undefined
                                                        ? exp.title
                                                        : ''}
                                                </Text>
                                                <Text
                                                    style={{
                                                        ...styles.subtitle_higlighted,
                                                        ...styles.highlight,
                                                    }}
                                                >
                                                    {exp.display ||
                                                    exp.display == undefined
                                                        ? exp.company
                                                        : ''}
                                                </Text>
                                                <Text>
                                                    {exp.display ||
                                                    exp.display == undefined
                                                        ? exp.start_end_dates
                                                        : ''}
                                                </Text>
                                                {/*NOTE: We also have the responsabilities key not sure why though
                                                <Text>
                                                    {exp.display ||
                                                    exp.display == undefined
                                                        ? exp.responsabilities
                                                        : ''}
                                                </Text>*/}
                                                <Text>
                                                    {exp.display ||
                                                    exp.display == undefined
                                                        ? exp.responsabilities
                                                        : ''}
                                                </Text>
                                            </View>
                                        );
                                    },
                                )}
                            </View>
                            <View>
                                <Text
                                    style={{
                                        ...styles.section_title,
                                        ...styles.divider,
                                    }}
                                >
                                    Projects
                                </Text>
                                {dataResume.resume_generated.projects.map(
                                    (pro, id) => {
                                        return (
                                            <View key={id}>
                                                <Text
                                                    style={{
                                                        ...styles.section_subtitle,
                                                    }}
                                                >
                                                    {pro.display ||
                                                    pro.display == undefined
                                                        ? pro.name
                                                        : ''}
                                                </Text>
                                                <Text>
                                                    {pro.display ||
                                                    pro.display == undefined
                                                        ? pro.start_end_dates
                                                        : ''}
                                                </Text>
                                                {/*This is to explain why project is relevant to this job
                                                <Text>
                                                    {pro.display ||
                                                    pro.display == undefined
                                                        ? pro.relevance
                                                        : ''}
                                                </Text>*/}
                                                <Text>
                                                    {pro.display ||
                                                    pro.display == undefined
                                                        ? pro.description
                                                        : ''}
                                                </Text>
                                            </View>
                                        );
                                    },
                                )}
                            </View>
                        </View>
                        <View
                            style={{
                                width: '25%',
                            }}
                        >
                            <View>
                                <Text
                                    style={{
                                        ...styles.section_title,
                                        ...styles.divider,
                                    }}
                                >
                                    Education
                                </Text>
                                {dataResume.resume_generated.education.map(
                                    (edu, id) => {
                                        return (
                                            <View key={id}>
                                                <Text
                                                    style={{
                                                        ...styles.subtitle_higlighted,
                                                        ...styles.highlight,
                                                    }}
                                                >
                                                    {edu.display ||
                                                    edu.display == undefined
                                                        ? edu.degree
                                                        : ''}
                                                </Text>
                                                <Text>
                                                    {edu.display ||
                                                    edu.display == undefined
                                                        ? edu.school
                                                        : ''}
                                                </Text>
                                                <Text>
                                                    {edu.display ||
                                                    edu.display == undefined
                                                        ? edu.minor
                                                        : ''}
                                                </Text>
                                                <Text>
                                                    {edu.display ||
                                                    edu.display == undefined
                                                        ? edu.start_end_dates
                                                        : ''}
                                                </Text>
                                            </View>
                                        );
                                    },
                                )}
                            </View>
                            <View>
                                <Text
                                    style={{
                                        ...styles.section_title,
                                        ...styles.divider,
                                    }}
                                >
                                    Skills
                                </Text>
                                {dataResume.resume_generated.skills.map(
                                    (skill, id) => {
                                        return (
                                            <View key={id}>
                                                <Text>
                                                    {skill != ''
                                                        ? `- ${skill}`
                                                        : ''}
                                                </Text>
                                            </View>
                                        );
                                    },
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
export default function ResumeViewer({ dataResume }: Props) {
    const [isFirefox, setIsFirefox] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // This code runs only on the client side after the component mounts
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Firefox')) {
            setIsFirefox(true);
        }
    }, []);

    // function to handle saving the resume data
    // This function will be called when the user clicks the Save button
    // It will send the dataResume object to the server to be saved
    async function handleSave() {
        if (isSaving || !dataResume || !dataResume.id) {
            // Don't save if already saving, or if there's no data/ID (shouldn't happen in this context)
            console.warn(
                'Save conditions not met. Current dataResume ID:',
                dataResume?.id,
            );
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch('/api/saveUserInfo', {
                // Use root-relative path
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: SectionTypes.JobOffer, // Tell the API what type of data this is
                    data: dataResume, // Send the whole dataResume object
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save resume.');
            }

            // TODO: Show a success notification to the user (e.g., using Mantine Notifications)
            alert('Resume saved successfully!'); // Placeholder
        } catch (error) {
            console.error('Error saving resume:', error);
            // TODO: Show an error notification to the user
            alert(
                `Error saving resume: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            ); // Placeholder
        } finally {
            setIsSaving(false);
        }
    }

    // Function to validate the user data and save it
    async function gettingPDF() {
        // Prevent multiple calls if already downloading
        if (isDownloading) return;

        setIsDownloading(true);

        try {
            const res = await fetch('../api/pdfResume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: dataResume,
                }),
            });
            // verify we get a good response
            if (!res.ok) {
                const errorData = await res.json();
                // TODO show a proper error message to the user
                throw new Error(errorData.message || 'Failed to download PDF');
            }

            const blob = await res.blob(); // Get the PDF as a Blob
            const url = window.URL.createObjectURL(blob); // Create a temporary URL

            // Create a temporary link and click it to trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume.pdf'; // Suggested filename
            document.body.appendChild(a); // Append to the DOM (required for Firefox)
            a.click();
            a.remove(); // Clean up

            window.URL.revokeObjectURL(url); // Release the object URL
        } catch (error) {
            // TODO show a proper error message to the user
            console.error('Error downloading PDF:', error);
        } finally {
            setIsDownloading(false); // Reset the downloading state
        }
    }
    return (
        <div className={styles_css.resume_viewer_container}>
            {isFirefox && (
                <div className={styles_css.firefox_cover_container}></div>
            )}
            <PDFViewer showToolbar={false} style={styles.viewer}>
                <MyDocument dataResume={dataResume} />
            </PDFViewer>
            <div className={styles_css.action_buttons_container}>
                <Button
                    variant="outline"
                    onClick={handleSave}
                    disabled={isDownloading || isSaving}
                    loading={isSaving}
                >
                    Save
                </Button>
                <Button
                    onClick={gettingPDF}
                    disabled={isDownloading || isSaving} // <<<--- DISABLE BUTTON WHEN DOWNLOADING OR SAVING
                    loading={isDownloading} // <<<--- SHOW MANTINE'S LOADING SPINNER
                >
                    Download PDF
                </Button>
            </div>
        </div>
    );
}

/*
// NOTE: THIS CODE is a pseudo solution, I tried to create my own PDF visualizer but it is not as good as jus tdisplaying the default PDF viewer from this library
// I didnt want to use the default because it is showing the tooldbar and I want to hide it (it will be displayed in firefox ONLY)

import React from 'react';
import styles_css from './resumeViewer.module.css';
import { FormJobOfferDataStructure } from '@/utils/interfaces';
import PDFDocument from './pdfDocument';

interface Props {
    dataResume: FormJobOfferDataStructure;
}
export default function ResumeViewer({ dataResume }: Props) {
    // Function to validate the user data and save it
    async function gettingPDF() {
        try {
            const res = await fetch('../api/pdfResume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    //data: Object.fromEntries(formData),
                    data: dataResume,
                }),
            });
            // verify we get a good response
            if (!res.ok) {
                const errorData = await res.json();
                // TODO show a proper error message to the user
                throw new Error(errorData.message || 'Failed to download PDF');
            }

            const blob = await res.blob(); // Get the PDF as a Blob
            const url = window.URL.createObjectURL(blob); // Create a temporary URL

            // Create a temporary link and click it to trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume.pdf'; // Suggested filename
            document.body.appendChild(a); // Append to the DOM (required for Firefox)
            a.click();
            a.remove(); // Clean up

            window.URL.revokeObjectURL(url); // Release the object URL
        } catch (error) {
            // TODO show a proper error message to the user
            console.error('Error downloading PDF:', error);
        }
    }

    return (
        <div className={styles_css.resume_viewer_container}>
            <PDFDocument dataResume={dataResume} />
            <div className={styles_css.action_buttons_container}>
                <button>Save</button>
                <button onClick={gettingPDF}>Download PDF</button>
            </div>
        </div>
    );
}
*/
