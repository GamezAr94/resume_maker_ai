import React, { ChangeEvent } from 'react';
import { Textarea } from '@mantine/core';
import type { SkillsSection } from '@/utils/interfaces';
import classes from './resumeEditor.module.css';
import { CHARACTER_LIMITS } from '@/utils/configLimits';

interface SkillsPanelProps {
    section: SkillsSection;
    onSectionChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    sectionIndex: number;
}

/**
 * Renders the editing form for the Skills section.
 * It uses a Textarea where each line corresponds to a single skill.
 */
export function SkillsPanel({
    section,
    onSectionChange,
    sectionIndex,
}: SkillsPanelProps) {
    /* TODO this array is not to make an union, it is to show multiple options to the user to choose */
    // Join the array of skill strings into a single string, with each skill on a new line.
    const skillsText = Array.isArray(section.items)
        ? section.items.join('\n')
        : '';

    return (
        <Textarea
            label="Skills List"
            placeholder="Enter each skill on a new line..."
            maxLength={CHARACTER_LIMITS.description}
            value={skillsText}
            onChange={onSectionChange}
            data-section={section.id}
            data-iterator={sectionIndex} // Pass the index for the parent handler
            name="items" // We are editing the 'items' array of the section
            autosize
            minRows={5}
            className={classes.descriptionTextarea}
        />
    );
}
