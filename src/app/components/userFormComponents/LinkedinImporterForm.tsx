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
} from '@tabler/icons-react';
import { useState } from 'react';

// This is the new component responsible for the LinkedIn import UI.
// It includes the dropzone and the instructions.
export function LinkedInImporter() {
    const theme = useMantineTheme();
    // State to hold the dropped files, though we won't process them yet.
    const [files, setFiles] = useState<FileWithPath[]>([]);

    return (
        <Paper withBorder p="xl" radius="md" bg={theme.colors.gray[0]}>
            <Grid gutter="xl">
                {/* Left Column: Drag and Drop Area */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Title order={3} mb="md" c="gray.8">
                        Upload Your LinkedIn Data
                    </Title>
                    <Text size="sm" c="gray.6" mb="lg">
                        Drag the .zip file you downloaded from LinkedIn here. We
                        will automatically find the correct files inside.
                    </Text>

                    <Dropzone
                        onDrop={(droppedFiles) => {
                            console.log('Files dropped:', droppedFiles);
                            setFiles(droppedFiles);
                            // In the future, you'll start the server-side processing here.
                        }}
                        onReject={(rejectedFiles) =>
                            console.log('Rejected files:', rejectedFiles)
                        }
                        maxSize={30 * 1024 ** 2} // 30MB
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
                                    style={{ width: rem(52), height: rem(52) }}
                                    stroke={1.5}
                                    color={theme.colors.blue[6]}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    style={{ width: rem(52), height: rem(52) }}
                                    stroke={1.5}
                                    color={theme.colors.red[6]}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconFileText
                                    style={{ width: rem(52), height: rem(52) }}
                                    stroke={1.5}
                                />
                            </Dropzone.Idle>

                            <div>
                                <Text size="xl" inline>
                                    Drag .zip file here or click to select
                                </Text>
                                <Text size="sm" c="dimmed" inline mt={7}>
                                    Attach the single .zip file from LinkedIn,
                                    up to 30mb
                                </Text>
                            </div>
                        </Group>
                    </Dropzone>

                    {/* This section will eventually show the processed data for review */}
                    {files.length > 0 && (
                        <Paper withBorder radius="md" p="md" mt="md">
                            <Text fw={500}>File ready for processing:</Text>
                            <Text size="sm" c="dimmed">
                                {files[0].name}
                            </Text>
                        </Paper>
                    )}
                </Grid.Col>

                {/* Right Column: Instructions */}
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
                                    style={{ width: rem(16), height: rem(16) }}
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
                                "Want more? Select the data files you're most
                                interested in."
                            </Text>{' '}
                            and check the box for{' '}
                            <Text component="span" fw={700}>
                                Profile
                            </Text>
                            . This will give you the fastest export.
                        </List.Item>
                        <List.Item
                            icon={
                                <ThemeIcon color="teal" size={24} radius="xl">
                                    <IconMail
                                        style={{
                                            width: rem(16),
                                            height: rem(16),
                                        }}
                                    />
                                </ThemeIcon>
                            }
                        >
                            Wait about 10 minutes for LinkedIn to process your
                            request. They will send you an email with a download
                            link.
                        </List.Item>
                        <List.Item
                            icon={
                                <ThemeIcon color="grape" size={24} radius="xl">
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
                                <ThemeIcon color="orange" size={24} radius="xl">
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
                            file into the upload area on the left. No need to
                            unzip it yourself!
                        </List.Item>
                    </List>
                </Grid.Col>
            </Grid>
        </Paper>
    );
}
