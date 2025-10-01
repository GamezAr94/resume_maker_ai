import React from 'react';
import { View, Text } from '@react-pdf/renderer';

// Define a type for the styles object to ensure type safety.
// We only need the properties this function uses.
// Define a simple, explicit type for the style properties we use.
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

// Use this simple type for our styles.
type BulletPointStyles = {
    bulletPoint: StyleObject;
    bullet: StyleObject;
    bulletText: StyleObject;
};

/**
 * Renders a string containing newline characters as a series of bullet points.
 * @param text - The string to parse (e.g., from 'responsibilities' or 'description').
 * @param styles - The style object from the parent template's StyleSheet.
 * @returns A list of <View> components, each representing a bullet point.
 */
export const renderBulletPoints = (text: string, styles: BulletPointStyles) => {
    // Return null if the text is empty to avoid rendering empty space
    if (!text || typeof text !== 'string') {
        return null;
    }

    const points = text.split('\n').filter((p) => p.trim() !== '');

    return points.map((point, index) => (
        <View key={index} style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{point.replace(/^- /, '')}</Text>
        </View>
    ));
};
