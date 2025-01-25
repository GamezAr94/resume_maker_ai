import React from 'react';
import {
    Document,
    Page,
    PDFViewer,
    StyleSheet,
    Text,
    View,
} from '@react-pdf/renderer';
import { FormJobOfferDataStructure } from '@/utils/interfaces';
const styles = StyleSheet.create({
    viewer: {
        aspectRatio: '210/297',
        maxWidth: '712px',
        width: '100%',
    },
    page: {
        flexDirection: 'column',
        backgroundColor: 'white',
        padding: 10,
        paddingBottom: 0,
    },
    section: {
        flexGrow: 1,
        backgroundColor: '#E4E4E4',
        fontSize: '12',
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
                        <Text>
                            {dataResume.resume_generated.contact_info.name}
                        </Text>
                        <Text>{dataResume.job_position}</Text>
                        <Text>
                            {dataResume.resume_generated.contact_info.email}|{' '}
                            {dataResume.resume_generated.contact_info.linkedin}|{' '}
                            {dataResume.resume_generated.contact_info.phone}
                        </Text>
                    </View>
                    <View>
                        <Text>Summary</Text>
                        <Text>{dataResume.resume_generated.summary}</Text>
                    </View>
                    <View>
                        <Text>Experience</Text>
                        {dataResume.resume_generated.experience.map(
                            (exp, id) => {
                                return (
                                    <View key={id}>
                                        <Text>{exp.company}</Text>
                                        <Text>{exp.start_end_dates}</Text>
                                        <Text>{exp.title}</Text>
                                        <Text>{exp.description}</Text>
                                        <Text>{exp.relevance}</Text>
                                    </View>
                                );
                            },
                        )}
                    </View>
                    <View>
                        <Text>Education</Text>
                        {dataResume.resume_generated.education.map(
                            (edu, id) => {
                                return (
                                    <View key={id}>
                                        <Text>{edu.degree}</Text>
                                        <Text>{edu.school}</Text>
                                        <Text>{edu.start_end_dates}</Text>
                                    </View>
                                );
                            },
                        )}
                    </View>
                    <View>
                        <Text>Projects</Text>
                        {dataResume.resume_generated.projects.map((pro, id) => {
                            return (
                                <View key={id}>
                                    <Text>{pro.name}</Text>
                                    <Text>{pro.start_end_dates}</Text>
                                    <Text>{pro.relevance}</Text>
                                    <Text>{pro.description}</Text>
                                </View>
                            );
                        })}
                    </View>
                    <View>
                        <Text>Skills</Text>
                        {dataResume.resume_generated.skills.map((skill, id) => {
                            return (
                                <View key={id}>
                                    <Text>{skill}</Text>
                                </View>
                            );
                        })}
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
