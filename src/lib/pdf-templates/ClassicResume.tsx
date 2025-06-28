import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    Font,
    Link,
} from '@react-pdf/renderer';
import { FormJobOfferDataStructure } from '@/utils/interfaces';

// --- FONT REGISTRATION ---
/*
 NOTE: This is very tricky ... to set up a new font we need to go to this link: 
 https://developers.google.com/fonts/docs/developer_api?apix_params=%7B%22family%22%3A%5B%22Roboto%22%5D%2C%22sort%22%3A%22ALPHA%22%7D
 then we need to click on the API option on the right side of the screen, and then we can perform a query to get the font we want to use
 for example we can sort by ALPHA and the family Roboto. then you will get a result with all the information of the font
 you just need to copy the url from the style that you want for example the bold "900", and then you can paste that URL in the font.register
 and then you can set the fontWeight for each of your fonts you want to use, so when you assign a fontFamily to a component you need to specify the weight to target that specific font
*/
// Register fonts
Font.register({
    family: 'Lato',
    fonts: [
        {
            src: 'https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHjxswWyWrFCbw7A.ttf', // The actual font file URL
            fontWeight: 400,
            fontStyle: 'italic', // Optional: if you have italic version. It will break if not specified
        },
        {
            src: 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHvxk6XweuBCY.ttf', // The actual font file URL
            fontWeight: 400,
        },
        {
            src: 'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVew-FGC_p9dw.ttf', // The actual font file URL
            fontWeight: 700,
        },
    ],
});

// This prevents words from being cut off awkwardly.
Font.registerHyphenationCallback((word) => [word]);

// --- THEME & COLORS ---
const theme = {
    primary: '#2C3E50',
    secondary: '#FFFFFF',
    accent: '#3498DB',
    textPrimary: '#FFFFFF',
    textSecondary: '#2C3E50',
    textMuted: '#808080',
};

// --- STYLESHEET ---
export const styles = StyleSheet.create({
    viewer: {
        aspectRatio: '210/297',
        maxWidth: '712px',
        width: '100%',
    },
    page: {
        fontFamily: 'Lato',
        fontWeight: 400,
        flexDirection: 'row',
        backgroundColor: theme.secondary,
    },
    sidebar: {
        width: '32%',
        backgroundColor: theme.primary,
        color: theme.textPrimary,
        padding: 30,
    },
    mainContent: {
        width: '65%',
        padding: '20px 30px',
    },
    header: {
        marginBottom: 0,
    },
    userName: {
        fontSize: 32,
        fontFamily: 'Lato',
        fontWeight: 700,
        color: theme.accent,
        marginBottom: 0,
    },
    jobPosition: {
        fontSize: 16,
        color: theme.textSecondary,
        marginBottom: 10,
        fontWeight: 400,
    },
    sidebarSection: {
        marginBottom: 20,
    },
    sidebarTitle: {
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 10,
        color: theme.accent,
        textTransform: 'uppercase',
    },
    contactItem: {
        fontSize: 10,
        marginBottom: 6,
        fontWeight: 400,
    },
    contactLink: {
        fontSize: 10,
        color: theme.textPrimary,
        textDecoration: 'none',
        fontWeight: 400,
    },
    skill: {
        fontSize: 10,
        marginBottom: 5,
        fontWeight: 400,
    },
    educationEntry: {
        marginBottom: 12,
    },
    degree: {
        fontSize: 11,
        fontWeight: 700,
    },
    school: {
        fontSize: 10,
        fontWeight: 400,
    },
    educationDates: {
        fontSize: 9,
        color: theme.textMuted,
        fontStyle: 'italic',
        fontWeight: 400,
    },
    mainSection: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.accent,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    sectionDivider: {
        borderBottom: `1px solid ${theme.accent}`,
        marginBottom: 8,
    },
    entryContainer: {
        marginBottom: 10,
    },
    jobTitle: {
        fontSize: 13,
        fontWeight: 700,
    },
    companyAndDate: {
        fontSize: 11,
        fontStyle: 'italic',
        color: theme.textMuted,
        marginBottom: 6,
        fontWeight: 400,
    },
    description: {
        fontSize: 10,
        textAlign: 'justify',
        fontWeight: 400,
    },
});

