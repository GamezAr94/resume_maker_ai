import React from 'react';
import {
    Accordion,
    Group,
    Text,
    ActionIcon,
    Stack,
    TextInput,
    Textarea,
} from '@mantine/core';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import type { Experience } from '@/utils/interfaces';

interface ExperienceItemCardProps {
    item: Experience;
    sectionId: string;
    itemIndex: number;
    idx: number;
    onVisibilityToggle: (e: React.MouseEvent<HTMLElement>) => void;
    onItemChange: (
        sectionIndex: number,
        itemIndex: number,
        fieldName: string,
        value: string,
    ) => void;
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
    idx,
    onVisibilityToggle,
    onItemChange,
}: ExperienceItemCardProps) {
    const isVisible = item.display !== false;
    const key = `${sectionId}-item-${itemIndex}`;

    return (
        <Accordion.Item value={key} className={classes.nestedAccordionItem}>
            <Accordion.Control>
                <Group justify="space-between">
                    <Group gap="xs" align="center">
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
                                // Prevent the click from also toggling the accordion open/closed
                                e.stopPropagation();
                                // Call the handler function passed from the parent component
                                onVisibilityToggle(e);
                            }}
                            data-section={sectionId.toString()}
                            data-iterator={idx.toString()}
                            data-subitem-index={itemIndex.toString()}
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
                        onChange={(e) =>
                            onItemChange(
                                idx,
                                itemIndex,
                                'title',
                                e.currentTarget.value,
                            )
                        }
                    />
                    <TextInput
                        label="Company"
                        defaultValue={item.company}
                        onChange={(e) =>
                            onItemChange(
                                idx,
                                itemIndex,
                                'company',
                                e.currentTarget.value,
                            )
                        }
                    />
                    {/* TODO this array is not to make an union, it is to show multiple options to the user to choose */}
                    <Textarea
                        label="Responsibilities"
                        value={item.responsabilities}
                        autosize
                        minRows={4}
                        onChange={(e) =>
                            onItemChange(
                                idx,
                                itemIndex,
                                'responsabilities',
                                e.currentTarget.value,
                            )
                        }
                    />
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
    );
}
