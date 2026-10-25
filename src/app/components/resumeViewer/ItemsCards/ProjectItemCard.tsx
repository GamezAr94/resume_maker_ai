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
import classes from './resumeEditor.module.css';
import { Project } from '@/utils/interfaces';
import { CHARACTER_LIMITS } from '@/utils/configLimits';

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
                        <Text size="sm" fw={500}>
                            {item.name}
                        </Text>
                    </Group>
                    <Group gap="xs">
                        <ActionIcon
                            component="div"
                            variant="subtle"
                            color={isVisible ? 'blue' : 'gray'}
                            title={isVisible ? 'Hide' : 'Show'}
                            onClick={(e) => {
                                e.stopPropagation();
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
                    <Group grow>
                        <TextInput
                            label="Project Name"
			    name="{proj-name-${itemIndex}}"
                            maxLength={CHARACTER_LIMITS.title}
                            value={item.name || ''}
                            onChange={(e) =>
                                onItemChange(
                                    idx,
                                    itemIndex,
                                    'name',
                                    e.currentTarget.value,
                                )
                            }
                        />
                        <TextInput
                            label="Dates / Subtitle (Optional)"
			    name="{proj-dates-${itemIndex}}"
                            value={item.start_end_dates || ''}
                            onChange={(e) =>
                                onItemChange(
                                    idx,
                                    itemIndex,
                                    'start_end_dates',
                                    e.currentTarget.value,
                                )
                            }
                        />
                    </Group>
                    <Textarea
                        label="Bullet Points (One per line)"
			name="{proj-desc-${itemIndex}}"
                        maxLength={CHARACTER_LIMITS.description}
                        value={item.description || ''}
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
