'use client';

import ResumeBuilderForm from './resumeBuilderForm';
import { useState } from 'react';
import ResumeList from './resumeList';
import { SegmentedControl } from '@mantine/core';

interface Props {
    className: string;
}
export default function MainJobForm({ className }: Props) {
    const [sectionDisplayed, setSectionDisplayed] = useState<
        'builder' | 'list'
    >('builder');
    return (
        <div className={className}>
            <div>
                <SegmentedControl
                    value={sectionDisplayed}
                    onChange={(value) =>
                        setSectionDisplayed(value as 'builder' | 'list')
                    }
                    data={[
                        { value: 'builder', label: <p>Resume Builder</p> },
                        { value: 'list', label: <p>Generated Resumes</p> },
                    ]}
                />
            </div>
            {sectionDisplayed == 'builder' ? (
                <ResumeBuilderForm />
            ) : (
                <ResumeList />
            )}
        </div>
    );
}
