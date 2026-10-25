import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { FormJobOfferDataStructure, ResumeStyles } from '@/utils/interfaces';

type StyleObject = {
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    marginBottom?: number | string;
    width?: number | string;
    fontSize?: number;
    flex?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: number;
    paddingRight?: number;
};

type BulletPointStyles = {
    bulletPoint: StyleObject;
    bullet: StyleObject;
    bulletText: StyleObject;
};

export interface ResolvedStyleTokens {
    baseFontSize: number;
    smallFontSize: number;
    entryTitleSize: number;
    sectionTitleSize: number;
    nameFontSize: number;
    lineHeight: number;
    pagePadding: number;
    sectionGap: number;
    entryGap: number;
    accentColor: string;
    headerColor: string;
}

export function getResolvedStyleTokens(
    styles?: Partial<ResumeStyles>,
    defaults?: { accentColor?: string; headerColor?: string },
): ResolvedStyleTokens {
    const fontMap = {
        small: 9,
        medium: 10,
        large: 11,
    };
    const lineMap = {
        compact: 1.2,
        normal: 1.38,
        relaxed: 1.55,
    };
    const marginMap = {
        narrow: 20,
        normal: 30,
        wide: 42,
    };

    const baseFontSize = fontMap[styles?.fontSize || 'medium'] || 10;
    const lineHeight = lineMap[styles?.lineSpacing || 'normal'] || 1.38;
    const pagePadding = marginMap[styles?.pageMargin || 'normal'] || 30;

    return {
        baseFontSize,
        smallFontSize: baseFontSize - 1,
        entryTitleSize: baseFontSize + 1.5,
        sectionTitleSize: baseFontSize + 3.5,
        nameFontSize: baseFontSize * 2.6,
        lineHeight,
        pagePadding,
        sectionGap: styles?.lineSpacing === 'compact' ? 7 : styles?.lineSpacing === 'relaxed' ? 14 : 10,
        entryGap: styles?.lineSpacing === 'compact' ? 4 : styles?.lineSpacing === 'relaxed' ? 9 : 6,
        accentColor: styles?.accentColor || defaults?.accentColor || '#2563eb',
        headerColor: styles?.headerColor || defaults?.headerColor || '#1e293b',
    };
}

export function getPdfMetadata(dataResume: FormJobOfferDataStructure) {
    const name = dataResume?.resume_generated?.contact_info?.name || 'Candidate';
    const job = dataResume?.job_position || 'Professional Role';
    const company = dataResume?.company_name || 'Target Company';
    const keywords = (dataResume?.resume_generated?.keywords || []).join(', ');

    return {
        title: `${name} - ${job} (${company})`,
        author: name,
        subject: `Resume for ${job} at ${company}`,
        keywords: keywords || `${job}, ${company}, Resume`,
        creator: 'Resume Maker AI (Self-Hosted)',
        producer: 'Resume Maker AI PDF Engine',
    };
}

export function cleanUrlDisplay(urlString?: string): string {
    if (!urlString) return '';
    return urlString.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
}

export const renderBulletPoints = (text: string, styles: BulletPointStyles) => {
    if (!text || typeof text !== 'string') {
        return null;
    }

    const points = text.split('\n').filter((p) => p.trim() !== '');

    return points.map((point, index) => (
        <View key={index} style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
                {point.replace(/^[-•*]\s*/, '').trim()}
            </Text>
        </View>
    ));
};
