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
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconEye, IconEyeOff, IconGridDots } from '@tabler/icons-react';
import classes from './resumeEditor.module.css';
import { Project } from '@/utils/interfaces';

interface ProjectItemCardProps {
    item: Project;
    sectionId: string;
    itemIndex: number;
    onVisibilityToggle: (e: React.MouseEvent<HTMLElement>) => void;
    idx: number;
    onItemChange: (
        sectionIndex: number,
        itemIndex: number,
        fieldName: string,
        value: string,
    ) => void;
}

export function ProjectItemCard({
    item,
    sectionId,
    itemIndex,
    onVisibilityToggle,
    onItemChange,
    idx,
}: ProjectItemCardProps) {
    // Call the useSortable hook.
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: itemIndex });

    // Create the style object for drag transformations
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isVisible = item.display !== false;
    const key = `${sectionId}-item-${itemIndex}`;

    return (
        <div ref={setNodeRef} style={style}>
            <Accordion.Item value={key} className={classes.nestedAccordionItem}>
                <Accordion.Control>
                    <Group justify="space-between">
                        <Group align="center" gap="xs">
                            <div
                                {...attributes}
                                {...listeners}
                                style={{ cursor: 'grab' }}
                            >
                                <IconGridDots className={classes.dragHandle} />
                            </div>
                            <Text size="sm" fw={500}>
                                {item.name}
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
                            label="Project Name"
                            defaultValue={item.name}
                            onChange={(e) =>
                                onItemChange(
                                    idx,
                                    itemIndex,
                                    'name',
                                    e.currentTarget.value,
                                )
                            }
                        />
                        {/* TODO this array is not to make an union, it is to show multiple options to the user to choose */}
                        <Textarea
                            label="Description"
                            defaultValue={item.description}
                            autosize
                            minRows={4}
                            onChange={(e) =>
                                onItemChange(
                                    idx,
                                    itemIndex,
                                    'description',
                                    e.currentTarget.value,
                                )
                            }
                        />
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        </div>
    );
}