// --- TEMPLATE COMPONENT ---
export const ClassicResumeTemplate = ({
    dataResume,
}: {
    dataResume: FormJobOfferDataStructure;
}) => {
    if (!dataResume || !dataResume.resume_generated) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={{ padding: 30 }}>
                        <Text>Generating resume...</Text>
                    </View>
                </Page>
            </Document>
        );
    }

    const { resume_generated, job_position } = dataResume;

    return (
        <Document
            author={resume_generated.contact_info.name}
            title={`Resume for ${job_position}`}
        >
            <Page size="A4" style={styles.page}>
                <View style={styles.sidebar}>
                    <View style={styles.sidebarSection}>
                        <Text style={styles.sidebarTitle}>Contact</Text>
                        <Text style={styles.contactItem}>
                            {resume_generated.contact_info.phone}
                        </Text>
                        <Link
                            style={styles.contactLink}
                            src={`mailto:${resume_generated.contact_info.email}`}
                        >
                            {resume_generated.contact_info.email}
                        </Link>
                        <Link
                            style={styles.contactLink}
                            src={resume_generated.contact_info.linkedin}
                        >
                            {resume_generated.contact_info.linkedin}
                        </Link>
                    </View>

                    {resume_generated?.layout?.map((section, idx) => {
                        // Use a switch on the 'id' property as a type guard
                        switch (section.id) {
                            case 'education':
                                return section.display ? (
                                    <View
                                        key={`education-title-${idx}`}
                                        style={styles.sidebarSection}
                                    >
                                        <Text style={styles.sidebarTitle}>
                                            {section.title}
                                        </Text>

                                        {section.items.map(
                                            (edu, id) =>
                                                edu.display !== false && (
                                                    <View
                                                        key={id}
                                                        style={
                                                            styles.educationEntry
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.degree
                                                            }
                                                        >
                                                            {edu.degree}
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.school
                                                            }
                                                        >
                                                            {edu.school}
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.educationDates
                                                            }
                                                        >
                                                            {
                                                                edu.start_end_dates
                                                            }
                                                        </Text>
                                                    </View>
                                                ),
                                        )}
                                    </View>
                                ) : null;
                            case 'skills':
                                return section.display ? (
                                    <View
                                        key={`skills-title-${idx}`}
                                        style={styles.sidebarSection}
                                    >
                                        <Text style={styles.sidebarTitle}>
                                            {section.title}
                                        </Text>

                                        {section.items.map(
                                            (skill, id) =>
                                                skill && (
                                                    <Text
                                                        key={id}
                                                        style={styles.skill}
                                                    >
                                                        • {skill}
                                                    </Text>
                                                ),
                                        )}
                                    </View>
                                ) : null;
                            default:
                                return null; // Or some fallback UI
                        }
                    })}
                </View>
                <View style={styles.mainContent}>
                    <View style={styles.header}>
                        <Text style={styles.userName}>
                            {resume_generated.contact_info.name}
                        </Text>
                        <Text style={styles.jobPosition}>{job_position}</Text>
                    </View>

                    <View style={styles.sectionDivider} />
                    {resume_generated?.layout?.map((section, idx) => {
                        // Use a switch on the 'id' property as a type guard
                        switch (section.id) {
                            case 'narrative':
                                return section.display ? (
                                    <View
                                        key={`narrative-title-${idx}`}
                                        style={styles.mainSection}
                                    >
                                        <Text style={styles.sectionTitle}>
                                            {section.title}
                                        </Text>

                                        <Text style={styles.description}>
                                            {section.items}
                                        </Text>
                                    </View>
                                ) : null;
                            case 'experience':
                                return section.display ? (
                                    <View
                                        key={`experience-title-${idx}`}
                                        style={styles.mainSection}
                                    >
                                        <Text style={styles.sectionTitle}>
                                            {section.title}
                                        </Text>

                                        {section.items.map(
                                            (exp, id) =>
                                                exp.display !== false && (
                                                    <View
                                                        key={id}
                                                        style={
                                                            styles.entryContainer
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.jobTitle
                                                            }
                                                        >
                                                            {exp.title}
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.companyAndDate
                                                            }
                                                        >
                                                            {exp.company} |{' '}
                                                            {
                                                                exp.start_end_dates
                                                            }
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.description
                                                            }
                                                        >
                                                            {
                                                                exp.responsabilities
                                                            }
                                                        </Text>
                                                    </View>
                                                ),
                                        )}
                                    </View>
                                ) : null;
                            case 'projects':
                                return section.display ? (
                                    <View
                                        key={`projects-title-${idx}`}
                                        style={styles.mainSection}
                                    >
                                        <Text style={styles.sectionTitle}>
                                            {section.title}
                                        </Text>

                                        {section.items.map(
                                            (pro, id) =>
                                                pro.display !== false && (
                                                    <View
                                                        key={id}
                                                        style={
                                                            styles.entryContainer
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.jobTitle
                                                            }
                                                        >
                                                            {pro.name}
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.companyAndDate
                                                            }
                                                        >
                                                            {
                                                                pro.start_end_dates
                                                            }
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.description
                                                            }
                                                        >
                                                            {pro.description}
                                                        </Text>
                                                    </View>
                                                ),
                                        )}
                                    </View>
                                ) : null;
                            default:
                                return null; // Or some fallback UI
                        }
                    })}
                </View>

                {/*

                    <View style={styles.sidebarSection}>
                        <Text style={styles.sidebarTitle}>Education</Text>
                        {resume_generated.education.map(
                            (edu, id) =>
                                edu.display !== false && (
                                    <View
                                        key={id}
                                        style={styles.educationEntry}
                                    >
                                        <Text style={styles.degree}>
                                            {edu.degree}
                                        </Text>
                                        <Text style={styles.school}>
                                            {edu.school}
                                        </Text>
                                        <Text style={styles.educationDates}>
                                            {edu.start_end_dates}
                                        </Text>
                                    </View>
                                ),
                        )}
                    </View>

                    <View style={styles.sidebarSection}>
                        <Text style={styles.sidebarTitle}>Skills</Text>
                        {resume_generated.skills.map(
                            (skill, id) =>
                                skill && (
                                    <Text key={id} style={styles.skill}>
                                        • {skill}
                                    </Text>
                                ),
                        )}
                    </View>
                </View>

                <View style={styles.mainContent}>
                    <View style={styles.header}>
                        <Text style={styles.userName}>
                            {resume_generated.contact_info.name}
                        </Text>
                        <Text style={styles.jobPosition}>{job_position}</Text>
                    </View>

                    <View style={styles.mainSection}>
                        <Text style={styles.sectionTitle}>
                            {resume_generated.selected_narrative === 'summary'
                                ? 'Professional Summary'
                                : 'Career Objective'}
                        </Text>
                        <View style={styles.sectionDivider} />
                        <Text style={styles.description}>
                            {resume_generated.selected_narrative === 'summary'
                                ? resume_generated.summary
                                : resume_generated.career_objective}
                        </Text>
                    </View>

                    <View style={styles.mainSection}>
                        <Text style={styles.sectionTitle}>Work Experience</Text>
                        <View style={styles.sectionDivider} />
                        {resume_generated.experience.map(
                            (exp, id) =>
                                exp.display !== false && (
                                    <View
                                        key={id}
                                        style={styles.entryContainer}
                                    >
                                        <Text style={styles.jobTitle}>
                                            {exp.title}
                                        </Text>
                                        <Text style={styles.companyAndDate}>
                                            {exp.company} |{' '}
                                            {exp.start_end_dates}
                                        </Text>
                                        <Text style={styles.description}>
                                            {exp.responsabilities}
                                        </Text>
                                    </View>
                                ),
                        )}
                    </View>

                    <View style={styles.mainSection}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        <View style={styles.sectionDivider} />
                        {resume_generated.projects.map(
                            (pro, id) =>
                                pro.display !== false && (
                                    <View
                                        key={id}
                                        style={styles.entryContainer}
                                    >
                                        <Text style={styles.jobTitle}>
                                            {pro.name}
                                        </Text>
                                        <Text style={styles.companyAndDate}>
                                            {pro.start_end_dates}
                                        </Text>
                                        <Text style={styles.description}>
                                            {pro.description}
                                        </Text>
                                    </View>
                                ),
                        )}
                    </View>
                </View>
                */}
            </Page>
        </Document>
    );
};
