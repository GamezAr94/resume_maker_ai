'use client';

import ResumeBuilderForm from './resumeBuilderForm';

interface Props {
    className: string;
    status: 'disabled' | 'warn' | 'ready';
}

export default function MainJobForm({ className, status }: Props) {
    return (
        <div className={className}>
            <ResumeBuilderForm status={status} />
        </div>
    );
}
