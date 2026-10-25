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
import {
    renderBulletPoints,
    getResolvedStyleTokens,
    getPdfMetadata,
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

export const MinimalistResumeTemplate = ({
    dataResume,
}: {
    dataResume: FormJobOfferDataStructure;
}) => {
    const tokens = getResolvedStyleTokens(dataResume?.resume_generated?.styles, {
        accentColor: '#111827',
        headerColor: '#000000',
    });
    const meta = getPdfMetadata(dataResume);

    const dynamicStyles = StyleSheet.create({
        page: {
            fontFamily: 'Lato',
            fontSize: tokens.baseFontSize,
            paddingTop: tokens.pagePadding * 0.8,
            paddingLeft: tokens.pagePadding + 6,
            paddingRight: tokens.pagePadding + 6,
            paddingBottom: tokens.pagePadding * 0.8,
            color: '#000000',
            backgroundColor: '#FFFFFF',
        },
        header: {
            textAlign: 'center',
            marginBottom: tokens.sectionGap + 2,
        },
        userName: {
            fontSize: tokens.nameFontSize,
            fontWeight: 700,
            textTransform: 'uppercase',
            color: tokens.headerColor,
            marginBottom: 4,
        },
        contactInfo: {
            fontSize: tokens.smallFontSize,
            color: '#1f2937',
        },
        section: {
            marginBottom: tokens.sectionGap,
        },
        sectionTitle: {
            fontSize: tokens.sectionTitleSize - 1,
            fontWeight: 700,
            textTransform: 'uppercase',
            color: tokens.headerColor,
            borderBottomWidth: 1,
            borderBottomColor: tokens.accentColor,
            paddingBottom: 2,
            marginBottom: 6,
        },
        entryContainer: {
            marginBottom: tokens.entryGap,
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 2,
        },
        entryTitle: {
            fontSize: tokens.entryTitleSize,
            fontWeight: 700,
        },
        entrySubtitle: {
            fontSize: tokens.baseFontSize,
            fontStyle: 'italic',
            color: tokens.accentColor,
        },
        entryDate: {
            fontSize: tokens.smallFontSize,
            fontWeight: 700,
        },
        description: {
            fontSize: tokens.baseFontSize,
            textAlign: 'justify',
            lineHeight: tokens.lineHeight,
        },
        bulletPoint: {
            flexDirection: 'row',
            marginBottom: 2.5,
            paddingRight: 10,
        },
        bullet: {
            width: 12,
            fontSize: tokens.baseFontSize,
        },
        bulletText: {
            flex: 1,
            fontSize: tokens.baseFontSize,
            lineHeight: tokens.lineHeight,
            textAlign: 'justify',
        },
        skillsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        skillColumn: {
            width: '25%',
            flexDirection: 'column',
        },
        skillItem: {
            flexDirection: 'row',
            marginBottom: 2.5,
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

    const { resume_generated } = dataResume;

    const renderSkills = (skills: string[]) => {
        const columns: string[][] = [[], [], [], []];
        skills.forEach((skill, index) => {
            columns[index % 4].push(skill);
        });

        return (
            <View style={dynamicStyles.skillsContainer}>
                {columns.map((col, colIndex) => (
                    <View key={colIndex} style={dynamicStyles.skillColumn}>
                        {col.map((skill, skillIndex) => (
                            <View key={skillIndex} style={dynamicStyles.skillItem}>
                                <Text style={dynamicStyles.bullet}>•</Text>
                                <Text style={dynamicStyles.bulletText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <Document {...meta}>
            <Page size="A4" style={dynamicStyles.page}>
                <View style={dynamicStyles.header}>
                    <Text style={dynamicStyles.userName}>
                        {resume_generated.contact_info.name}
                    </Text>
                    <Text style={dynamicStyles.contactInfo}>
                        {resume_generated.contact_info.phone}
                        {resume_generated.contact_info.phone && '  \u2022  '}
                        <Link src={`mailto:${resume_generated.contact_info.email}`}>
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

                {resume_generated?.layout?.map((section, idx) => {
		    if (section.display === false) return null;
                    switch (section.id) {
                        case 'narrative':
                            return (
                                <View key={idx} style={dynamicStyles.section}>
                                    <Text style={dynamicStyles.sectionTitle}>
                                        {section.title}
                                    </Text>
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
                                    {section.items.map(
                                        (exp, id) =>
                                            exp.display !== false && (
                                                <View
                                                    key={id}
                                                    style={dynamicStyles.entryContainer}
                                                >
                                                    <View style={dynamicStyles.entryHeader}>
                                                        <View style={{ flexDirection: 'column' }}>
                                                            <Text style={dynamicStyles.entryTitle}>
                                                                {exp.company}
                                                            </Text>
                                                            <Text style={dynamicStyles.entrySubtitle}>
                                                                {exp.title}
                                                            </Text>
                                                        </View>
                                                        <Text style={dynamicStyles.entryDate}>
                                                            {exp.start_end_dates}
                                                        </Text>
                                                    </View>
                                                    {renderBulletPoints(
                                                        exp.responsabilities,
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
                                    {section.items.map(
                                        (edu, id) =>
                                            edu.display !== false && (
                                                <View
                                                    key={id}
                                                    style={dynamicStyles.entryContainer}
                                                >
                                                    <View style={dynamicStyles.entryHeader}>
                                                        <View>
                                                            <Text style={dynamicStyles.entryTitle}>
                                                                {edu.school}
                                                            </Text>
                                                            <Text style={dynamicStyles.entrySubtitle}>
                                                                {edu.degree}
                                                            </Text>
                                                        </View>
                                                        <Text style={dynamicStyles.entryDate}>
                                                            {edu.start_end_dates}
                                                        </Text>
                                                    </View>
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
                                    {renderSkills(section.items)}
                                </View>
                            );
                        case 'projects':
                            return (
                                <View key={idx} style={dynamicStyles.section}>
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
                        default:
                            return null;
                    }
                })}
            </Page>
        </Document>
    );
};
