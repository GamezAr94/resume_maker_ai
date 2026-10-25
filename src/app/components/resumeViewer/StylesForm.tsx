import { FormJobOfferDataStructure, ResumeStyles } from '@/utils/interfaces';
import {
    ColorInput,
    Divider,
    Group,
    Paper,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Text,
    UnstyledButton,
} from '@mantine/core';
import React from 'react';
import { IconPalette, IconTypography, IconLayoutDistributeHorizontal } from '@tabler/icons-react';
import classes from './StylesForm.module.css';
import { RESUME_SKINS } from '@/lib/pdf-templates/skinRegistry';

interface StylesFormProps {
    onStyleChange: (updates: Partial<ResumeStyles>) => void;
    dataResume: FormJobOfferDataStructure;
}

const ACCENT_PRESETS = [
    '#2563eb',
    '#0d9488',
    '#ea580c',
    '#7c3aed',
    '#dc2626',
    '#0284c7',
    '#16a34a',
    '#111827',
];

const HEADER_PRESETS = [
    '#0f172a',
    '#1e293b',
    '#1e3a8a',
    '#111827',
    '#134e4a',
    '#31102F',
    '#27272a',
    '#000000',
];

export default function StylesForm({
    onStyleChange,
    dataResume,
}: StylesFormProps) {
    const currentStyles: ResumeStyles = dataResume.resume_generated?.styles || {
        theme: 'modern',
    };

    return (
        <Paper p="md" withBorder>
            <Stack gap="lg">
                {/* 1. Skin Selector */}
                <Stack gap="xs">
                    <Group gap="xs">
                        <IconPalette size={20} stroke={1.5} />
                        <Text fw={700} size="md">
                            1. Resume Skin / Template
                        </Text>
                    </Group>
                    <SimpleGrid cols={2} spacing="sm">
                        {RESUME_SKINS.map((skin) => {
                            const isActive = currentStyles.theme === skin.id;
                            return (
                                <UnstyledButton
                                    key={skin.id}
                                    onClick={() =>
                                        onStyleChange({
                                            theme: skin.id,
                                            accentColor: skin.defaultAccent,
                                            headerColor: skin.defaultHeader,
                                        })
                                    }
                                    className={classes.themeCard}
                                    data-active={isActive || undefined}
                                >
                                    <Stack align="center" gap={4}>
                                        <div
                                            className={classes.themeColorSwatch}
                                            style={{
                                                backgroundColor: skin.previewColor,
                                            }}
                                        />
                                        <Text size="sm" fw={600}>
                                            {skin.name}
                                        </Text>
                                        <Text
                                            size="xs"
                                            c="dimmed"
                                            ta="center"
                                            lineClamp={2}
                                        >
                                            {skin.description}
                                        </Text>
                                    </Stack>
                                </UnstyledButton>
                            );
                        })}
                    </SimpleGrid>
                </Stack>

                <Divider />

                {/* 2. Colors */}
                <Stack gap="sm">
                    <Text fw={700} size="md">
                        2. Theme Colors
                    </Text>
                    <Group grow>
                        <ColorInput
                            label="Primary / Header Color"
                            value={currentStyles.headerColor || '#1e293b'}
                            onChangeEnd={(color) =>
                                onStyleChange({ headerColor: color })
                            }
                            swatches={HEADER_PRESETS}
                        />
                        <ColorInput
                            label="Accent / Highlight Color"
                            value={currentStyles.accentColor || '#0d9488'}
                            onChangeEnd={(color) =>
                                onStyleChange({ accentColor: color })
                            }
                            swatches={ACCENT_PRESETS}
                        />
                    </Group>
                </Stack>

                <Divider />

                {/* 3. Typography & Page Density */}
                <Stack gap="sm">
                    <Group gap="xs">
                        <IconTypography size={20} stroke={1.5} />
                        <Text fw={700} size="md">
                            3. Typography & Page Fit
                        </Text>
                    </Group>

                    <div>
                        <Text size="xs" fw={500} mb={4}>
                            Font Size Scale
                        </Text>
                        <SegmentedControl
                            fullWidth
                            value={currentStyles.fontSize || 'medium'}
                            onChange={(val) =>
                                onStyleChange({
                                    fontSize: val as ResumeStyles['fontSize'],
                                })
                            }
                            data={[
                                { label: 'Compact (9pt)', value: 'small' },
                                { label: 'Standard (10pt)', value: 'medium' },
                                { label: 'Large (11pt)', value: 'large' },
                            ]}
                        />
                    </div>

                    <div>
                        <Text size="xs" fw={500} mb={4}>
                            Line & Section Spacing
                        </Text>
                        <SegmentedControl
                            fullWidth
                            value={currentStyles.lineSpacing || 'normal'}
                            onChange={(val) =>
                                onStyleChange({
                                    lineSpacing: val as ResumeStyles['lineSpacing'],
                                })
                            }
                            data={[
                                { label: 'Tight (Fit 1 Page)', value: 'compact' },
                                { label: 'Balanced', value: 'normal' },
                                { label: 'Relaxed', value: 'relaxed' },
                            ]}
                        />
                    </div>

                    <div>
                        <Group gap={4} mb={4}>
                            <IconLayoutDistributeHorizontal size={14} />
                            <Text size="xs" fw={500}>
                                Page Margins
                            </Text>
                        </Group>
                        <SegmentedControl
                            fullWidth
                            value={currentStyles.pageMargin || 'normal'}
                            onChange={(val) =>
                                onStyleChange({
                                    pageMargin: val as ResumeStyles['pageMargin'],
                                })
                            }
                            data={[
                                { label: 'Narrow', value: 'narrow' },
                                { label: 'Standard', value: 'normal' },
                                { label: 'Wide', value: 'wide' },
                            ]}
                        />
                    </div>
                </Stack>
            </Stack>
        </Paper>
    );
}
