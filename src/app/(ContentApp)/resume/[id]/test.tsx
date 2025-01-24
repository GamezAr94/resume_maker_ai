import React from 'react';
import {
    Document,
    Page,
    PDFViewer,
    StyleSheet,
    Text,
    View,
} from '@react-pdf/renderer';
const styles = StyleSheet.create({
    viewer: {
        aspectRatio: '210/297',
        maxWidth: '612px',
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
    },
});

const MyDocument = ({ getPDF }: { getPDF: string }) => {
    return (
        <Document pageMode="fullScreen">
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text>Name: John Doe</Text>
                    <Text>Email: john.doe@example.com</Text>
                    <Text>Message: Hello from react-pdf</Text>
                    <Text>Message: Hello from react-pdf</Text>
                    <Text>{getPDF}</Text>
                </View>
            </Page>
        </Document>
    );
};
export default function test({ getPDF }: { getPDF: string }) {
    return (
        <PDFViewer showToolbar={false} style={styles.viewer}>
            <MyDocument getPDF={getPDF} />
        </PDFViewer>
    );
}
