'use client';
import { FormJobOfferDataStructure } from '@/utils/interfaces';
import styles from './pdfDocument.module.css';
import { useEffect, useRef } from 'react';

import { Roboto, Hahmlet } from 'next/font/google';
const hamlet = Hahmlet({
    weight: '900',
    subsets: ['latin'],
    style: 'normal',
    display: 'swap',
});
const robotoBlack = Roboto({
    weight: '500',
    subsets: ['latin'],
    style: 'normal',
    display: 'swap',
});

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
        <div
            ref={parentRef}
            className={`${styles.resume_viewer_view} ${robotoBlack.className}`}
        >
            {/* This referenced element is important because this is the real size A4 in mm so we can reference from this to set a perfect scale for the representation */}
            <div className={styles.reference_element} ref={referenceRef}></div>
            <div className={styles.pdf_viewer_container}>
                <div className={styles.page_pdf}>
                    <div
                        className={`${styles.content_pdf} ${styles.layout__classic}`}
                    >
                        <div className={styles.header__name}>
                            <p>
                                {dataResume.resume_generated.contact_info.name}
                            </p>
                        </div>
                        <p
                            className={`${styles.header__position} ${styles.highlight}`}
                        >
                            {dataResume.job_position}
                        </p>
                        <div className={`${styles.header__contact_section}`}>
                            <p>
                                {dataResume.resume_generated.contact_info.email}
                            </p>
                            <p>
                                {
                                    dataResume.resume_generated.contact_info
                                        .linkedin
                                }
                            </p>
                            <p>
                                {dataResume.resume_generated.contact_info.phone}
                            </p>
                        </div>
                        <div>
                            <p className={styles.resume__section_title}>
                                Career Objective
                            </p>
                            <p>
                                {dataResume.resume_generated.career_objective}
                            </p>
                        </div>
                        <div>
                            <p className={styles.resume__section_title}>
                                Summary
                            </p>
                            <p>{dataResume.resume_generated.summary}</p>
                        </div>
                        <div className={styles.resume__content}>
                            <div className={styles.resume__content_main}>
                                <div>
                                    <p
                                        className={`${styles.resume__section_title} ${styles.divider}`}
                                    >
                                        Experience
                                    </p>
                                    {dataResume.resume_generated.experience.map(
                                        (exp, id) => {
                                            return (
                                                <div key={id}>
                                                    <p
                                                        className={`${styles.resume__section_subtitle}`}
                                                    >
                                                        {exp.title}
                                                    </p>
                                                    <p
                                                        className={`${styles.resume__section_subtitle_secondary} ${styles.highlight}`}
                                                    >
                                                        {exp.company}
                                                    </p>
                                                    <p>{exp.start_end_dates}</p>
                                                    <p>
                                                        {exp.responsabilities}
                                                    </p>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                                <div>
                                    <p
                                        className={`${styles.resume__section_title} ${styles.divider}`}
                                    >
                                        Projects
                                    </p>
                                    {dataResume.resume_generated.projects.map(
                                        (pro, id) => {
                                            return (
                                                <div key={id}>
                                                    <p
                                                        className={`${styles.resume__section_subtitle}`}
                                                    >
                                                        {pro.name}
                                                    </p>
                                                    <p>{pro.start_end_dates}</p>
                                                    <p>{pro.relevance}</p>
                                                    <p>{pro.description}</p>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                            <div className={styles.resume__content_secondary}>
                                <div>
                                    <p
                                        className={`${styles.resume__section_title} ${styles.divider}`}
                                    >
                                        Education
                                    </p>
                                    {dataResume.resume_generated.education.map(
                                        (edu, id) => {
                                            return (
                                                <div key={id}>
                                                    <p
                                                        className={`${styles.resume__section_subtitle_secondary} ${styles.highlight}`}
                                                    >
                                                        {edu.degree}
                                                    </p>
                                                    <p>{edu.school}</p>
                                                    <p>{edu.minor}</p>
                                                    <p>{edu.start_end_dates}</p>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                                <div>
                                    <p
                                        className={`${styles.resume__section_title} ${styles.divider}`}
                                    >
                                        Skills
                                    </p>
                                    {dataResume.resume_generated.skills.map(
                                        (skill, id) => {
                                            return (
                                                <div key={id}>
                                                    <p>- {skill}</p>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
