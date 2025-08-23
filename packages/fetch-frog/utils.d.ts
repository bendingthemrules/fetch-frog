/**
 * Turn an object into FormData while keeping its object type
 */
export function formdataBodySerializer<T extends Record<string, any>>(
	body?: T
): T;

/**
 * Check if an object contains a file or a blob
 * If it was already transformed into FormData, skip
 */
export function containsFileOrBlob(
	body?: Record<string, any> | FormData
): boolean;

/**
 * Fill a path with parameters
 */
export function fillPath(
	path: string,
	params?: Record<string, unknown>
): string;
