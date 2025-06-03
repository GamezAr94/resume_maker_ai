'use client';
// Import React and necessary Mantine components
import React, { useState, Dispatch, SetStateAction, ChangeEvent } from 'react';
import {
    Button,
    Accordion,
    Box,
    Group,
    Paper,
    Title,
    Text,
    Stack,
    TextInput,
    Textarea,
    ActionIcon,
    SegmentedControl,
} from '@mantine/core';
import { IconPlus, IconEye, IconEyeOff } from '@tabler/icons-react';

// Import your data structure type - MAKE SURE PATH IS CORRECT
import { FormJobOfferDataStructure } from '@/utils/interfaces';

// Import the CSS module
import classes from './resumeEditor.module.css';

// Interface using YOUR prop names
interface ResumeEditorProps {
    dataResume: FormJobOfferDataStructure;
    setDataResume: Dispatch<SetStateAction<FormJobOfferDataStructure>>;
}

type ToggleableSectionKey = 'experience' | 'projects' | 'education';

export default function ResumeEditor({
    dataResume,
    setDataResume,
}: ResumeEditorProps) {
    // State for accordion
    const [activeAccordion, setActiveAccordion] = useState<
        string | string[] | null
    >(['personalInfo']);

    // Your function to show/hide specific sections in the resume
    const hideShowSection = (e: React.MouseEvent<HTMLButtonElement>) => {
        const iterator = e.currentTarget.getAttribute('data-iterator');
        const sectionNameFromAttr =
            e.currentTarget.getAttribute('data-section');

        if (iterator == null || sectionNameFromAttr == null) {
            // Added check for section as well
            console.error(
                'hideShowSection: Missing data-iterator or data-section',
            );
            return;
        }
        const index = parseInt(iterator, 10);

        // Check if the sectionNameFromAttr is one of the keys we expect for this function
        if (
            sectionNameFromAttr !== 'experience' &&
            sectionNameFromAttr !== 'projects' &&
            sectionNameFromAttr !== 'education'
        ) {
            console.warn(
                `hideShowSection: Section '${sectionNameFromAttr}' is not 'experience', 'projects', or 'education'. Logic not applied.`,
            );
            return;
        }

        // Now TypeScript knows 'section' is one of 'experience', 'projects', or 'education'
        const section = sectionNameFromAttr as ToggleableSectionKey;

        // Assuming 'resume_generated' is a key in your FormJobOfferDataStructure
        // And 'projects' and 'experience' are keys within 'resume_generated'
        if (
            !dataResume.resume_generated ||
            !(section in dataResume.resume_generated)
        ) {
            console.error(
                `hideShowSection: section '${section}' not found in dataResume.resume_generated`,
            );
            return;
        }

        if (!dataResume.resume_generated) {
            console.error('hideShowSection: resume_generated is missing.');
            return;
        }

        const sectionArray = dataResume.resume_generated[section];
        if (!Array.isArray(sectionArray) || !sectionArray[index]) {
            console.error(
                `hideShowSection: ${section}[${index}] is not accessible or not an array.`,
            );
            return;
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

        setDataResume((prevDataResume) => ({
            ...prevDataResume,
            resume_generated: {
                ...prevDataResume.resume_generated,
                [section]: updatedSectionItems,
            },
        }));
    };

    // funciton to handle the change of the input
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        console.log(dataResume);
        const [value, name] = [e.target.value, e.target.name];
        const section = e.target.getAttribute('data-section');

        const iteratorStr = e.target.getAttribute('data-iterator');

        switch (section) {
            case 'job_position':
                setDataResume({
                    ...dataResume,
                    job_position: value,
                });
                break;
            case 'name':
            case 'email':
            case 'linkedin':
            case 'phone':
                setDataResume({
                    ...dataResume,
                    resume_generated: {
                        ...dataResume.resume_generated,
                        contact_info: {
                            ...dataResume.resume_generated.contact_info,
                            [section]: value,
                        },
                    },
                });
                break;
            case 'summary':
            case 'career_objective':
                setDataResume({
                    ...dataResume,
                    resume_generated: {
                        ...dataResume.resume_generated,
                        [section]: value,
                    },
                });
                break;
            case 'projects':
            case 'experience':
            case 'education':
                if (iteratorStr !== null) {
                    const index = parseInt(iteratorStr, 10);
                    const updatedProjects = [
                        ...dataResume.resume_generated[section],
                    ];
                    updatedProjects[index] = {
                        ...updatedProjects[index],
                        [name]: value,
                    };
                    setDataResume({
                        ...dataResume,
                        resume_generated: {
                            ...dataResume.resume_generated,
                            [section]: updatedProjects,
                        },
                    });
                }
                break;
            case 'skills':
                if (iteratorStr !== null) {
                    const index = parseInt(iteratorStr, 10);

                    // Access the skills array safely from the previous state
                    const currentSkillsArray =
                        dataResume.resume_generated?.skills;

                    // Ensure it's actually an array before proceeding
                    if (Array.isArray(currentSkillsArray)) {
                        if (index >= 0 && index < currentSkillsArray.length) {
                            const updatedSkillsArray = [...currentSkillsArray];
                            updatedSkillsArray[index] = value; // Directly update the string at the given index

                            setDataResume((prev) => ({
                                ...prev,
                                resume_generated: {
                                    ...prev.resume_generated,
                                    skills: updatedSkillsArray, // Set the new array of strings
                                },
                            }));
                        } else {
                            console.warn(
                                `handleChange (skills): Index ${index} out of bounds for skills array.`,
                            );
                        }
                    }
                }
                break;
            default:
                return;
        }
    };

    return (
        <Box className={classes.editorContainer}>
            <Group justify="space-between" mb="xl">
                <Title order={2} className={classes.mainTitle}>
                    Edit Your Resume
                </Title>
            </Group>

            <Accordion
                multiple
                value={activeAccordion as string[]}
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
                            {/* ====================================================================== */}
                            {/* INSERT YOUR ORIGINAL <TextInput>, <Textarea>, etc. for       */}
                            {/* Personal Information HERE.                                     */}
                            {/* Apply `className={classes.inputField}` to each input/textarea. */}
                            {/* ====================================================================== */}
                            <Text c="dimmed" ta="center" p="xl">
                                (Your Personal Information fields go here)
                            </Text>
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
                                <Box mt="lg" mb="sm">
                                    {' '}
                                    {/* Added some margin for spacing */}
                                    <Text size="sm" fw={500} mb={4}>
                                        Personal Description:
                                    </Text>
                                    <SegmentedControl
                                        value={
                                            dataResume.resume_generated
                                                ?.selected_narrative ||
                                            'summary'
                                        } // Default to 'summary' if nothing is selected
                                        onChange={(value) => {
                                            // Inline handler for simplicity
                                            setDataResume((prevDataResume) => ({
                                                ...prevDataResume,
                                                resume_generated: {
                                                    ...prevDataResume.resume_generated,
                                                    selected_narrative:
                                                        value as
                                                            | 'summary'
                                                            | 'career_objective',
                                                },
                                            }));
                                        }}
                                        data={[
                                            {
                                                label: 'Career Objective',
                                                value: 'career_objective',
                                            },
                                            {
                                                label: 'Summary',
                                                value: 'summary',
                                            },
                                        ]}
                                        fullWidth
                                        color="blue" // Optional: add some color
                                    />
                                </Box>
                                {(() => {
                                    const activeNarrative =
                                        dataResume.resume_generated
                                            ?.selected_narrative || 'summary';

                                    if (activeNarrative === 'summary') {
                                        return (
                                            <Textarea
                                                label="Summary"
                                                placeholder="Brief professional summary or career objective..."
                                                value={
                                                    dataResume.resume_generated
                                                        ?.summary || ''
                                                }
                                                onChange={handleChange}
                                                data-section="summary"
                                                data-field="summary"
                                                name="summary"
                                                autosize
                                                minRows={3}
                                                className={`${classes.inputField} ${classes.descriptionTextarea}`}
                                            />
                                        );
                                    } else {
                                        return (
                                            <Textarea
                                                label="Career Objective"
                                                placeholder="Brief professional summary or career objective..."
                                                value={
                                                    dataResume.resume_generated
                                                        ?.career_objective || ''
                                                }
                                                onChange={handleChange}
                                                data-section="career_objective"
                                                data-field="career_objective"
                                                name="career_objective"
                                                autosize
                                                minRows={3}
                                                className={`${classes.inputField} ${classes.descriptionTextarea}`}
                                            />
                                        );
                                    }
                                })()}
                            </Stack>
                        </Paper>
                    </Accordion.Panel>
                </Accordion.Item>

                {/* Experience Section */}
                <Accordion.Item
                    value="experience"
                    className={classes.accordionItem}
                >
                    <Accordion.Control>
                        <Title order={4} className={classes.sectionTitle}>
                            Work Experience
                        </Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                        {/* ====================================================================== */}
                        {/* INSERT YOUR ORIGINAL code that maps over experience items HERE.    */}
                        {/* For each item, wrap it in a <Paper className={classes.sectionPaper}> */}
                        {/* Apply `className={classes.inputField}` to each input/textarea. */}
                        {/* Add your original Remove button (<ActionIcon>).                  */}
                        {/* ====================================================================== */}
                        <Text c="dimmed" ta="center" p="xl">
                            (Your Experience items and mapping logic go here)
                        </Text>

                        {/*dataResume.resume_generated.projects.map((pro, id) => (*/}
                        {(dataResume.resume_generated?.experience || []).map(
                            (expItem, index) => {
                                const isVisible =
                                    expItem.display === undefined
                                        ? true
                                        : expItem.display;
                                return (
                                    <Paper
                                        key={index}
                                        p="md"
                                        mt="md"
                                        className={classes.sectionPaper}
                                    >
                                        <Stack gap="md">
                                            <Group justify="space-between">
                                                <Text fw={500}>
                                                    Experience #{index + 1}
                                                </Text>
                                                <ActionIcon
                                                    variant="subtle"
                                                    onClick={hideShowSection}
                                                    data-section="experience"
                                                    data-iterator={index.toString()}
                                                    title={
                                                        isVisible
                                                            ? 'Hide this experience'
                                                            : 'Show this experience'
                                                    }
                                                >
                                                    {isVisible ? (
                                                        <IconEyeOff size={18} />
                                                    ) : (
                                                        <IconEye size={18} />
                                                    )}
                                                </ActionIcon>
                                            </Group>
                                            {isVisible && (
                                                <>
                                                    <TextInput
                                                        label="Job Title"
                                                        placeholder="e.g., Software Engineer"
                                                        value={
                                                            expItem.title || ''
                                                        }
                                                        onChange={handleChange}
                                                        data-section="experience"
                                                        data-iterator={index.toString()}
                                                        name="title"
                                                        className={
                                                            classes.inputField
                                                        }
                                                    />
                                                    <TextInput
                                                        label="Company"
                                                        placeholder="e.g., Tech Solutions Inc."
                                                        value={
                                                            expItem.company ||
                                                            ''
                                                        }
                                                        onChange={handleChange}
                                                        data-section="experience"
                                                        data-iterator={index.toString()}
                                                        name="company"
                                                        className={
                                                            classes.inputField
                                                        }
                                                    />
                                                    {/* // TODO MAybe later 
                                        <TextInput
                                            label="Location"
                                            placeholder="e.g., San Francisco, CA"
                                            value={expItem.location || ''}
                                            onChange={handleChange}
                                            data-section="job_position"
                                            name=''
                                            data-iterator={index.toString()}
                                            className={classes.inputField}
                                        />
                                        // */}
                                                    <TextInput
                                                        label="Start Date"
                                                        placeholder="Enter a date"
                                                        value={
                                                            expItem.start_end_dates ||
                                                            ''
                                                        }
                                                        onChange={handleChange}
                                                        data-section="experience"
                                                        data-iterator={index.toString()}
                                                        name="start_end_dates"
                                                        className={
                                                            classes.inputField
                                                        }
                                                    />
                                                    {/* NOTE: we also have the responsabilities tag not sure why though */}
                                                    {/* TODO check why I dont have responsabilities here.. in the DB is called Description and it is not empty */}
                                                    <Textarea
                                                        label="Description & Responsibilities"
                                                        placeholder="Describe your role and achievements..."
                                                        value={
                                                            expItem.description ||
                                                            ''
                                                        }
                                                        onChange={handleChange}
                                                        data-section="experience"
                                                        data-iterator={index.toString()}
                                                        name="description"
                                                        autosize
                                                        minRows={3}
                                                        className={`${classes.inputField} ${classes.descriptionTextarea}`}
                                                    />
                                                </>
                                            )}
                                            {/* Optional: Hide/Show button if you implement this logic for individual items */}
                                            {/* <Button onClick={hideShowSection} data-section="experience" data-iterator={index.toString()}>
                       {expItem.display !== false ? 'Hide' : 'Show'} in Resume
                   </Button> */}
                                        </Stack>
                                    </Paper>
                                );
                            },
                        )}
                        {/* Your Add Button - Styled */}
                        <Button
                            leftSection={<IconPlus size={18} />}
                            // onClick={/* YOUR ORIGINAL add experience function */}
                            mt="lg"
                            variant="light"
                            fullWidth
                            className={classes.addItemButton}
                        >
                            Add Experience
                        </Button>
                    </Accordion.Panel>
                </Accordion.Item>

                {/* Education Section */}
                <Accordion.Item
                    value="education"
                    className={classes.accordionItem}
                >
                    <Accordion.Control>
                        <Title order={4} className={classes.sectionTitle}>
                            Education
                        </Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                        {/* ====================================================================== */}
                        {/* INSERT YOUR ORIGINAL code that maps over education items HERE.     */}
                        {/* Apply styles similarly to the Experience section.                  */}
                        {/* ====================================================================== */}
                        <Text c="dimmed" ta="center" p="xl">
                            (Your Education items and mapping logic go here)
                        </Text>
                        {(dataResume.resume_generated?.education || []).map(
                            (eduItem, index: number) => {
                                console.log(eduItem);
                                const isVisible =
                                    eduItem.display === undefined
                                        ? true
                                        : eduItem.display;
                                return (
                                    <Paper
                                        key={index}
                                        p="md"
                                        mt="md"
                                        className={classes.sectionPaper}
                                    >
                                        <Stack gap="md">
                                            <Group justify="space-between">
                                                <Text fw={500}>
                                                    Education #{index + 1}
                                                </Text>
                                                <ActionIcon
                                                    variant="subtle"
                                                    onClick={hideShowSection}
                                                    data-section="education"
                                                    data-iterator={index.toString()}
                                                    title={
                                                        isVisible
                                                            ? 'Hide this education'
                                                            : 'Show this education'
                                                    }
                                                >
                                                    {isVisible ? (
                                                        <IconEyeOff size={18} />
                                                    ) : (
                                                        <IconEye size={18} />
                                                    )}
                                                </ActionIcon>
                                                {/*
                                            TODO implement the button or remove it 
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() =>
                                                    removeItemFromSection(
                                                        'education',
                                                        index,
                                                    )
                                                }
                                            >
                                                <IconTrash size={18} />
                                            </ActionIcon>
                                                */}
                                            </Group>
                                            {isVisible && (
                                                <>
                                                    <TextInput
                                                        label="Degree / Certificate"
                                                        placeholder="e.g., B.S. Computer Science"
                                                        value={
                                                            eduItem.degree || ''
                                                        }
                                                        onChange={handleChange}
                                                        data-section="education"
                                                        data-iterator={index.toString()}
                                                        name="degree"
                                                        className={
                                                            classes.inputField
                                                        }
                                                    />
                                                    <TextInput
                                                        label="Institution"
                                                        placeholder="e.g., University of Example"
                                                        value={
                                                            eduItem.school || ''
                                                        }
                                                        onChange={handleChange}
                                                        data-section="education"
                                                        data-iterator={index.toString()}
                                                        name="school"
                                                        className={
                                                            classes.inputField
                                                        }
                                                    />
                                                    <TextInput
                                                        label="Location (Optional)"
                                                        placeholder="e.g., City, State"
                                                        value={
                                                            eduItem.location ||
                                                            ''
                                                        }
                                                        onChange={handleChange}
                                                        data-section="education"
                                                        data-iterator={index.toString()}
                                                        name="location"
                                                        className={
                                                            classes.inputField
                                                        }
                                                    />
                                                    <Textarea
                                                        label="Graduation Date / Expected"
                                                        placeholder="Specify the date"
                                                        value={
                                                            eduItem.start_end_dates ||
                                                            ''
                                                        }
                                                        onChange={handleChange}
                                                        data-section="education"
                                                        data-iterator={index.toString()}
                                                        name="start_end_dates"
                                                        autosize
                                                        minRows={2}
                                                        className={`${classes.inputField} ${classes.descriptionTextarea}`}
                                                    />
                                                </>
                                            )}
                                            {/*
                                        <Textarea
                                            label="Relevant Coursework / Details (Optional)"
                                            placeholder="e.g., Thesis, GPA, Honors..."
                                            value={eduItem.description || ''}
                                            onChange={handleChange}
                                            data-section="education"
                                            data-iterator={index.toString()}
                                            data-field="description"
                                            autosize
                                            minRows={2}
                                            className={`${classes.inputField} ${classes.descriptionTextarea}`}
                                        />
                                        */}
                                        </Stack>
                                    </Paper>
                                );
                            },
                        )}
                        <Button
                            leftSection={<IconPlus size={18} />}
                            /* onClick={YOUR_ADD_FUNCTION} */ mt="lg"
                            variant="light"
                            fullWidth
                            className={classes.addItemButton}
                        >
                            Add Education
                        </Button>
                    </Accordion.Panel>
                </Accordion.Item>

                {/* Skills Section */}
                <Accordion.Item
                    value="skills"
                    className={classes.accordionItem}
                >
                    <Accordion.Control>
                        <Title order={4} className={classes.sectionTitle}>
                            Skills
                        </Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                        {/* ====================================================================== */}
                        {/* INSERT YOUR ORIGINAL code that maps over skills items HERE.        */}
                        {/* Apply styles similarly to the Experience section.                  */}
                        {/* ====================================================================== */}
                        <Text c="dimmed" ta="center" p="xl">
                            (Your Skills items and mapping logic go here)
                        </Text>
                        {(dataResume.resume_generated?.skills || []).map(
                            (skillItem, index: number) => (
                                <Paper
                                    key={index}
                                    p="md"
                                    mt="md"
                                    className={classes.sectionPaper}
                                >
                                    <Stack gap="md">
                                        <Group
                                            justify="space-between"
                                            align="flex-end"
                                        >
                                            <TextInput
                                                label={`Skill #${index + 1}`}
                                                placeholder="e.g., JavaScript"
                                                value={skillItem || ''}
                                                onChange={handleChange}
                                                data-section="skills"
                                                data-iterator={index.toString()}
                                                name="name"
                                                className={classes.inputField}
                                                style={{ flexGrow: 1 }}
                                            />
                                            {/*
                                            <Select
                                                label="Proficiency"
                                                placeholder="Select level"
                                                value={
                                                    skillItem.level ||
                                                    'Intermediate'
                                                }
                                                onChange={(value) =>
                                                    handleComplexInputChange(
                                                        'skills',
                                                        'level',
                                                        value,
                                                        index,
                                                    )
                                                }
                                                data={[
                                                    'Beginner',
                                                    'Intermediate',
                                                    'Advanced',
                                                    'Expert',
                                                ]}
                                                className={classes.inputField}
                                                style={{ minWidth: '150px' }}
                                            />
                                            TODO implement the button or remove it 
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() =>
                                                    removeItemFromSection(
                                                        'skills',
                                                        index,
                                                    )
                                                }
                                                mb={4}
                                            >
                                                {' '}
                                                <IconTrash size={18} />
                                            </ActionIcon>
                                            */}
                                        </Group>
                                    </Stack>
                                </Paper>
                            ),
                        )}
                        <Button
                            leftSection={<IconPlus size={18} />}
                            /* onClick={YOUR_ADD_FUNCTION} */ mt="lg"
                            variant="light"
                            fullWidth
                            className={classes.addItemButton}
                        >
                            Add Skill
                        </Button>
                    </Accordion.Panel>
                </Accordion.Item>

                {/* Projects Section */}
                <Accordion.Item
                    value="projects"
                    className={classes.accordionItem}
                >
                    <Accordion.Control>
                        <Title order={4} className={classes.sectionTitle}>
                            Projects
                        </Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                        {/* ====================================================================== */}
                        {/* INSERT YOUR ORIGINAL code that maps over projects items HERE.      */}
                        {/* Apply styles similarly to the Experience section.                  */}
                        {/* ====================================================================== */}
                        <Text c="dimmed" ta="center" p="xl">
                            (Your Projects items and mapping logic go here)
                        </Text>
                        {(dataResume.resume_generated?.projects || []).map(
                            (projItem, index: number) => {
                                const isVisible =
                                    projItem.display === undefined
                                        ? true
                                        : projItem.display;
                                return (
                                    <Paper
                                        key={index}
                                        p="md"
                                        mt="md"
                                        className={classes.sectionPaper}
                                    >
                                        {/*Maybe show the relevance in a info button so that the user can read if the project is relevant or not*/}
                                        <Text c="dimmed" ta="center" p="xl">
                                            ({projItem.relevance || ''})
                                        </Text>
                                        <Stack gap="md">
                                            <Group justify="space-between">
                                                <Text fw={500}>
                                                    Project #{index + 1}
                                                </Text>
                                                <ActionIcon
                                                    variant="subtle"
                                                    onClick={hideShowSection}
                                                    data-section="projects"
                                                    data-iterator={index.toString()}
                                                    title={
                                                        isVisible
                                                            ? 'Hide this project'
                                                            : 'Show this project'
                                                    }
                                                >
                                                    {isVisible ? (
                                                        <IconEyeOff size={18} />
                                                    ) : (
                                                        <IconEye size={18} />
                                                    )}
                                                </ActionIcon>
                                                {/*
                                            TODO implement the button or remove it 
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() =>
                                                    removeItemFromSection(
                                                        'projects',
                                                        index,
                                                    )
                                                }
                                            >
                                                <IconTrash size={18} />
                                            </ActionIcon>
                                            */}
                                            </Group>
                                            {isVisible && (
                                                <>
                                                    <TextInput
                                                        label="Project Name"
                                                        placeholder="e.g., Portfolio Website"
                                                        value={
                                                            projItem.name || ''
                                                        }
                                                        onChange={handleChange}
                                                        data-section="projects"
                                                        data-iterator={index.toString()}
                                                        name="name"
                                                        className={
                                                            classes.inputField
                                                        }
                                                    />
                                                    <TextInput
                                                        label="Project Duration"
                                                        placeholder="Enter a date range"
                                                        value={
                                                            projItem.start_end_dates ||
                                                            ''
                                                        }
                                                        onChange={handleChange}
                                                        data-section="projects"
                                                        data-iterator={index.toString()}
                                                        name="start_end_dates"
                                                        className={
                                                            classes.inputField
                                                        }
                                                    />
                                                    {/*
                                        <TextInput
                                            label="Technologies Used"
                                            placeholder="e.g., React, Node.js, Firebase"
                                            value={projItem.technologies || ''}
                                            onChange={handleChange}
                                            data-section="projects"
                                            data-iterator={index.toString()}
                                            data-field="technologies"
                                            className={classes.inputField}
                                        />
                                        
                                        <TextInput
                                            label="Project URL (Optional)"
                                            placeholder="https://yourproject.com"
                                            value={projItem.url || ''}
                                            onChange={handleChange}
                                            data-section="projects"
                                            data-iterator={index.toString()}
                                            data-field="url"
                                            className={classes.inputField}
                                        />
                                        */}
                                                    <Textarea
                                                        label="Description"
                                                        placeholder="Describe your project, its features, and your role..."
                                                        value={
                                                            projItem.description ||
                                                            ''
                                                        }
                                                        onChange={handleChange}
                                                        data-section="projects"
                                                        data-iterator={index.toString()}
                                                        name="description"
                                                        autosize
                                                        minRows={3}
                                                        className={`${classes.inputField} ${classes.descriptionTextarea}`}
                                                    />
                                                </>
                                            )}
                                            {/* Optional: Hide/Show button */}
                                            {/* <Button onClick={hideShowSection} data-section="projects" data-iterator={index.toString()}>
                      {projItem.display !== false ? 'Hide' : 'Show'} in Resume
                  </Button> */}
                                        </Stack>
                                    </Paper>
                                );
                            },
                        )}
                        <Button
                            leftSection={<IconPlus size={18} />}
                            /* onClick={YOUR_ADD_FUNCTION} */ mt="lg"
                            variant="light"
                            fullWidth
                            className={classes.addItemButton}
                        >
                            Add Project
                        </Button>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Box>
    );
}
