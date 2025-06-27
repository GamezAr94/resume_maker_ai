import React, { ChangeEvent } from 'react';
import { Textarea } from '@mantine/core';
import type { NarrativeSection } from '@/utils/interfaces';

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
    /* TODO this array is not to make an union, it is to show multiple options to the user to choose */
    // The 'content' from your data structure is mapped to the 'items' property in the interface.
    // We join the array elements to create a single string for the textarea.
    const narrativeText = Array.isArray(section.items)
        ? section.items.join('\n\n')
        : '';

    return (
        <Textarea
            label="Summary Content"
            placeholder="Write your professional summary here..."
            value={narrativeText}
            onChange={onSectionChange}
            data-section={section.id}
            data-iterator={sectionIndex} // Pass the index for the parent handler
            name="items" // We are editing the 'items' array of the section
            autosize
            minRows={5}
        />
    );
}
