'use server';
import { FormJobOfferDataStructure } from '@/utils/interfaces';
import React from 'react';
import {
    Document,
    Font,
    Page,
    StyleSheet,
    Text,
    View,
} from '@react-pdf/renderer';
import ReactPDF from '@react-pdf/renderer';
import { NextResponse } from 'next/server';

interface Props {
    dataResume: FormJobOfferDataStructure;
}

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

// Template for the PDF Resume
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
                                                <Text>
                                                    {pro.display ||
                                                    pro.display == undefined
                                                        ? pro.relevance
                                                        : ''}
                                                </Text>
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

export async function POST(req: Request) {
    const requestBody = await req.json();
    const pdfData = requestBody.data;

    // verify that the data is not empty
    if (!pdfData) {
        return NextResponse.json(
            {
                message: 'PDF Resume Handler POST',
            },
            { status: 500 },
        );
    }

    try {
        const stream = await ReactPDF.renderToStream(
            <MyDocument dataResume={pdfData} />,
        );

        return new NextResponse(stream as unknown as ReadableStream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=resume.pdf', // Trigger download
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { message: 'Error generating PDF' },
            { status: 500 },
        );
    }
}
