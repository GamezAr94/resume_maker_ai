import React from 'react';
import {
    Accordion,
    Group,
    Text,
    ActionIcon,
    Stack,
    TextInput,
} from '@mantine/core';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import type { Education } from '@/utils/interfaces';
import classes from './resumeEditor.module.css';
import { CHARACTER_LIMITS } from '@/utils/configLimits';

interface EducationItemCardProps {
    item: Education;
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

export function EducationItemCard({
    item,
    sectionId,
    itemIndex,
    idx,
    onVisibilityToggle,
    onItemChange,
}: EducationItemCardProps) {
    const isVisible = item.display !== false;
    const key = `${sectionId}-item-${itemIndex}`;

    return (
        <Accordion.Item value={key} className={classes.nestedAccordionItem}>
            <Accordion.Control>
                <Group justify="space-between">
                    <Group align="center" gap="xs">
                        <Text size="sm" fw={500}>
                            {item.degree} at {item.school}
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
                    <TextInput
                        label="Degree"
                        value={item.degree || ''}
                        maxLength={CHARACTER_LIMITS.title}
                        onChange={(e) =>
                            onItemChange(
                                idx,
                                itemIndex,
                                'degree',
                                e.currentTarget.value,
                            )
                        }
                    />
                    <TextInput
                        label="School"
                        value={item.school || ''}
                        maxLength={CHARACTER_LIMITS.title}
                        onChange={(e) =>
                            onItemChange(
                                idx,
                                itemIndex,
                                'school',
                                e.currentTarget.value,
                            )
                        }
                    />
                    <TextInput
                        label="Dates"
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
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
    );
}
