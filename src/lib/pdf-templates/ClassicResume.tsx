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

export const styles = StyleSheet.create({
    viewer: {
        aspectRatio: '210/297',
        maxWidth: '712px',
        width: '100%',
    },
});

export const ClassicResumeTemplate = ({
    dataResume,
}: {
    dataResume: FormJobOfferDataStructure;
}) => {
    const tokens = getResolvedStyleTokens(dataResume?.resume_generated?.styles, {
        accentColor: '#38bdf8',
        headerColor: '#1e293b',
    });
    const meta = getPdfMetadata(dataResume);

    const dynamicStyles = StyleSheet.create({
        page: {
            fontFamily: 'Lato',
            fontWeight: 400,
            flexDirection: 'row',
            backgroundColor: '#FFFFFF',
        },
        sidebar: {
            width: '32%',
            backgroundColor: tokens.headerColor,
            color: '#FFFFFF',
            padding: tokens.pagePadding * 0.75,
        },
        mainContent: {
            width: '68%',
            paddingTop: tokens.pagePadding * 0.75,
            paddingBottom: tokens.pagePadding * 0.75,
            paddingHorizontal: tokens.pagePadding,
        },
        header: {
            marginBottom: 4,
        },
        userName: {
            fontSize: tokens.nameFontSize,
            fontFamily: 'Lato',
            fontWeight: 700,
            color: tokens.headerColor,
        },
        jobPosition: {
            fontSize: tokens.entryTitleSize + 2,
            color: tokens.accentColor,
            marginBottom: 8,
            fontWeight: 700,
        },
        sidebarSection: {
            marginBottom: tokens.sectionGap + 4,
        },
        sidebarTitle: {
            fontSize: tokens.sectionTitleSize - 1,
            fontWeight: 700,
            marginBottom: 6,
            color: tokens.accentColor,
            textTransform: 'uppercase',
            borderBottomWidth: 1,
            borderBottomColor: tokens.accentColor,
            paddingBottom: 2,
        },
        contactItem: {
            fontSize: tokens.smallFontSize,
            marginBottom: 5,
        },
        contactLink: {
            fontSize: tokens.smallFontSize,
            color: '#FFFFFF',
            textDecoration: 'none',
            marginBottom: 5,
        },
        skill: {
            fontSize: tokens.smallFontSize,
            marginBottom: 4,
        },
        educationEntry: {
            marginBottom: 10,
        },
        degree: {
            fontSize: tokens.baseFontSize,
            fontWeight: 700,
        },
        school: {
            fontSize: tokens.smallFontSize,
        },
        educationDates: {
            fontSize: tokens.smallFontSize - 1,
            color: '#cbd5e1',
            fontStyle: 'italic',
        },
        mainSection: {
            marginBottom: tokens.sectionGap,
        },
        sectionTitle: {
            fontSize: tokens.sectionTitleSize,
            fontWeight: 700,
            color: tokens.headerColor,
            textTransform: 'uppercase',
            marginBottom: 3,
        },
        sectionDivider: {
            borderBottomWidth: 1.5,
            borderBottomColor: tokens.accentColor,
            marginBottom: 8,
        },
        entryContainer: {
            marginBottom: tokens.entryGap,
        },
        jobTitle: {
            fontSize: tokens.entryTitleSize,
            fontWeight: 700,
            color: '#0f172a',
        },
        companyAndDate: {
            fontSize: tokens.smallFontSize,
            fontStyle: 'italic',
            color: '#64748b',
            marginBottom: 4,
        },
        description: {
            fontSize: tokens.baseFontSize,
            textAlign: 'justify',
            lineHeight: tokens.lineHeight,
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
                    <View style={{ padding: 30 }}>
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
                <View style={dynamicStyles.sidebar}>
                    <View style={dynamicStyles.sidebarSection}>
                        <Text style={dynamicStyles.sidebarTitle}>Contact</Text>
                        {resume_generated.contact_info.phone ? (
                            <Text style={dynamicStyles.contactItem}>
                                {resume_generated.contact_info.phone}
                            </Text>
                        ) : null}
                        {resume_generated.contact_info.email ? (
                            <Link
                                style={dynamicStyles.contactLink}
                                src={`mailto:${resume_generated.contact_info.email}`}
                            >
                                {resume_generated.contact_info.email}
                            </Link>
                        ) : null}
                        {resume_generated.contact_info.linkedin ? (
                            <Link
                                style={dynamicStyles.contactLink}
                                src={resume_generated.contact_info.linkedin}
                            >
                                {cleanUrlDisplay(resume_generated.contact_info.linkedin)}
                            </Link>
                        ) : null}
                        {resume_generated.contact_info.github ? (
                            <Link
                                style={dynamicStyles.contactLink}
                                src={resume_generated.contact_info.github}
                            >
                                {cleanUrlDisplay(resume_generated.contact_info.github)}
                            </Link>
                        ) : null}
                        {resume_generated.contact_info.portfolio ? (
                            <Link
                                style={dynamicStyles.contactLink}
                                src={resume_generated.contact_info.portfolio}
                            >
                                {cleanUrlDisplay(resume_generated.contact_info.portfolio)}
                            </Link>
                        ) : null}
                    </View>

                    {resume_generated?.layout?.map((section, idx) => {
                        switch (section.id) {
                            case 'education':
				return section.display !== false ? (
                                    <View
                                        key={`edu-${idx}`}
                                        style={dynamicStyles.sidebarSection}
                                    >
                                        <Text style={dynamicStyles.sidebarTitle}>
                                            {section.title}
                                        </Text>
                                        {section.items.map(
                                            (edu, id) =>
                                                edu.display !== false && (
                                                    <View
                                                        key={id}
                                                        style={dynamicStyles.educationEntry}
                                                    >
                                                        <Text style={dynamicStyles.degree}>
                                                            {edu.degree}
                                                        </Text>
                                                        <Text style={dynamicStyles.school}>
                                                            {edu.school}
                                                        </Text>
                                                        <Text style={dynamicStyles.educationDates}>
                                                            {edu.start_end_dates}
                                                        </Text>
                                                    </View>
                                                ),
                                        )}
                                    </View>
                                ) : null;
                            case 'skills':
				return section.display !== false ? (
                                    <View
                                        key={`skills-${idx}`}
                                        style={dynamicStyles.sidebarSection}
                                    >
                                        <Text style={dynamicStyles.sidebarTitle}>
                                            {section.title}
                                        </Text>
                                        {section.items.map(
                                            (skill, id) =>
                                                skill && (
                                                    <Text
                                                        key={id}
                                                        style={dynamicStyles.skill}
                                                    >
                                                        • {skill}
                                                    </Text>
                                                ),
                                        )}
                                    </View>
                                ) : null;
                            default:
                                return null;
                        }
                    })}
                </View>

                <View style={dynamicStyles.mainContent}>
                    <View style={dynamicStyles.header}>
                        <Text style={dynamicStyles.userName}>
                            {resume_generated.contact_info.name}
                        </Text>
                        <Text style={dynamicStyles.jobPosition}>{job_position}</Text>
                    </View>
                    <View style={dynamicStyles.sectionDivider} />

                    {resume_generated?.layout?.map((section, idx) => {
                        switch (section.id) {
                            case 'narrative':
				return section.display !== false ? (
                                    <View
                                        key={`nar-${idx}`}
                                        style={dynamicStyles.mainSection}
                                    >
                                        <Text style={dynamicStyles.sectionTitle}>
                                            {section.title}
                                        </Text>
                                        <Text style={dynamicStyles.description}>
                                            {section.items}
                                        </Text>
                                    </View>
                                ) : null;
                            case 'experience':
				return section.display !== false ? (
                                    <View
                                        key={`exp-${idx}`}
                                        style={dynamicStyles.mainSection}
                                    >
                                        <Text style={dynamicStyles.sectionTitle}>
                                            {section.title}
                                        </Text>
                                        {section.items.map(
                                            (exp, id) =>
                                                exp.display !== false && (
                                                    <View
                                                        key={id}
                                                        style={dynamicStyles.entryContainer}
                                                    >
                                                        <Text style={dynamicStyles.jobTitle}>
                                                            {exp.title}
                                                        </Text>
                                                        <Text style={dynamicStyles.companyAndDate}>
                                                            {exp.company} | {exp.start_end_dates}
                                                        </Text>
                                                        {renderBulletPoints(
                                                            exp.responsabilities,
                                                            dynamicStyles,
                                                        )}
                                                    </View>
                                                ),
                                        )}
                                    </View>
                                ) : null;
                            case 'projects':
				return section.display !== false ? (
                                    <View
                                        key={`proj-${idx}`}
                                        style={dynamicStyles.mainSection}
                                    >
                                        <Text style={dynamicStyles.sectionTitle}>
                                            {section.title}
                                        </Text>
                                        {section.items.map(
                                            (pro, id) =>
                                                pro.display !== false && (
                                                    <View
                                                        key={id}
                                                        style={dynamicStyles.entryContainer}
                                                    >
                                                        <Text style={dynamicStyles.jobTitle}>
                                                            {pro.name}
                                                        </Text>
                                                        {pro.start_end_dates ? (
                                                            <Text style={dynamicStyles.companyAndDate}>
                                                                {pro.start_end_dates}
                                                            </Text>
                                                        ) : null}
                                                        {renderBulletPoints(
                                                            pro.description,
                                                            dynamicStyles,
                                                        )}
                                                    </View>
                                                ),
                                        )}
                                    </View>
                                ) : null;
                            default:
                                return null;
                        }
                    })}
                </View>
            </Page>
        </Document>
    );
};
