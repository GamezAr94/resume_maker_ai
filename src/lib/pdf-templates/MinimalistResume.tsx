import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    Link,
    Font,
} from '@react-pdf/renderer';
import { FormJobOfferDataStructure } from '@/utils/interfaces';

// Using Lato for a clean, standard look.
Font.register({
    family: 'Lato',
    fonts: [
        {
            src: 'https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHjxswWyWrFCbw7A.ttf',
            fontWeight: 400,
            fontStyle: 'italic',
        },
        {
            src: 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHvxk6XweuBCY.ttf',
            fontWeight: 400,
        },
        {
            src: 'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVew-FGC_p9dw.ttf',
            fontWeight: 700,
        },
    ],
});

Font.registerHyphenationCallback((word) => [word]);

// --- STYLESHEET ---
// Styles to replicate the single-column, black & white screenshot.
export const styles = StyleSheet.create({
    viewer: {
        aspectRatio: '210/297',
        maxWidth: '712px',
        width: '100%',
    },
    page: {
        fontFamily: 'Lato',
        fontSize: 11,
        paddingTop: 20,
        paddingLeft: 40,
        paddingRight: 40,
        paddingBottom: 25,
        color: '#000000',
        backgroundColor: '#FFFFFF',
    },
    header: {
        textAlign: 'center',
        marginBottom: 15,
    },
    userName: {
        fontSize: 28,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    contactInfo: {
        fontSize: 10,
        color: '#000000',
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        paddingBottom: 3,
        marginBottom: 10,
    },
    entryContainer: {
        marginBottom: 5,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    entryTitle: {
        fontSize: 11,
        fontWeight: 700,
    },
    entrySubtitle: {
        fontSize: 11,
        fontStyle: 'italic',
    },
    entryDate: {
        fontSize: 11,
        fontWeight: 700,
    },
    description: {
        fontSize: 11,
        textAlign: 'justify',
        lineHeight: 1.4,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 4,
        paddingRight: 15,
    },
    bullet: {
        width: 15,
        fontSize: 11,
    },
    bulletText: {
        flex: 1,
        fontSize: 11,
        textAlign: 'justify',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    skillColumn: {
        width: '25%', // 4 columns
        flexDirection: 'column',
    },
    skillItem: {
        flexDirection: 'row',
        marginBottom: 3,
    },
});

// --- TEMPLATE COMPONENT ---
export const MinimalistResumeTemplate = ({
    dataResume,
}: {
    dataResume: FormJobOfferDataStructure;
}) => {
    if (!dataResume || !dataResume.resume_generated) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={{ padding: 30, textAlign: 'center' }}>
                        <Text>Generating resume...</Text>
                    </View>
                </Page>
            </Document>
        );
    }

    const { resume_generated } = dataResume;

    // Helper to render bullet points from a single string with newlines
    const renderResponsibilities = (responsibilities: string) => {
        const points = responsibilities
            .split('\n')
            .filter((p) => p.trim() !== '');
        return points.map((point, index) => (
            <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                    {point.replace(/^- /, '')}
                </Text>
            </View>
        ));
    };

    // Helper to render skills in 4 columns
    const renderSkills = (skills: string[]) => {
        const columns: string[][] = [[], [], [], []];
        skills.forEach((skill, index) => {
            columns[index % 4].push(skill);
        });

        return (
            <View style={styles.skillsContainer}>
                {columns.map((col, colIndex) => (
                    <View key={colIndex} style={styles.skillColumn}>
                        {col.map((skill, skillIndex) => (
                            <View key={skillIndex} style={styles.skillItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <Document
            author={resume_generated.contact_info.name}
            title={`Resume for ${resume_generated.contact_info.name}`}
        >
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.userName}>
                        {resume_generated.contact_info.name}
                    </Text>
                    <Text style={styles.contactInfo}>
                        {resume_generated.contact_info.phone}
                        {resume_generated.contact_info.phone && '  \u2022  '}
                        <Link
                            src={`mailto:${resume_generated.contact_info.email}`}
                        >
                            {resume_generated.contact_info.email}
                        </Link>
                        {(resume_generated.contact_info.linkedin ||
                            resume_generated.contact_info.github) &&
                            '  \u2022  '}
                        {resume_generated.contact_info.linkedin && (
                            <Link src={resume_generated.contact_info.linkedin}>
                                LinkedIn
                            </Link>
                        )}
                        {resume_generated.contact_info.github &&
                            resume_generated.contact_info.linkedin &&
                            ' / '}
                        {resume_generated.contact_info.github && (
                            <Link src={resume_generated.contact_info.github}>
                                GitHub
                            </Link>
                        )}
                    </Text>
                </View>

                {/* Dynamic Sections */}
                {resume_generated?.layout?.map((section, idx) => {
                    if (!section.display) return null;

                    switch (section.id) {
                        case 'narrative':
                            return (
                                <View key={idx} style={styles.section}>
                                    <Text style={styles.sectionTitle}>
                                        {section.title}
                                    </Text>
                                    <Text style={styles.description}>
                                        {section.items}
                                    </Text>
                                </View>
                            );

                        case 'experience':
                            return (
                                <View key={idx} style={styles.section}>
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
                                                    <View
                                                        style={
                                                            styles.entryHeader
                                                        }
                                                    >
                                                        <View
                                                            style={{
                                                                flexDirection:
                                                                    'column',
                                                            }}
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.entryTitle
                                                                }
                                                            >
                                                                {exp.company}
                                                            </Text>
                                                            <Text
                                                                style={
                                                                    styles.entrySubtitle
                                                                }
                                                            >
                                                                {exp.title}
                                                            </Text>
                                                        </View>
                                                        <Text
                                                            style={
                                                                styles.entryDate
                                                            }
                                                        >
                                                            {
                                                                exp.start_end_dates
                                                            }
                                                        </Text>
                                                    </View>
                                                    {renderResponsibilities(
                                                        exp.responsabilities,
                                                    )}
                                                </View>
                                            ),
                                    )}
                                </View>
                            );

                        case 'education':
                            return (
                                <View key={idx} style={styles.section}>
                                    <Text style={styles.sectionTitle}>
                                        {section.title}
                                    </Text>
                                    {section.items.map(
                                        (edu, id) =>
                                            edu.display !== false && (
                                                <View
                                                    key={id}
                                                    style={
                                                        styles.entryContainer
                                                    }
                                                >
                                                    <View
                                                        style={
                                                            styles.entryHeader
                                                        }
                                                    >
                                                        <View>
                                                            <Text
                                                                style={
                                                                    styles.entryTitle
                                                                }
                                                            >
                                                                {edu.school}
                                                            </Text>
                                                            <Text
                                                                style={
                                                                    styles.entrySubtitle
                                                                }
                                                            >
                                                                {edu.degree}
                                                            </Text>
                                                        </View>
                                                        <Text
                                                            style={
                                                                styles.entryDate
                                                            }
                                                        >
                                                            {
                                                                edu.start_end_dates
                                                            }
                                                        </Text>
                                                    </View>
                                                </View>
                                            ),
                                    )}
                                </View>
                            );

                        case 'skills':
                            return (
                                <View key={idx} style={styles.section}>
                                    <Text style={styles.sectionTitle}>
                                        {section.title}
                                    </Text>
                                    {renderSkills(section.items)}
                                </View>
                            );

                        case 'projects':
                            return (
                                <View key={idx} style={styles.section}>
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
                                                    <View
                                                        style={
                                                            styles.entryHeader
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.entryTitle
                                                            }
                                                        >
                                                            {pro.name}
                                                        </Text>
                                                        {pro.start_end_dates && (
                                                            <Text
                                                                style={
                                                                    styles.entryDate
                                                                }
                                                            >
                                                                {
                                                                    pro.start_end_dates
                                                                }
                                                            </Text>
                                                        )}
                                                    </View>
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
                            );

                        default:
                            return null;
                    }
                })}
            </Page>
        </Document>
    );
};
