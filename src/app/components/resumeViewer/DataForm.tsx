import React from 'react';
import {
    Accordion,
    Paper,
    Stack,
    TextInput,
    Textarea,
    Box,
    Text,
} from '@mantine/core';
import classes from './resumeEditor.module.css';
import {
    EducationSection,
    ExperienceSection,
    FormJobOfferDataStructure,
    NarrativeSection,
    ProjectsSection,
    SkillsSection,
} from '@/utils/interfaces';
import { SectionCard } from './SectionCard';
import { NarrativePanel } from './ItemsCards/NarrativePanel';
import { SkillsPanel } from './ItemsCards/SkillsPanel';
import { ExperienceItemCard } from './ItemsCards/ExperienceItemCard';
import { ProjectItemCard } from './ItemsCards/ProjectItemCard';
import { EducationItemCard } from './ItemsCards/EducationItemCard';

// Define the props the component will need
interface DataFormProps {
    dataResume: FormJobOfferDataStructure;
    activeAccordion: string | null;
    setActiveAccordion: (value: string | null) => void;
    handleChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    handleItemChange: (
        sectionIndex: number,
        itemIndex: number,
        fieldName: string,
        value: any,
    ) => void;
    handleVisibilityToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
    handleNestedAccordionChange: (sectionId: string, value: string[]) => void;
    activeNestedAccordions: Record<string, string[]>;
}

export function DataForm({
    dataResume,
    activeAccordion,
    setActiveAccordion,
    handleChange,
    handleItemChange,
    handleVisibilityToggle,
    handleNestedAccordionChange,
    activeNestedAccordions,
}: DataFormProps) {
    return (
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
                    <Paper p="md">
                        <Stack gap="md">
                            <TextInput
                                label="Full Name"
                                placeholder="Your full name"
                                value={
                                    dataResume.resume_generated?.contact_info
                                        .name || ''
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
                                    dataResume.resume_generated?.contact_info
                                        ?.email || ''
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
                                    dataResume.resume_generated?.contact_info
                                        ?.phone || ''
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
                                    dataResume.resume_generated?.contact_info
                                        ?.linkedin || ''
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
                                                onSectionChange={handleChange}
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
                                                onSectionChange={handleChange}
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
                                                ).items.map((item, itemIdx) => (
                                                    <ExperienceItemCard
                                                        key={itemIdx}
                                                        item={item}
                                                        idx={idx}
                                                        sectionId={section.id}
                                                        itemIndex={itemIdx}
                                                        onVisibilityToggle={
                                                            handleVisibilityToggle
                                                        }
                                                        onItemChange={
                                                            handleItemChange
                                                        }
                                                    />
                                                ))}
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
                                                ).items.map((item, itemIdx) => (
                                                    <ProjectItemCard
                                                        key={itemIdx}
                                                        item={item}
                                                        sectionId={section.id}
                                                        idx={idx}
                                                        itemIndex={itemIdx}
                                                        onVisibilityToggle={
                                                            handleVisibilityToggle
                                                        }
                                                        onItemChange={
                                                            handleItemChange
                                                        }
                                                    />
                                                ))}
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
                                                ).items.map((item, itemIdx) => (
                                                    <EducationItemCard
                                                        key={itemIdx}
                                                        item={item}
                                                        sectionId={section.id}
                                                        idx={idx}
                                                        itemIndex={itemIdx}
                                                        onItemChange={
                                                            handleItemChange
                                                        }
                                                        onVisibilityToggle={
                                                            handleVisibilityToggle
                                                        }
                                                    />
                                                ))}
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
    );
}
