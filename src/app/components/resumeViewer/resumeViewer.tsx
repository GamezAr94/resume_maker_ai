"use client";
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import styles_css from "./resumeViewer.module.css";
import { FormJobOfferDataStructure } from "@/utils/interfaces";
import { Button, Badge, Loader, Group, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { SectionTypes } from "@/utils/enums";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

interface Props {
    dataResume: FormJobOfferDataStructure;
    viewerKey?: number;
    setDataResume: Dispatch<SetStateAction<FormJobOfferDataStructure>>;
}

export default function ResumeViewer({ dataResume }: Props) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRenderingPreview, setIsRenderingPreview] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const latestBlobRef = useRef<Blob | null>(null);

    // Debounce changes by 400ms so typing and clicking controls feel instant
    const [debouncedResume] = useDebouncedValue(dataResume, 400);

    useEffect(() => {
        if (!debouncedResume || !debouncedResume.resume_generated) return;

        const controller = new AbortController();
        setIsRenderingPreview(true);

        async function updatePreview() {
            try {
                const res = await fetch("/api/pdfResume", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data: debouncedResume }),
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error("Failed to render PDF preview");
                }

                const blob = await res.blob();
                latestBlobRef.current = blob;
                const newUrl = window.URL.createObjectURL(blob);

                setPdfBlobUrl((prevUrl) => {
                    if (prevUrl) {
                        window.URL.revokeObjectURL(prevUrl);
                    }
                    return newUrl;
                });
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    console.error("Preview render error:", err);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsRenderingPreview(false);
                }
            }
        }

        updatePreview();

        return () => {
            controller.abort();
        };
    }, [debouncedResume]);

    async function handleSave() {
        if (isSaving || !dataResume || !dataResume.id) {
            return;
        }
        setIsSaving(true);
        try {
            const response = await fetch("/api/saveUserInfo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: SectionTypes.JobOffer,
                    data: dataResume,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to save resume.");
            }
            notifications.show({
                title: "Success!",
                message: "Resume saved successfully!",
                color: "teal",
                icon: <IconCheck />,
            });
        } catch (error) {
            notifications.show({
                title: "Error Saving Resume",
                message:
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred.",
                color: "red",
                icon: <IconX />,
            });
        } finally {
            setIsSaving(false);
        }
    }

    async function gettingPDF() {
        if (isDownloading) {
            return;
        }
        setIsDownloading(true);
        try {
            let blob = latestBlobRef.current;
            if (!blob) {
                const pdfRes = await fetch("/api/pdfResume", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data: dataResume }),
                });
                if (!pdfRes.ok) {
                    throw new Error("Failed to download PDF");
                }
                blob = await pdfRes.blob();
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            const safeName = (
                dataResume.resume_generated?.contact_info?.name || "Resume"
            ).replace(/[^a-zA-Z0-9_-]/g, "_");
            const safeCompany = (
                dataResume.company_name || "Application"
            ).replace(/[^a-zA-Z0-9_-]/g, "_");
            a.download = `${safeName}_${safeCompany}.pdf`;

            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            notifications.show({
                color: "teal",
                title: "Success!",
                message: "Your resume PDF has been downloaded.",
                icon: <IconCheck />,
                autoClose: 3000,
            });
        } catch (error) {
            notifications.show({
                color: "red",
                title: "Download Failed",
                message:
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred.",
                icon: <IconX />,
            });
        } finally {
            setIsDownloading(false);
        }
    }

    return (
        <div className={styles_css.resume_viewer_container}>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "712px",
                    aspectRatio: "210/297",
                    backgroundColor: "#f1f5f9",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                }}
            >
                {isRenderingPreview && (
                    <Badge
                        color="blue"
                        variant="filled"
                        size="sm"
                        style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            zIndex: 10,
                        }}
                    >
                        <Group gap={6} wrap="nowrap">
                            <Loader size={10} color="white" />
                            <span>Updating Preview...</span>
                        </Group>
                    </Badge>
                )}

                {pdfBlobUrl ? (
                    <iframe
                        src={`${pdfBlobUrl}#toolbar=0&navpanes=0&view=FitH`}
                        title="Resume PDF Preview"
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                        }}
                    />
                ) : (
                    <Group
                        justify="center"
                        align="center"
                        style={{ height: "100%" }}
                    >
                        <Loader size="md" />
                        <Text size="sm" c="dimmed">
                            Rendering PDF preview...
                        </Text>
                    </Group>
                )}
            </div>

            <div className={styles_css.action_buttons_container}>
                <Button
                    variant="outline"
                    onClick={handleSave}
                    disabled={isDownloading || isSaving}
                    loading={isSaving}
                >
                    Save Changes
                </Button>
                <Button
                    onClick={gettingPDF}
                    disabled={isDownloading || isSaving}
                    loading={isDownloading}
                >
                    Download PDF
                </Button>
            </div>
        </div>
    );
}
