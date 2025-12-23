"use client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles_css from "./resumeViewer.module.css";
import { PDFViewer } from "@react-pdf/renderer";
import { FormJobOfferDataStructure } from "@/utils/interfaces";
import { Button } from "@mantine/core";
import { SectionTypes } from "@/utils/enums";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

// Import the templates
import {
    ClassicResumeTemplate,
    styles as pdfStyles,
} from "@/lib/pdf-templates/ClassicResume";
import { ModernResumeTemplate } from "@/lib/pdf-templates/ModernResume";
import { MinimalistResumeTemplate } from "@/lib/pdf-templates/MinimalistResume";
import FeedbackModal from "./Feedback/FeedbackModal";

interface Props {
    dataResume: FormJobOfferDataStructure;
    viewerKey: number;
    setDataResume: Dispatch<SetStateAction<FormJobOfferDataStructure>>;
}

export default function ResumeViewer({
    dataResume,
    viewerKey,
    setDataResume,
}: Props) {
    const [isFirefox, setIsFirefox] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    useEffect(() => {
        // This code runs only on the client side after the component mounts
        const userAgent = navigator.userAgent;
        if (userAgent.includes("Firefox")) {
            setIsFirefox(true);
        }
    }, []);

    // function to handle saving the resume data
    // This function will be called when the user clicks the Save button
    // It will send the dataResume object to the server to be saved
    async function handleSave() {
        if (isSaving || !dataResume || !dataResume.id) {
            // Don't save if already saving, or if there's no data/ID (shouldn't happen in this context)
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch("/api/saveUserInfo", {
                // Use root-relative path
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: SectionTypes.JobOffer, // Tell the API what type of data this is
                    data: dataResume, // Send the whole dataResume object
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

    // Function to validate the user data and save it
    async function gettingPDF() {
        // Prevent multiple calls if already downloading
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
            // Only update the resume state if was downloaded and it was FALSE
            if (dataResume.id && !dataResume.was_downloaded) {
                console.log("First time download, marking in DB...");

                // Call the new, structured API route
                const res = await fetch(
                    `/api/resume/${dataResume.id}/download-status`,
                    {
                        method: "POST",
                    },
                );

                // Optional but recommended: Update local state if the API call was successful
                if (res.ok) {
                    // This prevents a second API call if the user clicks download
                    // again before reloading the page.
                    setDataResume((prev) => ({
                        ...prev,
                        was_downloaded: true,
                    }));
                }
            }

            const pdfRes = await fetch("../api/pdfResume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: dataResume,
                }),
            });
            // verify we get a good response
            if (!pdfRes.ok) {
                const errorData = await pdfRes.json();
                throw new Error(errorData.message || "Failed to download PDF");
            }

            const blob = await pdfRes.blob(); // Get the PDF as a Blob
            const url = window.URL.createObjectURL(blob); // Create a temporary URL

            // Create a temporary link and click it to trigger the download
            const a = document.createElement("a");
            a.href = url;
            a.download = "resume.pdf"; // Suggested filename
            document.body.appendChild(a); // Append to the DOM (required for Firefox)
            a.click();
            a.remove(); // Clean up

            window.URL.revokeObjectURL(url); // Release the object URL
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
            setIsDownloading(false); // Reset the downloading state
        }
    }

    const handleDownloadClick = () => {
        setFeedbackModalOpen(true);
    };

    const handleFeedbackSubmit = async ({
        rating,
        message,
    }: {
        rating: number;
        message: string;
    }) => {
        setIsSubmittingFeedback(true);
        try {
            const response = await fetch("/api/sendFeedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userEmail: dataResume.resume_generated.contact_info.email,
                    resumeID: dataResume.id,
                    rating,
                    message,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send feedback.");
            }

            // You can add a success notification here if you want
            console.log("Feedback sent successfully!");

            setFeedbackModalOpen(false);
            await gettingPDF(); // Proceed to download after feedback
        } catch (error) {
            // You can add an error notification here
            console.error(error);
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    const handleSkipFeedback = async () => {
        setFeedbackModalOpen(false);
        await gettingPDF(); // Proceed to download if skipped
    };

    // TODO ART MUST!!!: this is hardcoded we need to fix this issue in the production
    dataResume.resume_generated.layout[1].items[0].start_end_dates =
        "May 2022 - Current";
    console.log(dataResume.resume_generated.layout[1].items[0].start_end_dates);

    return (
        <>
            <FeedbackModal
                opened={isFeedbackModalOpen}
                onClose={handleSkipFeedback}
                onSubmit={handleFeedbackSubmit}
                isSubmitting={isSubmittingFeedback}
            />
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
                            return (
                                <ModernResumeTemplate dataResume={dataResume} />
                            );
                        }

                        switch (dataResume.resume_generated.styles.theme) {
                            case "classic":
                                return (
                                    <ClassicResumeTemplate
                                        dataResume={dataResume}
                                    />
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
                                    <ModernResumeTemplate
                                        dataResume={dataResume}
                                    />
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
                        onClick={handleDownloadClick}
                        disabled={isDownloading || isSaving} // <<<--- DISABLE BUTTON WHEN DOWNLOADING OR SAVING
                        loading={isDownloading} // <<<--- SHOW MANTINE'S LOADING SPINNER
                    >
                        Download PDF
                    </Button>
                </div>
            </div>
        </>
    );
}
