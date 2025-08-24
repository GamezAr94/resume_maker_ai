'use client';

import {
    Paper,
    Title,
    Text,
    Grid,
    List,
    ThemeIcon,
    Anchor,
    useMantineTheme,
    rem,
    Loader,
    Stack,
    Button,
    Alert,
    Accordion,
    Group,
} from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import {
    IconUpload,
    IconFileText,
    IconX,
    IconListCheck,
    IconMail,
    IconDownload,
    IconFileZip,
    IconAlertCircle,
    IconBriefcase,
    IconSchool,
    IconWand,
    IconBulb,
} from '@tabler/icons-react';
import { useState } from 'react';
import JSZip from 'jszip';
import Papa from 'papaparse';
// Import the transformer function and its return type
import {
    transformLinkedInData,
    TransformedData,
} from '@/utils/linkedin/linkedinDataTransformer';

// Define a structure for the raw parsed data from the CSV files.
interface ParsedLinkedInData {
    profile?: any[];
    positions?: any[];
    education?: any[];
    skills?: any[];
    projects?: any[];
}

// This is the new component responsible for the LinkedIn import UI.
export function LinkedInImporter() {
    const theme = useMantineTheme();

    // State to manage the import process
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // This state will now hold the final, structured data
    const [transformedData, setTransformedData] =
        useState<TransformedData | null>(null);

    const handleDrop = async (files: FileWithPath[]) => {
        if (files.length === 0) return;

        setIsLoading(true);
        setError(null);
        setTransformedData(null);

        const file = files[0];

        try {
            const zip = await JSZip.loadAsync(file);
            const data: ParsedLinkedInData = {};

            const filesToParse = [
                { name: 'Profile.csv', key: 'profile' },
                { name: 'Positions.csv', key: 'positions' },
                { name: 'Education.csv', key: 'education' },
                { name: 'Skills.csv', key: 'skills' },
                { name: 'Projects.csv', key: 'projects' },
            ];

            for (const fileInfo of filesToParse) {
                const csvFile = zip.file(fileInfo.name);
                if (csvFile) {
                    const csvText = await csvFile.async('text');
                    const result = Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                    });
                    if (result.data) {
                        data[fileInfo.key as keyof ParsedLinkedInData] =
                            result.data;
                    }
                }
            }

            // Use the transformer to convert raw data into our app's structure
            const finalData = transformLinkedInData(data);
            setTransformedData(finalData);
        } catch (e) {
            console.error('Error processing zip file:', e);
            setError(
                'Failed to process the .zip file. Please ensure it is a valid export from LinkedIn.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setTransformedData(null);
        setError(null);
        setIsLoading(false);
    };

    const handleSave = () => {
        // This is where we will connect to the main form's state setters.
        // For now, it just shows an alert.
        if (transformedData) {
            console.log('Saving this data:', transformedData);
            alert(
                'Data saved to console! The final step is to update the application state.',
            );
        }
    };

    // A helper component to render the review UI
    const renderReviewSection = () => {
        if (!transformedData) return null;

        // Check if any data was actually found
        const hasData =
            (transformedData.personal &&
                Object.values(transformedData.personal).some((v) => v)) ||
            transformedData.experience.length > 0 ||
            transformedData.education.length > 0 ||
            transformedData.skills.length > 0 ||
            transformedData.projects.length > 0;

        if (!hasData) {
            return (
                <Stack>
                    <Title order={3} c="orange.7">
                        No Data Found
                    </Title>
                    <Text>
                        We opened the .zip file, but couldn't find any
                        recognizable profile data inside. Please try
                        re-exporting from LinkedIn, ensuring you select the
                        "Profile" data files.
                    </Text>
                    <Group mt="xl">
                        <Button onClick={handleReset} variant="light" size="md">
                            Try Again
                        </Button>
                    </Group>
                </Stack>
            );
        }

        return (
            <Stack>
                <Title order={3} c="teal.7">
                    Review Your Information
                </Title>
                <Text>
                    We've imported your data. Please review it below. You can
                    make final edits after saving.
                </Text>

                <Accordion variant="separated" defaultValue="experience">
                    <div>
                        {transformedData.personal && (
                            <div>
                                <Text>
                                    {transformedData.personal.first_name}{' '}
                                    {transformedData.personal.last_name}
                                </Text>
                                <Text>{transformedData.personal.email}</Text>
                                <Text>{transformedData.personal.phone}</Text>
                            </div>
                        )}
                    </div>
                    {transformedData.experience.length > 0 && (
                        <Accordion.Item value="experience">
                            <Accordion.Control icon={<IconBriefcase />}>
                                Experience ({transformedData.experience.length})
                            </Accordion.Control>
                            <Accordion.Panel>
                                <List size="sm">
                                    {transformedData.experience.map((exp) => (
                                        <List.Item key={exp.id}>
                                            {exp.job_title} at{' '}
                                            {exp.company_name}
                                        </List.Item>
                                    ))}
                                </List>
                            </Accordion.Panel>
                        </Accordion.Item>
                    )}
                    {transformedData.education.length > 0 && (
                        <Accordion.Item value="education">
                            <Accordion.Control icon={<IconSchool />}>
                                Education ({transformedData.education.length})
                            </Accordion.Control>
                            <Accordion.Panel>
                                <List size="sm">
                                    {transformedData.education.map((edu) => (
                                        <List.Item key={edu.id}>
                                            {edu.degree} in {edu.field_of_study}
                                        </List.Item>
                                    ))}
                                </List>
                            </Accordion.Panel>
                        </Accordion.Item>
                    )}
                    {transformedData.skills.length > 0 && (
                        <Accordion.Item value="skills">
                            <Accordion.Control icon={<IconWand />}>
                                Skills ({transformedData.skills.length})
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Group gap="xs">
                                    {transformedData.skills.map((skill) => (
                                        <Text
                                            key={skill.id}
                                            p="xs"
                                            fz="sm"
                                            bg={theme.colors.gray[2]}
                                            style={{ borderRadius: '4px' }}
                                        >
                                            {skill.skill_name}
                                        </Text>
                                    ))}
                                </Group>
                            </Accordion.Panel>
                        </Accordion.Item>
                    )}
                    {transformedData.projects.length > 0 && (
                        <Accordion.Item value="projects">
                            <Accordion.Control icon={<IconBulb />}>
                                Projects ({transformedData.projects.length})
                            </Accordion.Control>
                            <Accordion.Panel>
                                <List size="sm">
                                    {transformedData.projects.map((proj) => (
                                        <List.Item key={proj.id}>
                                            {proj.project_name}
                                        </List.Item>
                                    ))}
                                </List>
                            </Accordion.Panel>
                        </Accordion.Item>
                    )}
                </Accordion>

                <Group mt="xl">
                    <Button onClick={handleSave} size="md">
                        Looks Good, Save Data
                    </Button>
                    <Button onClick={handleReset} variant="light" size="md">
                        Start Over
                    </Button>
                </Group>
            </Stack>
        );
    };

    return (
        <Paper withBorder p="xl" radius="md" bg={theme.colors.gray[0]}>
            {transformedData ? (
                renderReviewSection()
            ) : (
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Title order={3} mb="md" c="gray.8">
                            Upload Your LinkedIn Data
                        </Title>
                        <Text size="sm" c="gray.6" mb="lg">
                            Drag the .zip file you downloaded from LinkedIn
                            here.
                        </Text>
                        {isLoading ? (
                            <Stack align="center" justify="center" h={220}>
                                <Loader />
                                <Text>Analyzing your file...</Text>
                            </Stack>
                        ) : (
                            <Dropzone
                                onDrop={handleDrop}
                                onReject={() =>
                                    setError(
                                        'File rejected. Please upload a .zip file under 30MB.',
                                    )
                                }
                                maxSize={30 * 1024 ** 2}
                                accept={[
                                    'application/zip',
                                    'application/x-zip-compressed',
                                ]}
                                style={{
                                    minHeight: rem(220),
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <Group
                                    justify="center"
                                    gap="xl"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    <Dropzone.Accept>
                                        <IconUpload
                                            style={{
                                                width: rem(52),
                                                height: rem(52),
                                            }}
                                            stroke={1.5}
                                            color={theme.colors.blue[6]}
                                        />
                                    </Dropzone.Accept>
                                    <Dropzone.Reject>
                                        <IconX
                                            style={{
                                                width: rem(52),
                                                height: rem(52),
                                            }}
                                            stroke={1.5}
                                            color={theme.colors.red[6]}
                                        />
                                    </Dropzone.Reject>
                                    <Dropzone.Idle>
                                        <IconFileText
                                            style={{
                                                width: rem(52),
                                                height: rem(52),
                                            }}
                                            stroke={1.5}
                                        />
                                    </Dropzone.Idle>
                                    <div>
                                        <Text size="xl" inline>
                                            Drag .zip file here or click to
                                            select
                                        </Text>
                                        <Text
                                            size="sm"
                                            c="dimmed"
                                            inline
                                            mt={7}
                                        >
                                            Attach the single .zip file from
                                            LinkedIn, up to 30mb
                                        </Text>
                                    </div>
                                </Group>
                            </Dropzone>
                        )}
                        {error && (
                            <Alert
                                icon={<IconAlertCircle size="1rem" />}
                                title="Error"
                                color="red"
                                mt="md"
                            >
                                {error}
                            </Alert>
                        )}
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Title order={3} mb="md" c="gray.8">
                            How to Export Your Data
                        </Title>
                        <List
                            spacing="md"
                            size="sm"
                            center
                            icon={
                                <ThemeIcon color="blue" size={24} radius="xl">
                                    <IconListCheck
                                        style={{
                                            width: rem(16),
                                            height: rem(16),
                                        }}
                                    />
                                </ThemeIcon>
                            }
                        >
                            <List.Item>
                                Go to LinkedIn's data export page.{' '}
                                <Anchor
                                    href="https://www.linkedin.com/mypreferences/d/download-my-data"
                                    target="_blank"
                                >
                                    Click here to open it.
                                </Anchor>
                            </List.Item>
                            <List.Item>
                                Select the option{' '}
                                <Text component="span" fw={700}>
                                    "Want more? Select the data files you're
                                    most interested in."
                                </Text>{' '}
                                and check all relevant boxes (Profile,
                                Positions, Education, etc).
                            </List.Item>
                            <List.Item
                                icon={
                                    <ThemeIcon
                                        color="teal"
                                        size={24}
                                        radius="xl"
                                    >
                                        <IconMail
                                            style={{
                                                width: rem(16),
                                                height: rem(16),
                                            }}
                                        />
                                    </ThemeIcon>
                                }
                            >
                                Wait about 10 minutes for LinkedIn to send you
                                an email.
                            </List.Item>
                            <List.Item
                                icon={
                                    <ThemeIcon
                                        color="grape"
                                        size={24}
                                        radius="xl"
                                    >
                                        <IconDownload
                                            style={{
                                                width: rem(16),
                                                height: rem(16),
                                            }}
                                        />
                                    </ThemeIcon>
                                }
                            >
                                Download the{' '}
                                <Text component="span" fw={500}>
                                    .zip
                                </Text>{' '}
                                file from the email.
                            </List.Item>
                            <List.Item
                                icon={
                                    <ThemeIcon
                                        color="orange"
                                        size={24}
                                        radius="xl"
                                    >
                                        <IconUpload
                                            style={{
                                                width: rem(16),
                                                height: rem(16),
                                            }}
                                        />
                                    </ThemeIcon>
                                }
                            >
                                Drag that single{' '}
                                <Text component="span" fw={500}>
                                    .zip
                                </Text>{' '}
                                file into the upload area.
                            </List.Item>
                        </List>
                    </Grid.Col>
                </Grid>
            )}
        </Paper>
    );
}
