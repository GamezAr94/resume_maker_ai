import React from 'react';
import { Accordion, Group, Text, ActionIcon } from '@mantine/core';
import { IconEye, IconEyeOff, IconGridDots } from '@tabler/icons-react';
import type { ResumeLayoutItem } from '@/utils/interfaces';
import classes from './resumeEditor.module.css';

/**
 * Defines the props that the SectionCard component will accept.
 */
interface SectionCardProps {
    section: ResumeLayoutItem;
    idx: number;
    children: React.ReactNode; // To render the specific form fields for each section
    onVisibilityToggle: (e: React.MouseEvent<HTMLElement>) => void;
}

/**
 * A reusable UI component that renders a collapsible card for a resume section.
 * It encapsulates the header with its title, drag handle, and visibility toggle,
 * and provides a panel to display the editable form content passed as children.
 */
export function SectionCard({
    section,
    idx,
    children,
    onVisibilityToggle,
}: SectionCardProps) {
    // Determine the visibility state based on the section's display property.
    const isVisible = section.display !== false;
    // Create a unique key for the Accordion item, essential for React's rendering.
    const key = `${section.id}-${idx}`;

    return (
        <Accordion.Item value={key} key={key} className={classes.accordionItem}>
            <Accordion.Control>
                <Group justify="space-between">
                    <Group>
                        <IconGridDots className={classes.dragHandle} />
                        <Text>{section.title}</Text>
                    </Group>
                    <Group>
                        <ActionIcon
                            component="div"
                            variant="subtle"
                            color="gray"
                            onClick={(e) => {
                                // Prevent the click from also toggling the accordion open/closed
                                e.stopPropagation();
                                // Call the handler function passed from the parent component
                                onVisibilityToggle(e);
                            }}
                            data-section={section.id}
                            data-iterator={idx.toString()}
                            title={isVisible ? `Hide` : `Show`}
                        >
                            {isVisible ? (
                                <IconEye size={18} />
                            ) : (
                                <IconEyeOff size={18} />
                            )}
                        </ActionIcon>
                    </Group>
                </Group>
            </Accordion.Control>
            <Accordion.Panel>
                {/* The form content for the specific section is rendered here */}
                {children}
            </Accordion.Panel>
        </Accordion.Item>
    );
}
