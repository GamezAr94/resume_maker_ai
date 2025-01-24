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
        paddingBottom: 50,
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
                    <Text>Name: John Doe</Text>
                    <Text>Email: john.doe@example.com</Text>
                    <Text>Message: Hello from react-pdf</Text>
                    <Text>Message: Hello from react-pdf</Text>
                    <Text>{dataResume.resume_generated.contact_info.name}</Text>
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
