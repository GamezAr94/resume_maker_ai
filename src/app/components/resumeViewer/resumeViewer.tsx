import React from 'react';
import {
    Document,
    Font,
    Page,
    PDFViewer,
    StyleSheet,
    Text,
    View,
} from '@react-pdf/renderer';
import { FormJobOfferDataStructure } from '@/utils/interfaces';
/*
Font.register({
    family: 'Open Sans',
    fonts: [
        {
            src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf',
        },
        {
            src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf',
            fontWeight: 600,
        },
    ],
});
*/
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
        width: '90%',
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
        <Document pageMode="fullScreen">
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <View>
                        <Text style={styles.user_name}>
                            {dataResume.resume_generated.contact_info.name}
                        </Text>
                        <Text
                            style={{ ...styles.position, ...styles.highlight }}
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
                                width: '30%',
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
                                                <Text>{edu.degree}</Text>
                                                <Text
                                                    style={{
                                                        ...styles.subtitle_higlighted,
                                                        ...styles.highlight,
                                                    }}
                                                >
                                                    {edu.school}
                                                </Text>
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
export default function test({ dataResume }: Props) {
    return (
        <div>
            <PDFViewer showToolbar={false} style={styles.viewer}>
                <MyDocument dataResume={dataResume} />
            </PDFViewer>
        </div>
    );
}
