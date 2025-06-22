import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';
import { FormJobOfferDataStructure } from '@/utils/interfaces';

/*
 NOTE: This is very tricky ... to set up a new font we need to go to this link: 
 https://developers.google.com/fonts/docs/developer_api?apix_params=%7B%22family%22%3A%5B%22Roboto%22%5D%2C%22sort%22%3A%22ALPHA%22%7D
 then we need to click on the API option on the right side of the screen, and then we can perform a query to get the font we want to use
 for example we can sort by ALPHA and the family Roboto. then you will get a result with all the information of the font
 you just need to copy the url from the style that you want for example the bold "900", and then you can paste that URL in the font.register
 and then you can set the fontWeight for each of your fonts you want to use, so when you assign a fontFamily to a component you need to specify the weight to target that specific font
*/
// Register the font with react-pdf
/*
Font.register({
    family: 'Roboto', // The name you'll use in react-pdf
    fonts: [
        {
            src: 'https://fonts.gstatic.com/s/roboto/v47/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuZtammTggvWl0Qn.ttf', // The actual font file URL
            fontWeight: 900,
        },
        {
            src: 'https://fonts.gstatic.com/s/roboto/v47/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbWmTggvWl0Qn.ttf', // The actual font file URL
        },
    ],
    fontStyle: 'normal', // or 'italic' if needed
    fontWeight: 900, // or the appropriate weight
});
    */

// Keep any font registration here. It will run once when the module is imported.
Font.registerHyphenationCallback((word) => [word]);

// Define the Props interface for the template
interface TemplateProps {
    dataResume: FormJobOfferDataStructure;
}

// Export the styles so they can be used by other components if needed (e.g., for the viewer's dimensions)
export const styles = StyleSheet.create({
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

// Export the main Document component. We've renamed it for clarity.
export const ClassicResumeTemplate = ({ dataResume }: TemplateProps) => {
    // You can add data validation here as well
    if (!dataResume || !dataResume.resume_generated) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={{ padding: 20 }}>
                        <Text>Generating resume...</Text>
                    </View>
                </Page>
            </Document>
        );
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ... The rest of your JSX template goes here ... */}
                {/* I am pasting the full JSX from your example below */}
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
                        <Text style={styles.section_title}>Summary</Text>
                        <Text>
                            {dataResume.resume_generated.selected_narrative ===
                            'summary'
                                ? dataResume.resume_generated.summary
                                : dataResume.resume_generated.career_objective}
                        </Text>
                    </View>
                    <View style={styles.content_resume}>
                        <View style={{ width: '70%' }}>
                            {/* Experience Section */}
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
                                    (exp, id) =>
                                        // This pattern is now used for all sections.
                                        exp.display !== false && (
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
                                        ),
                                )}
                            </View>
                            {/* Projects Section */}
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
                                    (pro, id) =>
                                        pro.display !== false && (
                                            <View key={id}>
                                                <Text
                                                    style={
                                                        styles.section_subtitle
                                                    }
                                                >
                                                    {pro.name}
                                                </Text>
                                                <Text>
                                                    {pro.start_end_dates}
                                                </Text>
                                                <Text>{pro.description}</Text>
                                            </View>
                                        ),
                                )}
                            </View>
                        </View>
                        <View style={{ width: '25%' }}>
                            {/* Education Section */}
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
                                    (edu, id) =>
                                        edu.display !== false && (
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
                                        ),
                                )}
                            </View>
                            {/* Skills Section */}
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
                                    (skill, id) =>
                                        skill !== '' && (
                                            <Text key={id}>{skill}</Text>
                                        ),
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
