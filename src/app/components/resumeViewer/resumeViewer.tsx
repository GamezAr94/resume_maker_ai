"use client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles_css from "./resumeViewer.module.css";
import { PDFViewer } from "@react-pdf/renderer";
import { FormJobOfferDataStructure } from "@/utils/interfaces";
import { Button } from "@mantine/core";
import { SectionTypes } from "@/utils/enums";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import {
    ClassicResumeTemplate,
    styles as pdfStyles,
} from "@/lib/pdf-templates/ClassicResume";
import { ModernResumeTemplate } from "@/lib/pdf-templates/ModernResume";
import { MinimalistResumeTemplate } from "@/lib/pdf-templates/MinimalistResume";

interface Props {
    dataResume: FormJobOfferDataStructure;
    viewerKey: number;
    setDataResume: Dispatch<SetStateAction<FormJobOfferDataStructure>>;
}

export default function ResumeViewer({
    dataResume,
    viewerKey,
}: Props) {
    const [isFirefox, setIsFirefox] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent;
        if (userAgent.includes("Firefox")) {
            setIsFirefox(true);
        }
    }, []);

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
        notifications.show({
            id: "download-pdf",
            loading: true,
            title: "Download Started...",
            message: "Your resume is being prepared for download.",
            autoClose: false,
            withCloseButton: false,
        });
        try {
            const pdfRes = await fetch("/api/pdfResume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: dataResume,
                }),
            });
            if (!pdfRes.ok) {
                const errorData = await pdfRes.json();
                throw new Error(errorData.message || "Failed to download PDF");
            }
            const blob = await pdfRes.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            const safeName = (dataResume.resume_generated?.contact_info?.name || "Resume")
                .replace(/[^a-zA-Z0-9_-]/g, "_");
            const safeCompany = (dataResume.company_name || "Application")
                .replace(/[^a-zA-Z0-9_-]/g, "_");
            a.download = `${safeName}_${safeCompany}.pdf`;

            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            notifications.update({
                id: "download-pdf",
                color: "teal",
                title: "Success!",
                message: "Your resume is downloading.",
                icon: <IconCheck />,
                loading: false,
                autoClose: 5000,
            });
        } catch (error) {
            notifications.update({
                id: "download-pdf",
                color: "red",
                title: "Download Failed",
                message:
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred.",
                icon: <IconX />,
                loading: false,
                autoClose: 5000,
            });
        } finally {
            setIsDownloading(false);
        }
    }

    return (
        <div className={styles_css.resume_viewer_container}>
            {isFirefox && (
                <div className={styles_css.firefox_cover_container}></div>
            )}
            <PDFViewer
                key={viewerKey}
                showToolbar={false}
                style={pdfStyles.viewer}
            >
                {(() => {
                    if (!dataResume?.resume_generated?.styles?.theme) {
                        return <ModernResumeTemplate dataResume={dataResume} />;
                    }
                    switch (dataResume.resume_generated.styles.theme) {
                        case "classic":
                            return (
                                <ClassicResumeTemplate dataResume={dataResume} />
                            );
                        case "minimalist":
                            return (
                                <MinimalistResumeTemplate
                                    dataResume={dataResume}
                                />
                            );
                        case "modern":
                        default:
                            return (
                                <ModernResumeTemplate dataResume={dataResume} />
                            );
                    }
                })()}
            </PDFViewer>
            <div className={styles_css.action_buttons_container}>
                <Button
                    variant="outline"
                    onClick={handleSave}
                    disabled={isDownloading || isSaving}
                    loading={isSaving}
                >
                    Save
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
