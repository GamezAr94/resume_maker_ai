import React from 'react';
import {
    Accordion,
    Group,
    Text,
    ActionIcon,
    Stack,
    TextInput,
} from '@mantine/core';
import {
    IconEye,
    IconEyeOff,
    IconTrash,
    IconChevronRight,
    IconGridDots,
} from '@tabler/icons-react';
import type { Education } from '@/utils/interfaces';
import classes from './resumeEditor.module.css';

interface EducationItemCardProps {
    item: Education;
    sectionId: string;
    itemIndex: number;
}

export function EducationItemCard({
    item,
    sectionId,
    itemIndex,
}: EducationItemCardProps) {
    const isVisible = item.display !== false;
    const key = `${sectionId}-item-${itemIndex}`;

    return (
        <Accordion.Item value={key} className={classes.nestedAccordionItem}>
            <Accordion.Control>
                <Group justify="space-between">
                    <Group align="center" gap="xs">
                        <IconGridDots className={classes.dragHandle} />
                        <Text size="sm" fw={500}>
                            {item.degree} at {item.school}
                        </Text>
                    </Group>
                    <Group gap="xs">
                        <ActionIcon
                            component="div"
                            variant="subtle"
                            color="gray"
                            title={isVisible ? `Hide` : `Show`}
                            onClick={(e) => e.stopPropagation()}
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
                    <TextInput label="Degree" defaultValue={item.degree} />
                    <TextInput label="School" defaultValue={item.school} />
                </Stack>
            </Accordion.Panel>
        </Accordion.Item>
    );
}
