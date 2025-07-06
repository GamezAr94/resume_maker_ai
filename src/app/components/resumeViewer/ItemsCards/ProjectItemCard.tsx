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
    const isVisible = item.display !== false;
    const key = `${sectionId}-item-${itemIndex}`;

    return (
        <Accordion.Item value={key} className={classes.nestedAccordionItem}>
            <Accordion.Control>
                <Group justify="space-between">
                    <Group align="center" gap="xs">
                        <IconGridDots className={classes.dragHandle} />
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
    );
}
