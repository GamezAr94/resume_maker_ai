import { SectionTypes } from '@/utils/enums';

/**
 * A reusable client-side function to call the DELETE API endpoint for any profile section.
 * It handles the fetch request, error handling, and notifications.
 *
 * @param section The section/table name (e.g., 'experience', 'skill').
 * @param id The ID of the record to delete.
 * @returns A promise that resolves to true if successful, false otherwise.
 */
export async function deleteProfileRecord(
    section: SectionTypes,
    id: string,
): Promise<boolean> {
    try {
        const response = await fetch(`/api/profile/${section}/${id}`, {
            method: 'DELETE',
        });

        // Handle HTTP errors (e.g., 404, 500) from the server
        if (!response.ok) {
            const result = await response.json();
            // Throw an error to be caught by the catch block
            throw new Error(
                result.message || 'An error occurred during deletion.',
            );
        }

        // If we reach here, the deletion was successful.
        return true;
    } catch (error) {
        throw error;
    }
}
