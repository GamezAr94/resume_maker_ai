import React from 'react';
import { Accordion, Group, Text, ActionIcon, Badge } from '@mantine/core';
import {
    IconEye,
    IconEyeOff,
    IconArrowUp,
    IconArrowDown,
} from '@tabler/icons-react';
import type { ResumeLayoutItem } from '@/utils/interfaces';
import classes from './resumeEditor.module.css';

interface SectionCardProps {
    section: ResumeLayoutItem;
    idx: number;
    totalSections: number;
    children: React.ReactNode;
    onVisibilityToggle: (e: React.MouseEvent<HTMLElement>) => void;
    onMoveSection: (index: number, direction: 'up' | 'down') => void;
}

export function SectionCard({
    section,
    idx,
    totalSections,
    children,
    onVisibilityToggle,
    onMoveSection,
}: SectionCardProps) {
    const isVisible = section.display !== false;
    const key = `${section.id}-${idx}`;

    return (
        <Accordion.Item value={key} key={key} className={classes.accordionItem}>
            <Accordion.Control>
                <Group justify="space-between">
                    <Group gap="xs">
                        <Text fw={600}>{section.title}</Text>
                        {!isVisible && (
                            <Badge size="xs" color="gray" variant="outline">
                                Hidden
                            </Badge>
                        )}
                    </Group>
                    <Group gap={4}>
                        <ActionIcon
                            component="div"
                            variant="subtle"
                            color="gray"
                            disabled={idx === 0}
                            title="Move Section Up"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (idx > 0) onMoveSection(idx, 'up');
                            }}
                        >
                            <IconArrowUp size={16} />
                        </ActionIcon>
                        <ActionIcon
                            component="div"
                            variant="subtle"
                            color="gray"
                            disabled={idx >= totalSections - 1}
                            title="Move Section Down"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (idx < totalSections - 1)
                                    onMoveSection(idx, 'down');
                            }}
                        >
                            <IconArrowDown size={16} />
                        </ActionIcon>
                        <ActionIcon
                            component="div"
                            variant="subtle"
                            color={isVisible ? 'blue' : 'gray'}
                            onClick={(e) => {
                                e.stopPropagation();
                                onVisibilityToggle(e);
                            }}
                            data-section={section.id}
                            data-iterator={idx.toString()}
                            title={isVisible ? 'Hide Section' : 'Show Section'}
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
            <Accordion.Panel>{children}</Accordion.Panel>
        </Accordion.Item>
    );
}
