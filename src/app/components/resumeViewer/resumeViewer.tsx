'use client';
import React from 'react';
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
                        <Text style={styles.section_title}>
                            Career Objective
                        </Text>
                        <Text>
                            {dataResume.resume_generated.career_objective}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.section_title}>Summary</Text>
                        <Text>{dataResume.resume_generated.summary}</Text>
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
                                                    {exp.title}
                                                </Text>
                                                <Text
                                                    style={{
                                                        ...styles.subtitle_higlighted,
                                                        ...styles.highlight,
                                                    }}
                                                >
                                                    {exp.company}
                                                </Text>
                                                <Text>
                                                    {exp.start_end_dates}
                                                </Text>
                                                <Text>
                                                    {exp.responsabilities}
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
                                                    {pro.name}
                                                </Text>
                                                <Text>
                                                    {pro.start_end_dates}
                                                </Text>
                                                <Text>{pro.relevance}</Text>
                                                <Text>{pro.description}</Text>
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
                                                    {edu.degree}
                                                </Text>
                                                <Text>{edu.school}</Text>
                                                <Text>{edu.minor}</Text>
                                                <Text>
                                                    {edu.start_end_dates}
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
                                                <Text>- {skill}</Text>
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
export default function resumeViewer({ dataResume }: Props) {
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
            <PDFViewer showToolbar={false} style={styles.viewer}>
                <MyDocument dataResume={dataResume} />
            </PDFViewer>
            <div className={styles_css.action_buttons_container}>
                <button>Save</button>
                <button onClick={gettingPDF}>Download PDF</button>
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
