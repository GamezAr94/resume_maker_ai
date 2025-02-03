'use client';
import { FormJobOfferDataStructure } from '@/utils/interfaces';
import styles from './pdfDocument.module.css';
import { useEffect, useRef } from 'react';

interface Props {
    dataResume: FormJobOfferDataStructure;
}

export default function PDFDocument({ dataResume }: Props) {
    const parentRef = useRef<HTMLDivElement>(null);
    const referenceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                // set the custom property with the new width
                const newWidth = entry.contentRect.width;
                if (parentRef.current) {
                    parentRef.current.style.setProperty(
                        '--parent-pdf-width',
                        `${newWidth}`,
                    );
                }
            }
        });

        // starting the custom property with the parent and reference width
        if (referenceRef.current && parentRef.current) {
            parentRef.current.style.setProperty(
                '--parent-pdf-width',
                `${parentRef.current.offsetWidth}`,
            );

            // Get and set the initial reference width
            const referenceWidth = referenceRef.current.offsetWidth;
            parentRef.current.style.setProperty(
                '--reference-width',
                `${referenceWidth}`,
            );

            resizeObserver.observe(parentRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);
    return (
        <div ref={parentRef} className={styles.resume_viewer_view}>
            <div className={styles.reference_element} ref={referenceRef}></div>
            <div className={styles.pdf_viewer_container}>
                <div className={styles.page_pdf}>
                    <p>hola</p>
                </div>
            </div>
        </div>
    );
}
