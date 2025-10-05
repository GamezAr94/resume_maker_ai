import { redirect } from 'next/navigation';
import { NetworkingLink } from './interfaces';

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
    type: 'error' | 'success',
    path: string,
    message: string,
) {
    return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

/**
 * A generic object structure that our function can sort.
 * It must have an 'id' and can have any other properties.
 */
interface SortableItem {
    id: string;
    [key: string]: string; // This index signature allows for any other properties.
}

/**
 * Defines the shape of the priority map, which converts string keys to numeric ranks.
 * Example: { high: 0, medium: 1, low: 2 }
 */
type PriorityMap = Record<string, number>;

/**
 * Normalizes layout data into an array and sorts it based on a priority map.
 * This function is side-effect-free; it does not mutate the original input array.
 *
 * @template T - The specific type of the items in the array (e.g., ResumeLayoutItem).
 * @param layoutData - The data to process. Can be an object-of-objects, an array, null, or undefined.
 * @param priorityMap - An object mapping priority strings to numbers for sorting.
 * @param priorityKey - The property name within each item that holds the priority value (e.g., "priority").
 * @returns {T[]} A new, sorted array of layout items.
 */
export function ensureLayoutIsOrderedArray<T extends SortableItem>(
    layoutData: Record<string, Omit<T, 'id'>> | T[] | null | undefined,
    priorityMap: PriorityMap,
    priorityKey: keyof T,
): T[] {
    // --- KEY CHANGE HERE ---
    // Case 1: Input is already an array.
    // This means it's a user-saved, intentionally ordered list.
    // Return it directly without any modification.
    if (Array.isArray(layoutData)) {
        return layoutData;
    }

    // Case 2: Input is an object.
    // This means it's the initial, unsorted response from Gemini.
    // We need to convert it to an array AND apply the default sorting logic.
    if (typeof layoutData === 'object' && layoutData !== null) {
        // Convert the object to an array of items.
        const normalizedArray = Object.keys(layoutData).map((key) => {
            return { id: key, ...layoutData[key] } as T;
        });

        const defaultPriority = Object.keys(priorityMap).length;

        // Apply the default sort.
        normalizedArray.sort((a, b) => {
            const priorityValueA = a[priorityKey];
            const priorityValueB = b[priorityKey];

            // It checks if the values are strings
            // before trying to use them as keys for the priorityMap.
            if (
                typeof priorityValueA === 'string' &&
                typeof priorityValueB === 'string'
            ) {
                const numericPriorityA =
                    priorityMap[priorityValueA] ?? defaultPriority;
                const numericPriorityB =
                    priorityMap[priorityValueB] ?? defaultPriority;
                return numericPriorityA - numericPriorityB;
            }

            // If the values aren't strings, don't try to sort them.
            return 0;
        });

        return normalizedArray;
    }

    // Case 3: Input is null, undefined, or invalid.
    // Return an empty array to ensure the rest of the app doesn't break.
    console.warn('Layout data was null or invalid; returning an empty array.');
    return [];
}

const LINKEDIN_BASE_URL =
    'https://www.linkedin.com/search/results/people/?keywords=';

export function generateNetworkingLinks(
    companyName: string,
    jobTitle: string,
): NetworkingLink[] {
    const encodedCompany = encodeURIComponent(companyName);

    // Basic templates - you can make these more sophisticated later
    const recruiterQuery = `("Technical Recruiter" OR "Talent Acquisition OR Recruiter") AND "${companyName}"`;
    const managerQuery = `("Engineering Manager" OR "Hiring Manager" OR "${jobTitle} Manager OR Manager") AND "${companyName}"`;
    const teammateQuery = `("${jobTitle}") AND "${companyName}"`;

    return [
        {
            label: `Find Recruiters at ${companyName}`,
            url: `${LINKEDIN_BASE_URL}${encodeURIComponent(recruiterQuery)}`,
        },
        {
            label: `Find Hiring Managers at ${companyName}`,
            url: `${LINKEDIN_BASE_URL}${encodeURIComponent(managerQuery)}`,
        },
        {
            label: `Find Potential Teammates at ${companyName}`,
            url: `${LINKEDIN_BASE_URL}${encodeURIComponent(teammateQuery)}`,
        },
    ];
}
