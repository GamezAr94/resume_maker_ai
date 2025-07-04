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
// Assuming this interface is in your project
// import { FormJobOfferDataStructure } from '@/utils/interfaces';

// A mock interface for demonstration purposes if the actual one is not available.
interface FormJobOfferDataStructure {
    job_position: string;
    resume_generated: {
        contact_info: {
            name: string;
            phone: string;
            email: string;
            linkedin: string;
        };
        layout: Array<{
            id:
                | 'narrative'
                | 'experience'
                | 'education'
                | 'projects'
                | 'skills';
            title: string;
            display: boolean;
            items: any;
        }>;
    };
}

// --- FONT REGISTRATION ---
// Using 'Roboto' for a modern, clean look.
Font.register({
    family: 'Roboto',
    fonts: [
        {
            src: 'https://fonts.gstatic.com/s/roboto/v48/KFOKCnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmOClHrs6ljXfMMLoHQiA_0klQnx24.ttf', // The actual font file URL
            fontWeight: 400,
            fontStyle: 'italic', // Optional: if you have italic version. It will break if not specified
        },
        {
            src: 'https://fonts.gstatic.com/s/roboto/v48/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbWmTggvWl0Qn.ttf', // The actual font file URL
            fontWeight: 400,
        },
        {
            src: 'https://fonts.gstatic.com/s/roboto/v48/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjammTggvWl0Qn.ttf', // The actual font file URL
            fontWeight: 700,
        },
    ],
});

// This prevents words from being cut off awkwardly.
Font.registerHyphenationCallback((word) => [word]);

// --- THEME & COLORS ---
const theme = {
    primary: '#1A237E', // Deep Indigo
    secondary: '#F5F5F5', // Light Grey Background
    accent: '#00BFA5', // Teal Accent
    textPrimary: '#212121', // Almost Black
    textSecondary: '#757575', // Grey for subtitles
};

// --- STYLESHEET ---
export const styles = StyleSheet.create({
    // The PDF viewer component needs to have a defined aspect ratio
    viewer: {
        aspectRatio: '210/297',
        maxWidth: '712px',
        width: '100%',
    },
    // The page itself
    page: {
        fontFamily: 'Roboto',
        fontWeight: 400,
        backgroundColor: theme.secondary,
        padding: 24,
        color: theme.textPrimary,
    },
    // Header section with name and contact info
    header: {
        textAlign: 'center',
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: theme.primary,
        paddingBottom: 10,
    },
    userName: {
        fontSize: 32,
        fontFamily: 'Roboto',
        fontWeight: 700,
        color: theme.primary,
    },
    jobPosition: {
        fontSize: 14,
        color: theme.textSecondary,
        marginTop: 4,
        fontWeight: 400,
    },
    contactInfo: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    contactItem: {
        fontSize: 10,
        color: theme.primary,
        marginHorizontal: 10,
    },
    contactLink: {
        fontSize: 10,
        color: theme.primary,
        textDecoration: 'none',
    },
    // Styles for each major section (Experience, Education, etc.)
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: theme.primary,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    sectionDivider: {
        borderBottomWidth: 1,
        borderBottomColor: theme.accent,
        marginBottom: 10,
    },
    // Container for a single entry (e.g., one job, one degree)
    entryContainer: {
        marginBottom: 5,
    },
    // Header for an entry, using flexbox to align items
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    entryTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: theme.textPrimary,
    },
    entryDate: {
        fontSize: 10,
        fontStyle: 'italic',
        color: theme.textSecondary,
    },
    entrySubtitle: {
        fontSize: 11,
        color: theme.textSecondary,
        marginBottom: 6,
    },
    description: {
        fontSize: 10,
        textAlign: 'justify',
        lineHeight: 1.4,
    },
    // Styles for the skills section
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    skill: {
        backgroundColor: theme.accent,
        color: '#FFFFFF',
        fontSize: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
        marginRight: 6,
        marginBottom: 6,
    },
});

// --- TEMPLATE COMPONENT ---
export const ModernResumeTemplate = ({
    dataResume,
}: {
    dataResume: FormJobOfferDataStructure;
}) => {
    // Show a loading/generating state if data is not ready
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

    const { resume_generated, job_position } = dataResume;

    return (
        <Document
            author={resume_generated.contact_info.name}
            title={`Resume for ${job_position}`}
        >
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.userName}>
                        {resume_generated.contact_info.name}
                    </Text>
                    <Text style={styles.jobPosition}>{job_position}</Text>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactItem}>
                            {resume_generated.contact_info.phone}
                        </Text>
                        <Text style={styles.contactItem}>
                            <Link
                                style={styles.contactLink}
                                src={`mailto:${resume_generated.contact_info.email}`}
                            >
                                {resume_generated.contact_info.email}
                            </Link>
                        </Text>
                        <Text style={styles.contactItem}>
                            <Link
                                style={styles.contactLink}
                                src={resume_generated.contact_info.linkedin}
                            >
                                LinkedIn
                            </Link>
                        </Text>
                    </View>
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
                                    <View style={styles.sectionDivider} />
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
                                    <View style={styles.sectionDivider} />
                                    {section.items.map(
                                        (exp: any, id: number) =>
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
                                                        <Text
                                                            style={
                                                                styles.entryTitle
                                                            }
                                                        >
                                                            {exp.title}
                                                        </Text>
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
                                                    <Text
                                                        style={
                                                            styles.entrySubtitle
                                                        }
                                                    >
                                                        {exp.company}
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.description
                                                        }
                                                    >
                                                        {exp.responsabilities}
                                                    </Text>
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
                                    <View style={styles.sectionDivider} />
                                    {section.items.map(
                                        (edu: any, id: number) =>
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
                                                        <Text
                                                            style={
                                                                styles.entryTitle
                                                            }
                                                        >
                                                            {edu.degree}
                                                        </Text>
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
                                                    <Text
                                                        style={
                                                            styles.entrySubtitle
                                                        }
                                                    >
                                                        {edu.school}
                                                    </Text>
                                                </View>
                                            ),
                                    )}
                                </View>
                            );

                        case 'projects':
                            return (
                                <View key={idx} style={styles.section}>
                                    <Text style={styles.sectionTitle}>
                                        {section.title}
                                    </Text>
                                    <View style={styles.sectionDivider} />
                                    {section.items.map(
                                        (pro: any, id: number) =>
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
                                                        <Text
                                                            style={
                                                                styles.entryDate
                                                            }
                                                        >
                                                            {
                                                                pro.start_end_dates
                                                            }
                                                        </Text>
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

                        case 'skills':
                            return (
                                <View key={idx} style={styles.section}>
                                    <Text style={styles.sectionTitle}>
                                        {section.title}
                                    </Text>
                                    <View style={styles.sectionDivider} />
                                    <View style={styles.skillsContainer}>
                                        {section.items.map(
                                            (skill: string, id: number) =>
                                                skill && (
                                                    <Text
                                                        key={id}
                                                        style={styles.skill}
                                                    >
                                                        {skill}
                                                    </Text>
                                                ),
                                        )}
                                    </View>
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
