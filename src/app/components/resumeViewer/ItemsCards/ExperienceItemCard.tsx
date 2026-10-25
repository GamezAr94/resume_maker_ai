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
import { CHARACTER_LIMITS } from '@/utils/configLimits';
import classes from './resumeEditor.module.css';

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
}

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
                            label="Job Title"
		            name="{exp-title-${itemIndex}}"
                            maxLength={CHARACTER_LIMITS.title}
                            value={item.title || ''}
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
		            name="{exp-company-${itemIndex}}"
                            maxLength={CHARACTER_LIMITS.company}
                            value={item.company || ''}
                            onChange={(e) =>
                                onItemChange(
                                    idx,
                                    itemIndex,
                                    'company',
                                    e.currentTarget.value,
                                )
                            }
                        />
                    </Group>
                    <TextInput
                        label="Dates (e.g., Jul 2022 - Present)"
			name="{exp-dates-${itemIndex}}"
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
                    <Textarea
                        label="Bullet Points (One per line)"
			name="{exp-bullets-${itemIndex}}"
                        value={item.responsabilities || ''}
                        maxLength={CHARACTER_LIMITS.description}
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
