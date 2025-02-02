import React from 'react';
import styles_css from './resumeViewer.module.css';
import { FormJobOfferDataStructure } from '@/utils/interfaces';

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
                    //data: dataResume,
                    data: 'hjola',
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
            <div className={styles_css.resume_viewer_view}>
                <p>hola</p>
            </div>
            <div>
                <button onClick={gettingPDF}>Download PDF</button>
            </div>
        </div>
    );
}
