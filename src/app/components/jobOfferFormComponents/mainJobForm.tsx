'use client';

import ResumeBuilderForm from './resumeBuilderForm';

interface Props {
    className: string;
}
export default function MainJobForm({ className }: Props) {
    return (
        <div className={className}>
            <ResumeBuilderForm />
        </div>
    );
}
