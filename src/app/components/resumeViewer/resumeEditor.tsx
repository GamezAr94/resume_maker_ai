'use client';
// Import React and necessary Mantine components
import React, { useState, SetStateAction, ChangeEvent } from 'react';
import {
    Accordion,
    Box,
    Group,
    Paper,
    Title,
    Stack,
    TextInput,
    Textarea,
    Text,
} from '@mantine/core';

// Import your data structure type - MAKE SURE PATH IS CORRECT
import {
    Education,
    EducationSection,
    Experience,
    ExperienceSection,
    FormJobOfferDataStructure,
    NarrativeSection,
    Project,
    ProjectsSection,
    SkillsSection,
} from '@/utils/interfaces';

// Import the CSS module
import classes from './resumeEditor.module.css';
import { SectionCard } from './SectionCard';
import { ExperienceItemCard } from './ItemsCards/ExperienceItemCard';
import { ProjectItemCard } from './ItemsCards/ProjectItemCard';
import { EducationItemCard } from './ItemsCards/EducationItemCard';
import { SkillsPanel } from './ItemsCards/SkillsPanel';
import { NarrativePanel } from './ItemsCards/NarrativePanel';

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
    const handleVisibilityToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
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

    // funciton to handle the change of the input
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.currentTarget;
        const sectionId = e.currentTarget.getAttribute('data-section');
        const iteratorIndex = e.currentTarget.getAttribute('data-iterator');
        console.log(
            `Handling change for section: ${sectionId}, iterator: ${iteratorIndex}, name: ${name}, value: ${value}`,
        );

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
        value: any,
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
            <Group justify="space-between" mb="xl">
                <Title order={2} className={classes.mainTitle}>
                    Edit Your Resume
                </Title>
            </Group>

            <Accordion
                value={activeAccordion}
                onChange={setActiveAccordion}
                variant="separated"
                className={classes.customAccordionWrapper}
            >
                {/* Personal Info Section */}
                <Accordion.Item
                    value="personalInfo"
                    className={classes.accordionItem}
                >
                    <Accordion.Control>
                        <Text>Personal Information</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Paper p="md" className={classes.sectionPaper}>
                            <Stack gap="md">
                                <TextInput
                                    label="Full Name"
                                    placeholder="Your full name"
                                    value={
                                        dataResume.resume_generated
                                            ?.contact_info.name || ''
                                    }
                                    name="personalInfo"
                                    onChange={handleChange}
                                    data-section="name" // Key in resume_generated
                                    data-field="name" // Field within personalInfo object
                                    className={classes.inputField}
                                />
                                <TextInput
                                    label="Position Applied For"
                                    placeholder="Position you are applying for"
                                    value={dataResume.job_position}
                                    name="personalInfo"
                                    onChange={handleChange}
                                    data-section="job_position" // Key in resume_generated
                                    data-field="job_position" // Field within personalInfo object
                                    className={classes.inputField}
                                />
                                <TextInput
                                    label="Email Address"
                                    placeholder="your.email@example.com"
                                    type="email"
                                    name="personalInfo"
                                    value={
                                        dataResume.resume_generated
                                            ?.contact_info?.email || ''
                                    }
                                    onChange={handleChange}
                                    data-section="email"
                                    data-field="email"
                                    className={classes.inputField}
                                />
                                <TextInput
                                    label="Phone Number"
                                    placeholder="(123) 456-7890"
                                    name="personalInfo"
                                    value={
                                        dataResume.resume_generated
                                            ?.contact_info?.phone || ''
                                    }
                                    onChange={handleChange}
                                    data-section="phone"
                                    data-field="phone"
                                    className={classes.inputField}
                                />
                                <TextInput
                                    label="LinkedIn Profile URL"
                                    placeholder="linkedin.com/in/yourprofile"
                                    name="personalInfo"
                                    value={
                                        dataResume.resume_generated
                                            ?.contact_info?.linkedin || ''
                                    }
                                    onChange={handleChange}
                                    data-section="linkedin"
                                    data-field="linkedin"
                                    className={classes.inputField}
                                />
                            </Stack>
                        </Paper>
                    </Accordion.Panel>
                </Accordion.Item>

                {dataResume.resume_generated?.layout?.map((section, idx) => {
                    // Check if the section is
                    // The isVisible logic is now inside the component that needs it.
                    return (
                        <SectionCard
                            key={`${section.id}-${idx}`}
                            section={section}
                            idx={idx}
                            onVisibilityToggle={handleVisibilityToggle}
                        >
                            {/* Title Editor - Common to all sections */}
                            <Textarea
                                label="Section Title"
                                value={section.title || ''}
                                onChange={handleChange}
                                name="title"
                                data-section={section.id}
                                data-iterator={idx}
                                autosize
                                minRows={1}
                                className={classes.descriptionTextarea}
                            />
                            <Box mt="md">
                                {(() => {
                                    switch (section.id) {
                                        // Render the new NarrativePanel
                                        case 'narrative':
                                            return (
                                                <NarrativePanel
                                                    section={
                                                        section as NarrativeSection
                                                    }
                                                    onSectionChange={
                                                        handleChange
                                                    }
                                                    sectionIndex={idx}
                                                />
                                            );

                                        // Render the new SkillsPanel
                                        case 'skills':
                                            return (
                                                <SkillsPanel
                                                    section={
                                                        section as SkillsSection
                                                    }
                                                    onSectionChange={
                                                        handleChange
                                                    }
                                                    sectionIndex={idx}
                                                />
                                            );

                                        // Render nested accordion for Experience
                                        case 'experience':
                                            // TODO: Maybe we can show the number of hidden items in the section title
                                            /*
                                            const count = section.items.filter(
                                                (item) =>
                                                    item.display === false,
                                            ).length;
                                            console.log(
                                                `Experience section has ${count} hidden items`,
                                            );
                                            */
                                            return (
                                                <Accordion
                                                    multiple
                                                    variant="contained"
                                                    radius="md"
                                                    mt="lg"
                                                    value={
                                                        activeNestedAccordions[
                                                            section.id
                                                        ] || []
                                                    }
                                                    onChange={(value) =>
                                                        handleNestedAccordionChange(
                                                            section.id,
                                                            value,
                                                        )
                                                    }
                                                >
                                                    {(
                                                        section as ExperienceSection
                                                    ).items.map(
                                                        (item, itemIdx) => (
                                                            <ExperienceItemCard
                                                                key={itemIdx}
                                                                item={item}
                                                                idx={idx}
                                                                sectionId={
                                                                    section.id
                                                                }
                                                                itemIndex={
                                                                    itemIdx
                                                                }
                                                                onVisibilityToggle={
                                                                    handleVisibilityToggle
                                                                }
                                                                onItemChange={
                                                                    handleItemChange
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Accordion>
                                            );

                                        // Render nested accordion for Projects
                                        case 'projects':
                                            return (
                                                <Accordion
                                                    multiple
                                                    variant="contained"
                                                    radius="md"
                                                    mt="lg"
                                                    value={
                                                        activeNestedAccordions[
                                                            section.id
                                                        ] || []
                                                    }
                                                    onChange={(value) =>
                                                        handleNestedAccordionChange(
                                                            section.id,
                                                            value,
                                                        )
                                                    }
                                                >
                                                    {(
                                                        section as ProjectsSection
                                                    ).items.map(
                                                        (item, itemIdx) => (
                                                            <ProjectItemCard
                                                                key={itemIdx}
                                                                item={item}
                                                                sectionId={
                                                                    section.id
                                                                }
                                                                idx={idx}
                                                                itemIndex={
                                                                    itemIdx
                                                                }
                                                                onVisibilityToggle={
                                                                    handleVisibilityToggle
                                                                }
                                                                onItemChange={
                                                                    handleItemChange
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Accordion>
                                            );

                                        // Render nested accordion for Education
                                        case 'education':
                                            return (
                                                <Accordion
                                                    multiple
                                                    variant="contained"
                                                    radius="md"
                                                    mt="lg"
                                                    value={
                                                        activeNestedAccordions[
                                                            section.id
                                                        ] || []
                                                    }
                                                    onChange={(value) =>
                                                        handleNestedAccordionChange(
                                                            section.id,
                                                            value,
                                                        )
                                                    }
                                                >
                                                    {(
                                                        section as EducationSection
                                                    ).items.map(
                                                        (item, itemIdx) => (
                                                            <EducationItemCard
                                                                key={itemIdx}
                                                                item={item}
                                                                sectionId={
                                                                    section.id
                                                                }
                                                                idx={idx}
                                                                itemIndex={
                                                                    itemIdx
                                                                }
                                                                onItemChange={
                                                                    handleItemChange
                                                                }
                                                                onVisibilityToggle={
                                                                    handleVisibilityToggle
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Accordion>
                                            );

                                        default:
                                            return (
                                                <Text c="dimmed" size="sm">
                                                    No editor available for this
                                                    section type.
                                                </Text>
                                            );
                                    }
                                })()}
                            </Box>
                        </SectionCard>
                    );
                })}
            </Accordion>
        </Box>
    );
}
