'use client';
import React, { useEffect, useState } from 'react';
import styles_css from './resumeViewer.module.css';
import { Document, Page, PDFViewer, View } from '@react-pdf/renderer';
import { FormJobOfferDataStructure } from '@/utils/interfaces';
import { Button, Text } from '@mantine/core';
import { SectionTypes } from '@/utils/enums';

// Import the templates
import {
    ClassicResumeTemplate,
    styles as pdfStyles,
} from '@/lib/pdf-templates/ClassicResume';

interface Props {
    dataResume: FormJobOfferDataStructure;
    viewerKey: number;
}

export default function ResumeViewer({ dataResume, viewerKey }: Props) {
    const [isFirefox, setIsFirefox] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // This code runs only on the client side after the component mounts
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Firefox')) {
            setIsFirefox(true);
        }
    }, []);

    // function to handle saving the resume data
    // This function will be called when the user clicks the Save button
    // It will send the dataResume object to the server to be saved
    async function handleSave() {
        if (isSaving || !dataResume || !dataResume.id) {
            // Don't save if already saving, or if there's no data/ID (shouldn't happen in this context)
            console.warn(
                'Save conditions not met. Current dataResume ID:',
                dataResume?.id,
            );
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch('/api/saveUserInfo', {
                // Use root-relative path
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: SectionTypes.JobOffer, // Tell the API what type of data this is
                    data: dataResume, // Send the whole dataResume object
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save resume.');
            }

            // TODO: Show a success notification to the user (e.g., using Mantine Notifications)
            alert('Resume saved successfully!'); // Placeholder
        } catch (error) {
            console.error('Error saving resume:', error);
            // TODO: Show an error notification to the user
            alert(
                `Error saving resume: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            ); // Placeholder
        } finally {
            setIsSaving(false);
        }
    }

    // Function to validate the user data and save it
    async function gettingPDF() {
        // Prevent multiple calls if already downloading
        if (isDownloading) return;

        setIsDownloading(true);

        try {
            const res = await fetch('../api/pdfResume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: dataResume,
                }),
            });
            // verify we get a good response
            if (!res.ok) {
                const errorData = await res.json();
                // TODO show a proper error message to the user
                throw new Error(errorData.message || 'Failed to download PDF');
            }

            const blob = await res.blob(); // Get the PDF as a Blob
            const url = window.URL.createObjectURL(blob); // Create a temporary URL

            // Create a temporary link and click it to trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume.pdf'; // Suggested filename
            document.body.appendChild(a); // Append to the DOM (required for Firefox)
            a.click();
            a.remove(); // Clean up

            window.URL.revokeObjectURL(url); // Release the object URL
        } catch (error) {
            // TODO show a proper error message to the user
            console.error('Error downloading PDF:', error);
        } finally {
            setIsDownloading(false); // Reset the downloading state
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
                <ClassicResumeTemplate dataResume={dataResume} />
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
                    disabled={isDownloading || isSaving} // <<<--- DISABLE BUTTON WHEN DOWNLOADING OR SAVING
                    loading={isDownloading} // <<<--- SHOW MANTINE'S LOADING SPINNER
                >
                    Download PDF
                </Button>
            </div>
        </div>
    );
}

/*
// NOTE: THIS CODE is a pseudo solution, I tried to create my own PDF visualizer but it is not as good as jus tdisplaying the default PDF viewer from this library
// I didnt want to use the default because it is showing the tooldbar and I want to hide it (it will be displayed in firefox ONLY)

import React from 'react';
import styles_css from './resumeViewer.module.css';
import { FormJobOfferDataStructure } from '@/utils/interfaces';
import PDFDocument from './pdfDocument';

interface Props {
    dataResume: FormJobOfferDataStructure;
}
export default function ResumeViewer({ dataResume }: Props) {
    // Function to validate the user data and save it
    async function gettingPDF() {
        try {
            const res = await fetch('../api/pdfResume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    //data: Object.fromEntries(formData),
                    data: dataResume,
                }),
            });
            // verify we get a good response
            if (!res.ok) {
                const errorData = await res.json();
                // TODO show a proper error message to the user
                throw new Error(errorData.message || 'Failed to download PDF');
            }

            const blob = await res.blob(); // Get the PDF as a Blob
            const url = window.URL.createObjectURL(blob); // Create a temporary URL

            // Create a temporary link and click it to trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume.pdf'; // Suggested filename
            document.body.appendChild(a); // Append to the DOM (required for Firefox)
            a.click();
            a.remove(); // Clean up

            window.URL.revokeObjectURL(url); // Release the object URL
        } catch (error) {
            // TODO show a proper error message to the user
            console.error('Error downloading PDF:', error);
        }
    }

    return (
        <div className={styles_css.resume_viewer_container}>
            <PDFDocument dataResume={dataResume} />
            <div className={styles_css.action_buttons_container}>
                <button>Save</button>
                <button onClick={gettingPDF}>Download PDF</button>
            </div>
        </div>
    );
}
*/
