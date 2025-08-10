'use client';

import ResumeBuilderForm from './resumeBuilderForm';

interface Props {
    status: 'disabled' | 'warn' | 'ready';
    percentage: number;
    sectionCounts: {
        [key: string]: {
            current: number;
            required: number;
            label: string;
            value: string;
        };
    };
    onCompleteProfileClick: () => void;
}

export default function MainJobForm({
    status,
    percentage,
    sectionCounts,
    onCompleteProfileClick,
}: Props) {
    return (
        <ResumeBuilderForm
            status={status}
            percentage={percentage}
            sectionCounts={sectionCounts}
            onCompleteProfileClick={onCompleteProfileClick}
        />
    );
}
