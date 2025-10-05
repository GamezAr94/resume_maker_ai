'use client';
// Import React and necessary Mantine components
import React, { useState, SetStateAction, ChangeEvent } from 'react';
import { Box, Tabs } from '@mantine/core';

// Import your data structure type - MAKE SURE PATH IS CORRECT
import { FormJobOfferDataStructure } from '@/utils/interfaces';

// Import the CSS module
import classes from './resumeEditor.module.css';
import { DataForm } from './DataForm';
import StylesForm from './StylesForm';
import JobDescriptionDisplay from './JobDescriptionDisplay';
import AiFeedbackDisplay from './AiFeedbackDisplay';
import NetworkingDisplay from './NetworkingDisplay';

// Interface using YOUR prop names
interface ResumeEditorProps {
    dataResume: FormJobOfferDataStructure;
    setDataResume: (updater: SetStateAction<FormJobOfferDataStructure>) => void;
}

export default function ResumeEditor({
    dataResume,
    setDataResume,
}: ResumeEditorProps) {
    // State for accordion
    const [activeAccordion, setActiveAccordion] = useState<string | null>(
        'personalInfo',
    );

    // State to manage which tab ('Data' or 'Styles') is active
    const [activeTab, setActiveTab] = useState<string | null>('data');

    const [activeNestedAccordions, setActiveNestedAccordions] = useState<
        Record<string, string[]>
    >({});

    // Handler for the nested accordions
    const handleNestedAccordionChange = (
        sectionId: string,
        value: string[],
    ) => {
        setActiveNestedAccordions((prev) => ({ ...prev, [sectionId]: value }));
    };

    /**
     * A single, unified function to handle toggling visibility for both
     * main sections and nested items within those sections.
     */
    const handleVisibilityToggle = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        const { section, iterator, subitemIndex } = e.currentTarget.dataset;

        setDataResume((prev) => {
            if (!section || !iterator || !prev.resume_generated?.layout) {
                return prev;
            }

            const sectionIndex = parseInt(iterator, 10);
            const newLayout = JSON.parse(
                JSON.stringify(prev.resume_generated.layout),
            );

            if (subitemIndex !== undefined) {
                // Logic for a nested item (like a single job experience)
                const itemIndex = parseInt(subitemIndex, 10);
                const sectionToUpdate = newLayout[sectionIndex];

                if (
                    'items' in sectionToUpdate &&
                    Array.isArray(sectionToUpdate.items)
                ) {
                    const itemToUpdate = sectionToUpdate.items[itemIndex];
                    if (itemToUpdate) {
                        itemToUpdate.display = !(
                            itemToUpdate.display !== false
                        );
                    }
                }
            } else {
                // Logic for a main section (like the entire "Experience" block)
                const sectionToUpdate = newLayout[sectionIndex];
                if (sectionToUpdate) {
                    sectionToUpdate.display = !(
                        sectionToUpdate.display !== false
                    );
                }
            }

            return {
                ...prev,
                resume_generated: {
                    ...prev.resume_generated,
                    layout: newLayout,
                },
            };
        });
    };

    // Function to change the theme of the resume
    // This function updates the theme in the dataResume state
    // and can be called from a button or dropdown in the UI
    // It checks if the theme is already set to avoid unnecessary updates
    const changeTheme = (theme: string) => {
        // Check if the theme is already set to avoid unnecessary updates
        if (dataResume.resume_generated.styles.theme === theme) {
            return;
        }
        console.log(`Changing template to: ${theme}`);
        // Update the theme in the dataResume state
        setDataResume((prev) => {
            const newData = JSON.parse(JSON.stringify(prev));
            newData.resume_generated.styles.theme = theme;
            return newData;
        });
    };

    // funciton to handle the change of the input
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.currentTarget;
        const sectionId = e.currentTarget.getAttribute('data-section');
        const iteratorIndex = e.currentTarget.getAttribute('data-iterator');

        setDataResume((prev) => {
            const newData = JSON.parse(JSON.stringify(prev));

            if (name === 'personalInfo') {
                // Update the entire personal info object
                if (sectionId === 'name') {
                    newData.resume_generated.contact_info.name = value;
                } else if (sectionId === 'job_position') {
                    newData.job_position = value;
                } else if (sectionId === 'email') {
                    newData.resume_generated.contact_info.email = value;
                } else if (sectionId === 'phone') {
                    newData.resume_generated.contact_info.phone = value;
                } else if (sectionId === 'linkedin') {
                    newData.resume_generated.contact_info.linkedin = value;
                } else if (sectionId === 'github') {
                    newData.resume_generated.contact_info.github = value;
                } else if (sectionId === 'portfolio') {
                    newData.resume_generated.contact_info.portfolio = value;
                }
                return newData;
            }

            if (
                !sectionId ||
                !iteratorIndex ||
                !newData.resume_generated?.layout
            ) {
                return newData;
            }

            const index = parseInt(iteratorIndex, 10);
            const sectionToUpdate = newData.resume_generated.layout[index];

            if (name === 'items' && 'items' in sectionToUpdate) {
                if (sectionId === 'narrative') {
                    sectionToUpdate.items = value.split('\n\n');
                } else {
                    // Assumes skills and other simple lists
                    sectionToUpdate.items = value.split('\n');
                }
            } else if (name === 'title') {
                sectionToUpdate.title = value;
            }
            // Add more specific logic for nested items (experience, projects, etc.) here later

            return newData;
        });
    };

    /**
     * Handles changes for fields inside a nested item (e.g., a specific job's title).
     */
    const handleItemChange = (
        sectionIndex: number,
        itemIndex: number,
        fieldName: string,
        value: string,
    ) => {
        setDataResume((prev) => {
            // Create deep copies to ensure immutability
            const newLayout = JSON.parse(
                JSON.stringify(prev.resume_generated.layout),
            );
            const sectionToUpdate = newLayout[sectionIndex];

            // Check if the item exists before trying to update it
            if (
                sectionToUpdate &&
                'items' in sectionToUpdate &&
                Array.isArray(sectionToUpdate.items) &&
                sectionToUpdate.items[itemIndex]
            ) {
                // Update the specific field on the specific item
                sectionToUpdate.items[itemIndex][fieldName] = value;
            }

            // Return the updated state
            return {
                ...prev,
                resume_generated: {
                    ...prev.resume_generated,
                    layout: newLayout,
                },
            };
        });
    };

    return (
        <Box className={classes.editorContainer}>
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
                classNames={{
                    root: classes.tabsRoot,
                    list: classes.tabsList,
                    tab: classes.tab,
                }}
            >
                <Tabs.List>
                    <Tabs.Tab value="data">Data</Tabs.Tab>
                    <Tabs.Tab value="styles">Styles</Tabs.Tab>
                    <Tabs.Tab value="job_desc">Job Description</Tabs.Tab>
                    <Tabs.Tab
                        value="ai_feedback"
                        rightSection={
                            <Box
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    height: '12px',
                                    width: '12px',
                                }}
                            >
                                {/* The solid dot in the center */}
                                <Box
                                    style={{
                                        position: 'relative',
                                        borderRadius: '9999px', // full circle
                                        height: '8px',
                                        width: '8px',
                                        backgroundColor:
                                            'var(--mantine-color-orange-6)',
                                    }}
                                />
                            </Box>
                        }
                    >
                        Feedback
                    </Tabs.Tab>
                    <Tabs.Tab value="networking">Networking</Tabs.Tab>
                </Tabs.List>

                {/* Data Panel: Contains all the form fields */}
                <Tabs.Panel value="data" pt="xs">
                    <DataForm
                        dataResume={dataResume}
                        activeAccordion={activeAccordion}
                        setActiveAccordion={setActiveAccordion}
                        handleChange={handleChange}
                        handleVisibilityToggle={handleVisibilityToggle}
                        activeNestedAccordions={activeNestedAccordions}
                        handleNestedAccordionChange={
                            handleNestedAccordionChange
                        }
                        handleItemChange={handleItemChange}
                    />
                </Tabs.Panel>

                {/* Styles Panel: Contains style and template options */}
                <Tabs.Panel value="styles" pt="xs">
                    <StylesForm
                        changeTheme={changeTheme}
                        dataResume={dataResume}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="job_desc" pt="xs">
                    <JobDescriptionDisplay
                        jobDescription={dataResume.job_description}
                        jobPosition={dataResume.job_position}
                        companyName={dataResume.company_name}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="ai_feedback" pt="xs">
                    <AiFeedbackDisplay
                        feedback={dataResume.resume_generated.feedback}
                        keywords={dataResume.resume_generated.keywords}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="networking" pt="xs">
                    <NetworkingDisplay
                        networkingLinks={
                            dataResume.resume_generated.networkingLinks
                        }
                        userName={dataResume.resume_generated.contact_info.name}
                        jobTitle={dataResume.company_name}
                        companyName={dataResume.job_position}
                    />
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
}
