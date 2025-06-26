import React, { ChangeEvent } from 'react';
import {
    Accordion,
    Group,
    Text,
    ActionIcon,
    Stack,
    TextInput,
    Textarea,
} from '@mantine/core';
import { IconEye, IconEyeOff, IconGridDots } from '@tabler/icons-react';
import type { Experience } from '@/utils/interfaces';

// Using 'any' for now as the specific item type might vary (Experience, Project, etc.)
// In a stricter setup, you would use a generic type.
type Item = any;

interface ExperienceItemCardProps {
    item: Experience;
    sectionId: string;
    itemIndex: number;
    // We'll add functions to handle changes and deletion later
    // onUpdate: (itemIndex: number, field: string, value: any) => void;
    // onDelete: (itemIndex: number) => void;
}

// Import the shared CSS module
import classes from './resumeEditor.module.css';

/**
 * A reusable card for displaying a single item within a section (e.g., one job experience).
 * It has its own collapsible header and panel for editing the item's details.
 */
export function ExperienceItemCard({
    item,
    sectionId,
    itemIndex,
}: ExperienceItemCardProps) {
    const isVisible = item.display !== false;
    const key = `${sectionId}-item-${itemIndex}`;

    return (
        <Accordion.Item value={key} className={classes.nestedAccordionItem}>
            <Accordion.Control>
                <Group justify="space-between">
                    <Group gap="xs" align="center">
                        <IconGridDots className={classes.dragHandle} />
                        <Text size="sm" fw={500}>
                            {item.title} at {item.company}
                        </Text>
                    </Group>
                    <Group gap="xs">
                        <ActionIcon
                            component="div"
                            variant="subtle"
                            color="gray"
                            title={isVisible ? `Hide` : `Show`}
                            onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement item-specific hide/show logic
                            }}
                        >
                            {isVisible ? (
                                <IconEye size={16} />
                            ) : (
                                <IconEyeOff size={16} />
                            )}
                        </ActionIcon>
                    </Group>
                </Group>
            </Accordion.Control>
            <Accordion.Panel>
                <Stack>
                    <TextInput
                        label="Job Title"
                        defaultValue={item.title}
                        // Add onChange handler
                    />
                    <TextInput
                        label="Company"
                        defaultValue={item.company}
                        // Add onChange handler
                    />
                    {/* TODO this array is not to make an union, it is to show multiple options to the user to choose */}
                    <Textarea
                        label="Responsibilities"
                        defaultValue={
                            Array.isArray(item.responsabilities)
                                ? item.responsabilities.join('\n')
                                : ''
                        }
                        autosize
                        minRows={4}
                        // Add onChange handler
                    />
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
    );
}
