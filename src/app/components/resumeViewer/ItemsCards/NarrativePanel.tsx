import React, { ChangeEvent } from 'react';
import { Textarea } from '@mantine/core';
import type { NarrativeSection } from '@/utils/interfaces';
import { CHARACTER_LIMITS } from '@/utils/configLimits';

interface NarrativePanelProps {
    section: NarrativeSection;
    onSectionChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    sectionIndex: number;
}

/**
 * Renders the editing form for the Narrative/Summary section.
 * It uses a Textarea to allow for free-form paragraph editing.
 */
export function NarrativePanel({
    section,
    onSectionChange,
    sectionIndex,
}: NarrativePanelProps) {
    return (
        <Textarea
            label="Summary Content"
            placeholder="Write your professional summary here..."
            maxLength={CHARACTER_LIMITS.description}
            defaultValue={section.items}
            onChange={onSectionChange}
            data-section={section.id}
            data-iterator={sectionIndex} // Pass the index for the parent handler
            name="items" // We are editing the 'items' array of the section
            autosize
            minRows={5}
        />
    );
}
