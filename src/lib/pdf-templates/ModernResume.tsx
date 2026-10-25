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
import {
    renderBulletPoints,
    getResolvedStyleTokens,
    getPdfMetadata,
    cleanUrlDisplay,
} from './pdfUtils';

Font.register({
    family: 'Roboto',
    fonts: [
        {
            src: 'https://fonts.gstatic.com/s/roboto/v48/KFOKCnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmOClHrs6ljXfMMLoHQiA_0klQnx24.ttf',
            fontWeight: 400,
            fontStyle: 'italic',
        },
        {
            src: 'https://fonts.gstatic.com/s/roboto/v48/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbWmTggvWl0Qn.ttf',
            fontWeight: 400,
        },
        {
            src: 'https://fonts.gstatic.com/s/roboto/v48/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjammTggvWl0Qn.ttf',
            fontWeight: 700,
        },
    ],
});
Font.registerHyphenationCallback((word) => [word]);

export const ModernResumeTemplate = ({
    dataResume,
}: {
    dataResume: FormJobOfferDataStructure;
}) => {
    const tokens = getResolvedStyleTokens(dataResume?.resume_generated?.styles, {
        accentColor: '#0d9488',
        headerColor: '#1e3a8a',
    });
    const meta = getPdfMetadata(dataResume);

    const dynamicStyles = StyleSheet.create({
        page: {
            fontFamily: 'Roboto',
            fontWeight: 400,
            backgroundColor: '#FFFFFF',
            padding: tokens.pagePadding,
            color: '#1f2937',
        },
        header: {
            textAlign: 'center',
            marginBottom: tokens.sectionGap,
            borderBottomWidth: 2,
            borderBottomColor: tokens.headerColor,
            paddingBottom: 8,
        },
        userName: {
            fontSize: tokens.nameFontSize,
            fontWeight: 700,
            color: tokens.headerColor,
        },
        jobPosition: {
            fontSize: tokens.entryTitleSize + 1,
            color: tokens.accentColor,
            marginTop: 3,
            fontWeight: 700,
        },
        contactInfo: {
            marginTop: 6,
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
        },
        contactItem: {
            fontSize: tokens.smallFontSize,
            color: '#374151',
            marginHorizontal: 6,
        },
        contactLink: {
            fontSize: tokens.smallFontSize,
            color: tokens.headerColor,
            textDecoration: 'none',
        },
        section: {
            marginBottom: tokens.sectionGap,
        },
        sectionTitle: {
            fontSize: tokens.sectionTitleSize,
            fontWeight: 700,
            color: tokens.headerColor,
            textTransform: 'uppercase',
            marginBottom: 2,
        },
        sectionDivider: {
            borderBottomWidth: 1,
            borderBottomColor: tokens.accentColor,
            marginBottom: 6,
        },
        entryContainer: {
            marginBottom: tokens.entryGap,
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
        },
        entryTitle: {
            fontSize: tokens.entryTitleSize,
            fontWeight: 700,
            color: '#111827',
        },
        entryDate: {
            fontSize: tokens.smallFontSize,
            fontStyle: 'italic',
            color: '#4b5563',
        },
        entrySubtitle: {
            fontSize: tokens.baseFontSize,
            fontWeight: 700,
            color: tokens.accentColor,
            marginBottom: 3,
        },
        description: {
            fontSize: tokens.baseFontSize,
            textAlign: 'justify',
            lineHeight: tokens.lineHeight,
        },
        skillsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        skill: {
            backgroundColor: tokens.accentColor,
            color: '#FFFFFF',
            fontSize: tokens.smallFontSize,
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderRadius: 4,
            marginRight: 5,
            marginBottom: 5,
        },
        bulletPoint: {
            flexDirection: 'row',
            marginBottom: 2.5,
        },
        bullet: {
            width: 12,
            fontSize: tokens.baseFontSize,
            color: tokens.accentColor,
        },
        bulletText: {
            flex: 1,
            fontSize: tokens.baseFontSize,
            lineHeight: tokens.lineHeight,
            textAlign: 'justify',
        },
    });

    if (!dataResume || !dataResume.resume_generated) {
        return (
            <Document>
                <Page size="A4" style={dynamicStyles.page}>
                    <View style={{ padding: 30, textAlign: 'center' }}>
                        <Text>Generating resume...</Text>
                    </View>
                </Page>
            </Document>
        );
    }

    const { resume_generated, job_position } = dataResume;

    return (
        <Document {...meta}>
            <Page size="A4" style={dynamicStyles.page}>
                <View style={dynamicStyles.header}>
                    <Text style={dynamicStyles.userName}>
                        {resume_generated.contact_info.name}
                    </Text>
                    <Text style={dynamicStyles.jobPosition}>{job_position}</Text>
                    <View style={dynamicStyles.contactInfo}>
                        {resume_generated.contact_info.phone ? (
                            <Text style={dynamicStyles.contactItem}>
                                {resume_generated.contact_info.phone}
                            </Text>
                        ) : null}
                        {resume_generated.contact_info.email ? (
                            <Text style={dynamicStyles.contactItem}>
                                <Link
                                    style={dynamicStyles.contactLink}
                                    src={`mailto:${resume_generated.contact_info.email}`}
                                >
                                    {resume_generated.contact_info.email}
                                </Link>
                            </Text>
                        ) : null}
                        {resume_generated.contact_info.linkedin ? (
                            <Text style={dynamicStyles.contactItem}>
                                <Link
                                    style={dynamicStyles.contactLink}
                                    src={resume_generated.contact_info.linkedin}
                                >
                                    {cleanUrlDisplay(resume_generated.contact_info.linkedin)}
                                </Link>
                            </Text>
                        ) : null}
                        {resume_generated.contact_info.github ? (
                            <Text style={dynamicStyles.contactItem}>
                                <Link
                                    style={dynamicStyles.contactLink}
                                    src={resume_generated.contact_info.github}
                                >
                                    {cleanUrlDisplay(resume_generated.contact_info.github)}
                                </Link>
                            </Text>
                        ) : null}
                        {resume_generated.contact_info.portfolio ? (
                            <Text style={dynamicStyles.contactItem}>
                                <Link
                                    style={dynamicStyles.contactLink}
                                    src={resume_generated.contact_info.portfolio}
                                >
                                    {cleanUrlDisplay(resume_generated.contact_info.portfolio)}
                                </Link>
                            </Text>
                        ) : null}
                    </View>
                </View>

                {resume_generated?.layout?.map((section, idx) => {
                    if (!section.display) return null;
                    switch (section.id) {
                        case 'narrative':
                            return (
                                <View key={idx} style={dynamicStyles.section}>
                                    <Text style={dynamicStyles.sectionTitle}>
                                        {section.title}
                                    </Text>
                                    <View style={dynamicStyles.sectionDivider} />
                                    <Text style={dynamicStyles.description}>
                                        {section.items}
                                    </Text>
                                </View>
                            );
                        case 'experience':
                            return (
                                <View key={idx} style={dynamicStyles.section}>
                                    <Text style={dynamicStyles.sectionTitle}>
                                        {section.title}
                                    </Text>
                                    <View style={dynamicStyles.sectionDivider} />
                                    {section.items.map(
                                        (exp, id) =>
                                            exp.display !== false && (
                                                <View
                                                    key={id}
                                                    style={dynamicStyles.entryContainer}
                                                >
                                                    <View style={dynamicStyles.entryHeader}>
                                                        <Text style={dynamicStyles.entryTitle}>
                                                            {exp.title}
                                                        </Text>
                                                        <Text style={dynamicStyles.entryDate}>
                                                            {exp.start_end_dates}
                                                        </Text>
                                                    </View>
                                                    <Text style={dynamicStyles.entrySubtitle}>
                                                        {exp.company}
                                                    </Text>
                                                    {renderBulletPoints(
                                                        exp.responsabilities,
                                                        dynamicStyles,
                                                    )}
                                                </View>
                                            ),
                                    )}
                                </View>
                            );
                        case 'projects':
                            return (
                                <View key={idx} style={dynamicStyles.section}>
                                    <Text style={dynamicStyles.sectionTitle}>
                                        {section.title}
                                    </Text>
                                    <View style={dynamicStyles.sectionDivider} />
                                    {section.items.map(
                                        (pro, id) =>
                                            pro.display !== false && (
                                                <View
                                                    key={id}
                                                    style={dynamicStyles.entryContainer}
                                                >
                                                    <View style={dynamicStyles.entryHeader}>
                                                        <Text style={dynamicStyles.entryTitle}>
                                                            {pro.name}
                                                        </Text>
                                                        {pro.start_end_dates ? (
                                                            <Text style={dynamicStyles.entryDate}>
                                                                {pro.start_end_dates}
                                                            </Text>
                                                        ) : null}
                                                    </View>
                                                    {renderBulletPoints(
                                                        pro.description,
                                                        dynamicStyles,
                                                    )}
                                                </View>
                                            ),
                                    )}
                                </View>
                            );
                        case 'education':
                            return (
                                <View key={idx} style={dynamicStyles.section}>
                                    <Text style={dynamicStyles.sectionTitle}>
                                        {section.title}
                                    </Text>
                                    <View style={dynamicStyles.sectionDivider} />
                                    {section.items.map(
                                        (edu, id) =>
                                            edu.display !== false && (
                                                <View
                                                    key={id}
                                                    style={dynamicStyles.entryContainer}
                                                >
                                                    <View style={dynamicStyles.entryHeader}>
                                                        <Text style={dynamicStyles.entryTitle}>
                                                            {edu.degree}
                                                        </Text>
                                                        <Text style={dynamicStyles.entryDate}>
                                                            {edu.start_end_dates}
                                                        </Text>
                                                    </View>
                                                    <Text style={dynamicStyles.entrySubtitle}>
                                                        {edu.school}
                                                    </Text>
                                                </View>
                                            ),
                                    )}
                                </View>
                            );
                        case 'skills':
                            return (
                                <View key={idx} style={dynamicStyles.section}>
                                    <Text style={dynamicStyles.sectionTitle}>
                                        {section.title}
                                    </Text>
                                    <View style={dynamicStyles.sectionDivider} />
                                    <View style={dynamicStyles.skillsContainer}>
                                        {section.items.map(
                                            (skill: string, id: number) =>
                                                skill && (
                                                    <Text
                                                        key={id}
                                                        style={dynamicStyles.skill}
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
