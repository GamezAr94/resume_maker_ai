"use client";

import { useState } from "react";
import {
    Paper,
    Text,
    Title,
    Group,
    Button,
    rem,
    ThemeIcon,
    Stack,
    Modal,
    Textarea,
    LoadingOverlay,
    Box,
    List,
} from "@mantine/core";
import {
    Dropzone,
    FileWithPath,
    PDF_MIME_TYPE,
    MS_WORD_MIME_TYPE,
} from "@mantine/dropzone";
import {
    IconUpload,
    IconFileText,
    IconX,
    IconCheck,
    IconBolt,
    IconFileTypePdf,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

interface Props {
    onUploadComplete: () => void;
}

export default function ResumeUploader({ onUploadComplete }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [resumeText, setResumeText] = useState("");

    const handleDrop = async (files: FileWithPath[]) => {
        if (files.length === 0) return;

        setIsLoading(true);
        const file = files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            // STEP 1: Parse the file to text
            const response = await fetch("/api/parse-resume", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to parse resume");
            }

            const data = await response.json();
            setResumeText(data.text);
            setReviewModalOpen(true);
        } catch (error) {
            notifications.show({
                title: "Error Parsing Resume",
                message:
                    error instanceof Error ? error.message : "Unknown error",
                color: "red",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async () => {
        setIsLoading(true);

        try {
            // STEP 2: Send text to Gemini -> Database
            const response = await fetch("/api/import-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: resumeText }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to import profile",
                );
            }

            notifications.show({
                title: "Success!",
                message: "Your profile has been populated!",
                color: "teal",
                icon: <IconCheck />,
            });

            setReviewModalOpen(false);
            onUploadComplete(); // This refreshes the dashboard!
        } catch (error) {
            notifications.show({
                title: "Import Failed",
                message:
                    error instanceof Error ? error.message : "Unknown error",
                color: "red",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Paper p="xl" radius="lg" withBorder shadow="sm" pos="relative">
                <LoadingOverlay
                    visible={isLoading}
                    zIndex={1000}
                    overlayProps={{ radius: "sm", blur: 2 }}
                    loaderProps={{ type: "dots" }}
                />

                <Stack align="center" gap="lg" mb="xl">
                    <Title order={2}>Get Started in 60 Seconds 🚀</Title>
                    <Text c="dimmed" ta="center" maw={600}>
                        Upload your existing resume. We'll use AI to extract
                        your details and build your master profile instantly,
                        saving you 40 minutes of manual entry.
                    </Text>
                </Stack>

                <Dropzone
                    onDrop={handleDrop}
                    onReject={(files) => console.log("rejected files", files)}
                    maxSize={5 * 1024 ** 2} // 5MB
                    accept={[...PDF_MIME_TYPE, ...MS_WORD_MIME_TYPE]}
                    multiple={false}
                    h={250}
                >
                    <Group
                        justify="center"
                        gap="xl"
                        style={{ minHeight: rem(220), pointerEvents: "none" }}
                    >
                        <Dropzone.Accept>
                            <IconUpload
                                style={{
                                    width: rem(52),
                                    height: rem(52),
                                    color: "var(--mantine-color-blue-6)",
                                }}
                                stroke={1.5}
                            />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX
                                style={{
                                    width: rem(52),
                                    height: rem(52),
                                    color: "var(--mantine-color-red-6)",
                                }}
                                stroke={1.5}
                            />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconFileTypePdf
                                style={{
                                    width: rem(52),
                                    height: rem(52),
                                    color: "var(--mantine-color-dimmed)",
                                }}
                                stroke={1.5}
                            />
                        </Dropzone.Idle>

                        <div style={{ textAlign: "center" }}>
                            <Text size="xl" inline>
                                Drag & drop your Resume here
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                                Supports PDF and DOCX files up to 5MB
                            </Text>
                        </div>
                    </Group>
                </Dropzone>

                <Box
                    mt={30}
                    bg="gray.0"
                    p="md"
                    style={{ borderRadius: "var(--mantine-radius-md)" }}
                >
                    <Group gap="xs" mb="sm">
                        <IconBolt
                            size={20}
                            color="var(--mantine-color-orange-5)"
                            fill="var(--mantine-color-orange-5)"
                        />
                        <Text fw={600}>Why upload first?</Text>
                    </Group>
                    <List
                        spacing="xs"
                        size="sm"
                        center
                        icon={
                            <ThemeIcon color="teal" size={16} radius="xl">
                                <IconCheck
                                    style={{ width: rem(10), height: rem(10) }}
                                />
                            </ThemeIcon>
                        }
                    >
                        <List.Item>
                            See your AI-generated resume in under 60 seconds
                        </List.Item>
                        <List.Item>Skip tedious manual data entry</List.Item>
                        <List.Item>
                            You can review and edit everything before we save it
                        </List.Item>
                    </List>
                </Box>
            </Paper>

            <Modal
                opened={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                title="Review Extracted Text"
                size="xl"
            >
                <Stack>
                    <Text size="sm" c="dimmed">
                        We extracted this text from your file. Please verify it
                        looks correct and remove any garbage text (like page
                        numbers or headers) to give the AI the best chance.
                    </Text>
                    <Textarea
                        autosize
                        minRows={10}
                        maxRows={20}
                        value={resumeText}
                        onChange={(e) => setResumeText(e.currentTarget.value)}
                    />
                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            onClick={() => setReviewModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleImport} loading={isLoading}>
                            Looks Good, Import Profile
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
