import { FormJobOfferDataStructure } from '@/utils/interfaces';
import {
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    UnstyledButton,
} from '@mantine/core';
import React from 'react';
import { IconPalette } from '@tabler/icons-react';
import classes from './StylesForm.module.css';

interface ThemeCardProps {
    themeName: string;
    color: string;
    isActive: boolean;
    onClick: () => void;
}

function ThemeCard({ themeName, color, isActive, onClick }: ThemeCardProps) {
    return (
        <UnstyledButton
            onClick={onClick}
            className={classes.themeCard}
            data-active={isActive || undefined}
        >
            <Stack align="center" gap="sm">
                <div
                    className={classes.themeColorSwatch}
                    style={{ backgroundColor: color }}
                />
                <Text size="sm" fw={500}>
                    {themeName}
                </Text>
            </Stack>
        </UnstyledButton>
    );
}

interface StylesFormProps {
    // Define any props you might need here, for example:
    // dataResume: FormJobOfferDataStructure;
    changeTheme: (theme: string) => void;
    dataResume: FormJobOfferDataStructure;
}

// Define your themes in an array for easy mapping
const availableThemes = [
    { name: 'Modern', color: '#F97316' },
    { name: 'Classic', color: '#CCBA71' },
    { name: 'Minimalist', color: '#636b77' },
];

export default function StylesForm({
    changeTheme,
    dataResume,
}: StylesFormProps) {
    const currentTheme = dataResume.resume_generated.styles.theme;

    return (
        <Paper p="md" withBorder>
            <Stack gap="md">
                <Group gap="xs">
                    <IconPalette size={24} stroke={1.5} />
                    <Text fw={700} size="lg">
                        Resume Themes
                    </Text>
                </Group>

                <SimpleGrid cols={2} spacing="md">
                    {availableThemes.map((theme) => (
                        <ThemeCard
                            key={theme.name}
                            themeName={theme.name}
                            color={theme.color}
                            isActive={currentTheme === theme.name.toLowerCase()}
                            onClick={() =>
                                changeTheme(theme.name.toLowerCase())
                            }
                        />
                    ))}
                </SimpleGrid>
            </Stack>
        </Paper>
    );
}
