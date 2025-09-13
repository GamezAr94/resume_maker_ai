import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm'; // Import the client component

export default function ResetPasswordPage() {
    return (
        // The Suspense boundary is here, in the Server Component parent
        <Suspense fallback={<p>Loading page...</p>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
