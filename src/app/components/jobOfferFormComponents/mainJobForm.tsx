'use client';

import ResumeBuilderForm from './resumeBuilderForm';

interface Props {
    className: string;
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
    className,
    status,
    percentage,
    sectionCounts,
    onCompleteProfileClick,
}: Props) {
    return (
        <div className={className}>
            <ResumeBuilderForm
                status={status}
                percentage={percentage}
                sectionCounts={sectionCounts}
                onCompleteProfileClick={onCompleteProfileClick}
            />
        </div>
    );
}
