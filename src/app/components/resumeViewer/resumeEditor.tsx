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
    EducationSection,
    ExperienceSection,
    FormJobOfferDataStructure,
    NarrativeSection,
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
        setActiveNestedAccordions((prev) => ({
            ...prev,
            [sectionId]: value,
        }));
    };

    // Your function to show/hide specific sections in the resume
    const hideShowSection = (e: React.MouseEvent<HTMLButtonElement>) => {
        const iterator = e.currentTarget.getAttribute('data-iterator');
        const sectionNameFromAttr =
            e.currentTarget.getAttribute('data-section');

        setDataResume((prevDataResume) => {
            if (iterator == null || sectionNameFromAttr == null) {
                console.error(
                    'hideShowSection: Missing data-iterator or data-section',
                );
                return prevDataResume;
            }
            const index = parseInt(iterator, 10);

            if (
                sectionNameFromAttr !== 'experience' &&
                sectionNameFromAttr !== 'projects' &&
                sectionNameFromAttr !== 'education' &&
                sectionNameFromAttr !== 'skills' &&
                sectionNameFromAttr !== 'narrative'
            ) {
                console.warn(
                    `hideShowSection: Section '${sectionNameFromAttr}' is not 'experience', 'projects', or 'education'. Logic not applied.`,
                );
                return prevDataResume;
            }

            if (
                !prevDataResume.resume_generated ||
                !prevDataResume.resume_generated.layout ||
                !prevDataResume.resume_generated.layout[index]
            ) {
                console.error(
                    `hideShowSection: resume_generated.layout[${index}] is not accessible.`,
                );
                return prevDataResume;
            }

            const sectionArray = prevDataResume.resume_generated.layout;
            if (!Array.isArray(sectionArray)) {
                console.error(
                    `hideShowSection: [${index}] is not accessible or not an array.`,
                );
                return prevDataResume;
            }

            const updatedSectionItems = [...sectionArray];
            const currentItem = updatedSectionItems[index];

            // if the display property is undefined, set its initial state based on what "hide/show" implies
            // If clicking "hide", initial undefined means it's currently shown (true), so next state is false.
            // If clicking "show", initial undefined means it's currently hidden (false), so next state is true.
            // For simplicity, let's assume undefined means it's currently visible (true).
            const display =
                currentItem.display === undefined ? true : currentItem.display;

            updatedSectionItems[index] = {
                ...currentItem,
                display: !display,
            };

            return {
                ...prevDataResume,
                resume_generated: {
                    ...prevDataResume.resume_generated,
                    layout: updatedSectionItems,
                },
            };
        });
    };

    // funciton to handle the change of the input
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        // Use `data-section` to determine which part of the resume to update
        const section = e.target.getAttribute('data-section')?.toLowerCase();
        // Use `data-iterator` to determine the index in the array (if applicable)
        // This is useful for sections like experience, projects, education, etc.
        // If the section is not an array, `data-iterator` will be null
        // and we can ignore it.
        const iteratorStr = e.target.getAttribute('data-iterator');
        const layoutPosition = e.target.getAttribute('data-layout-position');

        setDataResume((prev) => {
            // Create a deep copy to avoid mutation issues
            const newData = JSON.parse(JSON.stringify(prev));

            // If the input is a title, we update the section's title
            // This is determined by the `is-title` attribute
            // If `is-title` is '1', we assume it's a title input
            // and we update the title in the layout array at the specified position
            if (name === 'title' && layoutPosition !== null) {
                // Ensure layoutPosition is a valid number
                const layoutPositionNum = parseInt(layoutPosition, 10);
                if (
                    newData.resume_generated &&
                    newData.resume_generated.layout &&
                    newData.resume_generated.layout[layoutPositionNum]
                ) {
                    newData.resume_generated.layout[layoutPositionNum].title =
                        value;
                    return newData;
                }
            }

            switch (section) {
                case 'job_position':
                    newData.job_position = value;
                    break;

                case 'name':
                case 'email':
                case 'linkedin':
                case 'phone':
                    if (newData.resume_generated?.contact_info) {
                        newData.resume_generated.contact_info[section] = value;
                    }
                    break;

                case 'summary':
                case 'career_objective':
                    if (newData.resume_generated) {
                        newData.resume_generated[section] = value;
                    }
                    break;

                case 'experience':
                case 'projects':
                case 'education':
                    // If the section is an array, we need to find the correct index
                    // using the iteratorStr (which is the index in the array)
                    if (iteratorStr !== null && newData.resume_generated) {
                        const index = parseInt(iteratorStr, 10);
                        const sectionArray = newData.resume_generated[section];
                        if (sectionArray && sectionArray[index]) {
                            // `name` comes from the input's `name` attribute (e.g., "title", "description")
                            sectionArray[index][name] = value;
                        }
                    }
                    break;

                case 'skills':
                    if (
                        iteratorStr !== null &&
                        newData.resume_generated?.skills
                    ) {
                        const index = parseInt(iteratorStr, 10);
                        if (
                            newData.resume_generated.skills[index] !== undefined
                        ) {
                            newData.resume_generated.skills[index] = value;
                        }
                    }
                    break;
            }
            return newData;
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
                        <Title order={4} className={classes.sectionTitle}>
                            Personal Information
                        </Title>
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
                                    onChange={handleChange}
                                    data-section="name" // Key in resume_generated
                                    data-field="name" // Field within personalInfo object
                                    className={classes.inputField}
                                />
                                <TextInput
                                    label="Position Applied For"
                                    placeholder="Position you are applying for"
                                    value={dataResume.job_position}
                                    onChange={handleChange}
                                    data-section="job_position" // Key in resume_generated
                                    data-field="job_position" // Field within personalInfo object
                                    className={classes.inputField}
                                />
                                <TextInput
                                    label="Email Address"
                                    placeholder="your.email@example.com"
                                    type="email"
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
                            onVisibilityToggle={hideShowSection}
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
                                className={classes.inputField}
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
                                                                sectionId={
                                                                    section.id
                                                                }
                                                                itemIndex={
                                                                    itemIdx
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
                                                                itemIndex={
                                                                    itemIdx
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
                                                                itemIndex={
                                                                    itemIdx
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
