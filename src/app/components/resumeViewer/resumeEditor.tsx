'use client';
import React, { useState, SetStateAction, ChangeEvent } from 'react';
import { Box, Tabs } from '@mantine/core';
import { FormJobOfferDataStructure, ResumeStyles } from '@/utils/interfaces';
import classes from './resumeEditor.module.css';
import { DataForm } from './DataForm';
import StylesForm from './StylesForm';
import JobDescriptionDisplay from './JobDescriptionDisplay';
import AiFeedbackDisplay from './AiFeedbackDisplay';
import NetworkingDisplay from './NetworkingDisplay';

interface ResumeEditorProps {
    dataResume: FormJobOfferDataStructure;
    setDataResume: (updater: SetStateAction<FormJobOfferDataStructure>) => void;
}

export default function ResumeEditor({
    dataResume,
    setDataResume,
}: ResumeEditorProps) {
    const [activeAccordion, setActiveAccordion] = useState<string | null>(
        'personalInfo',
    );
    const [activeTab, setActiveTab] = useState<string | null>('data');
    const [activeNestedAccordions, setActiveNestedAccordions] = useState<
        Record<string, string[]>
    >({});

    const handleNestedAccordionChange = (
        sectionId: string,
        value: string[],
    ) => {
        setActiveNestedAccordions((prev) => ({ ...prev, [sectionId]: value }));
    };

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

    const handleMoveSection = (index: number, direction: 'up' | 'down') => {
        setDataResume((prev) => {
            const currentLayout = prev.resume_generated?.layout;
            if (!Array.isArray(currentLayout)) return prev;
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= currentLayout.length) {
                return prev;
            }
            const newLayout = [...currentLayout];
            const [moved] = newLayout.splice(index, 1);
            newLayout.splice(targetIndex, 0, moved);
            return {
                ...prev,
                resume_generated: {
                    ...prev.resume_generated,
                    layout: newLayout,
                },
            };
        });
    };

    const handleStyleChange = (updates: Partial<ResumeStyles>) => {
        setDataResume((prev) => ({
            ...prev,
            resume_generated: {
                ...prev.resume_generated,
                styles: {
                    ...(prev.resume_generated?.styles || { theme: 'modern' }),
                    ...updates,
                },
            },
        }));
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.currentTarget;
        const sectionId = e.currentTarget.getAttribute('data-section');
        const iteratorIndex = e.currentTarget.getAttribute('data-iterator');
        setDataResume((prev) => {
            const newData = JSON.parse(JSON.stringify(prev));
            if (name === 'personalInfo') {
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
                    sectionToUpdate.items = value;
                } else {
                    sectionToUpdate.items = value.split('\n');
                }
            } else if (name === 'title') {
                sectionToUpdate.title = value;
            }
            return newData;
        });
    };

    const handleItemChange = (
        sectionIndex: number,
        itemIndex: number,
        fieldName: string,
        value: string,
    ) => {
        setDataResume((prev) => {
            const newLayout = JSON.parse(
                JSON.stringify(prev.resume_generated.layout),
            );
            const sectionToUpdate = newLayout[sectionIndex];
            if (
                sectionToUpdate &&
                'items' in sectionToUpdate &&
                Array.isArray(sectionToUpdate.items) &&
                sectionToUpdate.items[itemIndex]
            ) {
                sectionToUpdate.items[itemIndex][fieldName] = value;
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
                    <Tabs.Tab value="data">Content & Order</Tabs.Tab>
                    <Tabs.Tab value="styles">Skins & Styles</Tabs.Tab>
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
                                <Box
                                    style={{
                                        position: 'relative',
                                        borderRadius: '9999px',
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

                <Tabs.Panel value="data" pt="xs">
                    <DataForm
                        dataResume={dataResume}
                        activeAccordion={activeAccordion}
                        setActiveAccordion={setActiveAccordion}
                        handleChange={handleChange}
                        handleVisibilityToggle={handleVisibilityToggle}
                        onMoveSection={handleMoveSection}
                        activeNestedAccordions={activeNestedAccordions}
                        handleNestedAccordionChange={
                            handleNestedAccordionChange
                        }
                        handleItemChange={handleItemChange}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="styles" pt="xs">
                    <StylesForm
                        onStyleChange={handleStyleChange}
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
                        jobTitle={dataResume.job_position}
                        companyName={dataResume.company_name}
                    />
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
}
