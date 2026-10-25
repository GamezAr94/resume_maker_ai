import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    Link,
} from '@react-pdf/renderer';
import { FormJobOfferDataStructure, ResumeThemeId } from '@/utils/interfaces';
import { ModernResumeTemplate } from './ModernResume';
import { ClassicResumeTemplate } from './ClassicResume';
import { MinimalistResumeTemplate } from './MinimalistResume';
import {
    getResolvedStyleTokens,
    getPdfMetadata,
    renderBulletPoints,
    cleanUrlDisplay,
} from './pdfUtils';

// --- 4th Built-In Skin: Executive (ATS High-Contrast Single Column) ---
export const ExecutiveResumeTemplate = ({
    dataResume,
}: {
    dataResume: FormJobOfferDataStructure;
}) => {
    const tokens = getResolvedStyleTokens(dataResume?.resume_generated?.styles, {
        accentColor: '#2563eb',
        headerColor: '#0f172a',
    });
    const meta = getPdfMetadata(dataResume);

    const styles = StyleSheet.create({
        page: {
            fontFamily: 'Lato',
            fontSize: tokens.baseFontSize,
            padding: tokens.pagePadding,
            backgroundColor: '#FFFFFF',
            color: '#1e293b',
        },
        headerBanner: {
            backgroundColor: tokens.headerColor,
            color: '#FFFFFF',
            padding: 16,
            borderRadius: 4,
            marginBottom: tokens.sectionGap,
        },
        userName: {
            fontSize: tokens.nameFontSize,
            fontWeight: 700,
            color: '#FFFFFF',
        },
        jobPosition: {
            fontSize: tokens.entryTitleSize + 1,
            color: tokens.accentColor,
            marginTop: 2,
            fontWeight: 700,
        },
        contactRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 8,
        },
        contactText: {
            fontSize: tokens.smallFontSize,
            color: '#e2e8f0',
            textDecoration: 'none',
            marginRight: 10,
        },
        section: {
            marginBottom: tokens.sectionGap,
        },
        sectionTitle: {
            fontSize: tokens.sectionTitleSize - 1,
            fontWeight: 700,
            color: tokens.headerColor,
            textTransform: 'uppercase',
            backgroundColor: '#f1f5f9',
            paddingVertical: 3,
            paddingHorizontal: 6,
            borderLeftWidth: 3,
            borderLeftColor: tokens.accentColor,
            marginBottom: 6,
        },
        entryContainer: {
            marginBottom: tokens.entryGap,
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 2,
        },
        entryTitle: {
            fontSize: tokens.entryTitleSize,
            fontWeight: 700,
            color: '#0f172a',
        },
        entryDate: {
            fontSize: tokens.smallFontSize,
            color: tokens.accentColor,
            fontWeight: 700,
        },
        description: {
            fontSize: tokens.baseFontSize,
            lineHeight: tokens.lineHeight,
            textAlign: 'justify',
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
        skillsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        skillBadge: {
            borderWidth: 1,
            borderColor: tokens.accentColor,
            color: tokens.headerColor,
            fontSize: tokens.smallFontSize,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 3,
            marginRight: 5,
            marginBottom: 4,
        },
    });

    if (!dataResume || !dataResume.resume_generated) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <Text>Generating resume...</Text>
                </Page>
            </Document>
        );
    }

    const { resume_generated, job_position } = dataResume;

    return (
        <Document {...meta}>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerBanner}>
                    <Text style={styles.userName}>
                        {resume_generated.contact_info.name}
                    </Text>
                    <Text style={styles.jobPosition}>{job_position}</Text>
                    <View style={styles.contactRow}>
                        {resume_generated.contact_info.phone ? (
                            <Text style={styles.contactText}>
                                {resume_generated.contact_info.phone}
                            </Text>
                        ) : null}
                        {resume_generated.contact_info.email ? (
                            <Link
                                style={styles.contactText}
                                src={`mailto:${resume_generated.contact_info.email}`}
                            >
                                {resume_generated.contact_info.email}
                            </Link>
                        ) : null}
                        {resume_generated.contact_info.linkedin ? (
                            <Link
                                style={styles.contactText}
                                src={resume_generated.contact_info.linkedin}
                            >
                                {cleanUrlDisplay(resume_generated.contact_info.linkedin)}
                            </Link>
                        ) : null}
                        {resume_generated.contact_info.github ? (
                            <Link
                                style={styles.contactText}
                                src={resume_generated.contact_info.github}
                            >
                                {cleanUrlDisplay(resume_generated.contact_info.github)}
                            </Link>
                        ) : null}
                    </View>
                </View>

                {resume_generated?.layout?.map((section, idx) => {
                    if (section.display === false) return null;
                    switch (section.id) {
                        case 'narrative':
                            return (
                                <View key={idx} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    <Text style={styles.description}>{section.items}</Text>
                                </View>
                            );
                        case 'experience':
                            return (
                                <View key={idx} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    {section.items.map(
                                        (exp, id) =>
                                            exp.display !== false && (
                                                <View key={id} style={styles.entryContainer}>
                                                    <View style={styles.entryHeader}>
                                                        <Text style={styles.entryTitle}>
                                                            {exp.title} — {exp.company}
                                                        </Text>
                                                        <Text style={styles.entryDate}>
                                                            {exp.start_end_dates}
                                                        </Text>
                                                    </View>
                                                    {renderBulletPoints(
                                                        exp.responsabilities,
                                                        styles,
                                                    )}
                                                </View>
                                            ),
                                    )}
                                </View>
                            );
                        case 'projects':
                            return (
                                <View key={idx} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    {section.items.map(
                                        (pro, id) =>
                                            pro.display !== false && (
                                                <View key={id} style={styles.entryContainer}>
                                                    <View style={styles.entryHeader}>
                                                        <Text style={styles.entryTitle}>
                                                            {pro.name}
                                                        </Text>
                                                        {pro.start_end_dates ? (
                                                            <Text style={styles.entryDate}>
                                                                {pro.start_end_dates}
                                                            </Text>
                                                        ) : null}
                                                    </View>
                                                    {renderBulletPoints(pro.description, styles)}
                                                </View>
                                            ),
                                    )}
                                </View>
                            );
                        case 'education':
                            return (
                                <View key={idx} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    {section.items.map(
                                        (edu, id) =>
                                            edu.display !== false && (
                                                <View key={id} style={styles.entryContainer}>
                                                    <View style={styles.entryHeader}>
                                                        <Text style={styles.entryTitle}>
                                                            {edu.degree} | {edu.school}
                                                        </Text>
                                                        <Text style={styles.entryDate}>
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
                                <View key={idx} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    <View style={styles.skillsRow}>
                                        {section.items.map(
                                            (skill, id) =>
                                                skill && (
                                                    <Text key={id} style={styles.skillBadge}>
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

// ============================================================================
// CENTRAL SKIN REGISTRY
// To add a new skin in the future, just add an entry to RESUME_SKINS below!
// ============================================================================
// --- 5th Built-In Skin: Silicon Valley Tech (Developer / Engineering Focused) ---
export const TechMonoResumeTemplate = ({
    dataResume,
}: {
    dataResume: FormJobOfferDataStructure;
}) => {
    const tokens = getResolvedStyleTokens(dataResume?.resume_generated?.styles, {
        accentColor: '#0284c7',
        headerColor: '#0f172a',
    });
    const meta = getPdfMetadata(dataResume);

    const styles = StyleSheet.create({
        page: {
            fontFamily: 'Roboto',
            fontSize: tokens.baseFontSize,
            padding: tokens.pagePadding,
            backgroundColor: '#FFFFFF',
            color: '#1e293b',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderBottomWidth: 2,
            borderBottomColor: tokens.headerColor,
            paddingBottom: 8,
            marginBottom: tokens.sectionGap,
        },
        headerLeft: {
            width: '60%',
        },
        headerRight: {
            width: '40%',
            alignItems: 'flex-end',
        },
        userName: {
            fontSize: tokens.nameFontSize - 2,
            fontWeight: 700,
            color: tokens.headerColor,
        },
        jobPosition: {
            fontSize: tokens.entryTitleSize,
            color: tokens.accentColor,
            fontWeight: 700,
            marginTop: 2,
        },
        contactItem: {
            fontSize: tokens.smallFontSize,
            color: '#475569',
            textDecoration: 'none',
            marginBottom: 2,
        },
        section: {
            marginBottom: tokens.sectionGap,
        },
        sectionHeaderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 5,
        },
        sectionPrefix: {
            fontSize: tokens.sectionTitleSize - 1,
            fontWeight: 700,
            color: tokens.accentColor,
            marginRight: 4,
        },
        sectionTitle: {
            fontSize: tokens.sectionTitleSize - 1,
            fontWeight: 700,
            color: tokens.headerColor,
            textTransform: 'uppercase',
        },
        entryContainer: {
            marginBottom: tokens.entryGap,
            paddingLeft: 6,
            borderLeftWidth: 1.5,
            borderLeftColor: '#e2e8f0',
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 2,
        },
        entryTitle: {
            fontSize: tokens.entryTitleSize,
            fontWeight: 700,
            color: '#0f172a',
        },
        entryDate: {
            fontSize: tokens.smallFontSize,
            color: tokens.accentColor,
            fontWeight: 700,
        },
        description: {
            fontSize: tokens.baseFontSize,
            lineHeight: tokens.lineHeight,
            textAlign: 'justify',
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
        skillsWrap: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        skillTag: {
            backgroundColor: '#f1f5f9',
            color: tokens.headerColor,
            fontSize: tokens.smallFontSize,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 3,
            marginRight: 5,
            marginBottom: 4,
        },
    });

    if (!dataResume || !dataResume.resume_generated) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <Text>Generating resume...</Text>
                </Page>
            </Document>
        );
    }

    const { resume_generated, job_position } = dataResume;

    return (
        <Document {...meta}>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.userName}>
                            {resume_generated.contact_info.name}
                        </Text>
                        <Text style={styles.jobPosition}>{job_position}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        {resume_generated.contact_info.email ? (
                            <Link
                                style={styles.contactItem}
                                src={`mailto:${resume_generated.contact_info.email}`}
                            >
                                {resume_generated.contact_info.email}
                            </Link>
                        ) : null}
                        {resume_generated.contact_info.phone ? (
                            <Text style={styles.contactItem}>
                                {resume_generated.contact_info.phone}
                            </Text>
                        ) : null}
                        {resume_generated.contact_info.github ? (
                            <Link
                                style={styles.contactItem}
                                src={resume_generated.contact_info.github}
                            >
                                {cleanUrlDisplay(resume_generated.contact_info.github)}
                            </Link>
                        ) : null}
                        {resume_generated.contact_info.linkedin ? (
                            <Link
                                style={styles.contactItem}
                                src={resume_generated.contact_info.linkedin}
                            >
                                {cleanUrlDisplay(resume_generated.contact_info.linkedin)}
                            </Link>
                        ) : null}
                    </View>
                </View>

                {resume_generated?.layout?.map((section, idx) => {
                    if (section.display === false) return null;
                    return (
                        <View key={idx} style={styles.section}>
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionPrefix}>//</Text>
                                <Text style={styles.sectionTitle}>
                                    {section.title}
                                </Text>
                            </View>
                            {section.id === 'narrative' && (
                                <Text style={styles.description}>{section.items}</Text>
                            )}
                            {section.id === 'experience' &&
                                section.items.map(
                                    (exp, id) =>
                                        exp.display !== false && (
                                            <View key={id} style={styles.entryContainer}>
                                                <View style={styles.entryHeader}>
                                                    <Text style={styles.entryTitle}>
                                                        {exp.title} @ {exp.company}
                                                    </Text>
                                                    <Text style={styles.entryDate}>
                                                        {exp.start_end_dates}
                                                    </Text>
                                                </View>
                                                {renderBulletPoints(
                                                    exp.responsabilities,
                                                    styles,
                                                )}
                                            </View>
                                        ),
                                )}
                            {section.id === 'projects' &&
                                section.items.map(
                                    (pro, id) =>
                                        pro.display !== false && (
                                            <View key={id} style={styles.entryContainer}>
                                                <View style={styles.entryHeader}>
                                                    <Text style={styles.entryTitle}>
                                                        {pro.name}
                                                    </Text>
                                                    {pro.start_end_dates ? (
                                                        <Text style={styles.entryDate}>
                                                            {pro.start_end_dates}
                                                        </Text>
                                                    ) : null}
                                                </View>
                                                {renderBulletPoints(
                                                    pro.description,
                                                    styles,
                                                )}
                                            </View>
                                        ),
                                )}
                            {section.id === 'education' &&
                                section.items.map(
                                    (edu, id) =>
                                        edu.display !== false && (
                                            <View key={id} style={styles.entryContainer}>
                                                <View style={styles.entryHeader}>
                                                    <Text style={styles.entryTitle}>
                                                        {edu.degree} — {edu.school}
                                                    </Text>
                                                    <Text style={styles.entryDate}>
                                                        {edu.start_end_dates}
                                                    </Text>
                                                </View>
                                            </View>
                                        ),
                                )}
                            {section.id === 'skills' && (
                                <View style={styles.skillsWrap}>
                                    {section.items.map(
                                        (skill, id) =>
                                            skill && (
                                                <Text key={id} style={styles.skillTag}>
                                                    {skill}
                                                </Text>
                                            ),
                                    )}
                                </View>
                            )}
                        </View>
                    );
                })}
            </Page>
        </Document>
    );
};

// --- 6th Built-In Skin: Compact 1-Page Pro (High-Density Wall Street / Engineering) ---
export const CompactProResumeTemplate = ({
    dataResume,
}: {
    dataResume: FormJobOfferDataStructure;
}) => {
    const tokens = getResolvedStyleTokens(dataResume?.resume_generated?.styles, {
        accentColor: '#4f46e5',
        headerColor: '#111827',
    });
    const meta = getPdfMetadata(dataResume);

    const styles = StyleSheet.create({
        page: {
            fontFamily: 'Lato',
            fontSize: tokens.baseFontSize - 0.5,
            paddingVertical: Math.max(16, tokens.pagePadding - 6),
            paddingHorizontal: tokens.pagePadding,
            backgroundColor: '#FFFFFF',
            color: '#111827',
        },
        header: {
            borderBottomWidth: 1.5,
            borderBottomColor: tokens.headerColor,
            paddingBottom: 5,
            marginBottom: tokens.sectionGap - 2,
        },
        topRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
        },
        userName: {
            fontSize: tokens.nameFontSize - 4,
            fontWeight: 700,
            color: tokens.headerColor,
            textTransform: 'uppercase',
        },
        jobPosition: {
            fontSize: tokens.entryTitleSize,
            fontWeight: 700,
            color: tokens.accentColor,
        },
        contactLine: {
            fontSize: tokens.smallFontSize - 0.5,
            color: '#374151',
            marginTop: 3,
        },
        section: {
            marginBottom: tokens.sectionGap - 2,
        },
        sectionTitle: {
            fontSize: tokens.baseFontSize + 1,
            fontWeight: 700,
            color: tokens.headerColor,
            textTransform: 'uppercase',
            borderBottomWidth: 0.75,
            borderBottomColor: tokens.accentColor,
            paddingBottom: 1,
            marginBottom: 4,
        },
        entryContainer: {
            marginBottom: tokens.entryGap - 1,
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 1.5,
        },
        entryTitle: {
            fontSize: tokens.baseFontSize + 0.5,
            fontWeight: 700,
        },
        entryDate: {
            fontSize: tokens.smallFontSize - 0.5,
            fontWeight: 700,
            color: '#4b5563',
        },
        description: {
            fontSize: tokens.baseFontSize - 0.5,
            lineHeight: tokens.lineHeight,
            textAlign: 'justify',
        },
        bulletPoint: {
            flexDirection: 'row',
            marginBottom: 1.5,
        },
        bullet: {
            width: 10,
            fontSize: tokens.baseFontSize - 0.5,
            color: tokens.accentColor,
        },
        bulletText: {
            flex: 1,
            fontSize: tokens.baseFontSize - 0.5,
            lineHeight: tokens.lineHeight,
            textAlign: 'justify',
        },
    });

    if (!dataResume || !dataResume.resume_generated) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <Text>Generating resume...</Text>
                </Page>
            </Document>
        );
    }

    const { resume_generated, job_position } = dataResume;
    const contactParts = [
        resume_generated.contact_info.email,
        resume_generated.contact_info.phone,
        cleanUrlDisplay(resume_generated.contact_info.linkedin),
        cleanUrlDisplay(resume_generated.contact_info.github),
        cleanUrlDisplay(resume_generated.contact_info.portfolio),
    ].filter(Boolean);

    return (
        <Document {...meta}>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.topRow}>
                        <Text style={styles.userName}>
                            {resume_generated.contact_info.name}
                        </Text>
                        <Text style={styles.jobPosition}>{job_position}</Text>
                    </View>
                    <Text style={styles.contactLine}>
                        {contactParts.join('  |  ')}
                    </Text>
                </View>

                {resume_generated?.layout?.map((section, idx) => {
                    if (section.display === false) return null;
                    return (
                        <View key={idx} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            {section.id === 'narrative' && (
                                <Text style={styles.description}>{section.items}</Text>
                            )}
                            {section.id === 'experience' &&
                                section.items.map(
                                    (exp, id) =>
                                        exp.display !== false && (
                                            <View key={id} style={styles.entryContainer}>
                                                <View style={styles.entryHeader}>
                                                    <Text style={styles.entryTitle}>
                                                        {exp.company} — {exp.title}
                                                    </Text>
                                                    <Text style={styles.entryDate}>
                                                        {exp.start_end_dates}
                                                    </Text>
                                                </View>
                                                {renderBulletPoints(
                                                    exp.responsabilities,
                                                    styles,
                                                )}
                                            </View>
                                        ),
                                )}
                            {section.id === 'projects' &&
                                section.items.map(
                                    (pro, id) =>
                                        pro.display !== false && (
                                            <View key={id} style={styles.entryContainer}>
                                                <View style={styles.entryHeader}>
                                                    <Text style={styles.entryTitle}>
                                                        {pro.name}
                                                    </Text>
                                                    {pro.start_end_dates ? (
                                                        <Text style={styles.entryDate}>
                                                            {pro.start_end_dates}
                                                        </Text>
                                                    ) : null}
                                                </View>
                                                {renderBulletPoints(
                                                    pro.description,
                                                    styles,
                                                )}
                                            </View>
                                        ),
                                )}
                            {section.id === 'education' &&
                                section.items.map(
                                    (edu, id) =>
                                        edu.display !== false && (
                                            <View key={id} style={styles.entryContainer}>
                                                <View style={styles.entryHeader}>
                                                    <Text style={styles.entryTitle}>
                                                        {edu.school} — {edu.degree}
                                                    </Text>
                                                    <Text style={styles.entryDate}>
                                                        {edu.start_end_dates}
                                                    </Text>
                                                </View>
                                            </View>
                                        ),
                                )}
                            {section.id === 'skills' && (
                                <Text style={styles.description}>
                                    {section.items.filter(Boolean).join('  •  ')}
                                </Text>
                            )}
                        </View>
                    );
                })}
            </Page>
        </Document>
    );
};

// ============================================================================
// CENTRAL SKIN REGISTRY (6 Skins)
// ============================================================================
export interface SkinDefinition {
    id: ResumeThemeId;
    name: string;
    description: string;
    previewColor: string;
    defaultAccent: string;
    defaultHeader: string;
    component: React.ComponentType<{ dataResume: FormJobOfferDataStructure }>;
}

export const RESUME_SKINS: SkinDefinition[] = [
    {
        id: 'modern',
        name: 'Modern',
        description: 'Clean single-column with bold accent dividers & skill pills',
        previewColor: '#0d9488',
        defaultAccent: '#0d9488',
        defaultHeader: '#1e3a8a',
        component: ModernResumeTemplate,
    },
    {
        id: 'executive',
        name: 'Executive',
        description: 'High-contrast banner header with left-accented section bars',
        previewColor: '#2563eb',
        defaultAccent: '#2563eb',
        defaultHeader: '#0f172a',
        component: ExecutiveResumeTemplate,
    },
    {
        id: 'tech_mono',
        name: 'Silicon Valley Tech',
        description: 'Engineering layout with // code headers & left border timeline',
        previewColor: '#0284c7',
        defaultAccent: '#0284c7',
        defaultHeader: '#0f172a',
        component: TechMonoResumeTemplate,
    },
    {
        id: 'compact_pro',
        name: 'Compact 1-Page Pro',
        description: 'High-density layout designed to fit maximum experience on 1 page',
        previewColor: '#4f46e5',
        defaultAccent: '#4f46e5',
        defaultHeader: '#111827',
        component: CompactProResumeTemplate,
    },
    {
        id: 'classic',
        name: 'Classic Sidebar',
        description: 'Two-column layout with dark contact/skills sidebar',
        previewColor: '#1e293b',
        defaultAccent: '#38bdf8',
        defaultHeader: '#1e293b',
        component: ClassicResumeTemplate,
    },
    {
        id: 'minimalist',
        name: 'Minimalist ATS',
        description: 'Ultra-clean monochrome-ready ATS standard layout',
        previewColor: '#374151',
        defaultAccent: '#111827',
        defaultHeader: '#000000',
        component: MinimalistResumeTemplate,
    },
];

export function renderResumeTemplate(dataResume: FormJobOfferDataStructure) {
    const themeId = dataResume?.resume_generated?.styles?.theme || 'modern';
    const found = RESUME_SKINS.find((s) => s.id === themeId) || RESUME_SKINS[0];
    const SkinComponent = found.component;
    return <SkinComponent dataResume={dataResume} />;
}
