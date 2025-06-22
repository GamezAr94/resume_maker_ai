'use client';

import ResumeBuilderForm from './resumeBuilderForm';

interface Props {
    className: string;
    status: 'disabled' | 'warn' | 'ready';
    percentage: number;
    sectionCounts: any;
}

export default function MainJobForm({
    className,
    status,
    percentage,
    sectionCounts,
}: Props) {
    return (
        <div className={className}>
            <ResumeBuilderForm
                status={status}
                percentage={percentage}
                sectionCounts={sectionCounts}
            />
        </div>
    );
}
