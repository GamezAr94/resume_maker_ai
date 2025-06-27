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
    onVisibilityToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
    idx: number;
}

export function ProjectItemCard({
    item,
    sectionId,
    itemIndex,
    onVisibilityToggle,
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
                                onVisibilityToggle(e as any);
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
                    <TextInput label="Project Name" defaultValue={item.name} />
                    {/* TODO this array is not to make an union, it is to show multiple options to the user to choose */}
                    <Textarea
                        label="Description"
                        defaultValue={
                            Array.isArray(item.description)
                                ? item.description.join('\n')
                                : ''
                        }
                        autosize
                        minRows={4}
                    />
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
    );
}
