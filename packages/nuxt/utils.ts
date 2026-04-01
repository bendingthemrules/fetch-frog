import { toValue, type MaybeRef } from 'vue';

/**
 * Turn an object into FormData while keeping its object type
 */
export function formdataBodySerializer<T extends Record<string, any>>(body?: T): T {
	const formData = new FormData();

	if (!body) return formData as unknown as T;

	for (const [k, maybeRefValue] of Object.entries(body)) {
		const v = toValue(maybeRefValue);

		if (Array.isArray(v)) {
			for (const item of v) {
				formData.append(k, toValue(item));
			}
			continue;
		}

		formData.append(k, toValue(v));
	}

	// @ts-expect-error type tomfoolery
	return formData;
}

/**
 * Check if an object contains a file or a blob
 * If it was already transformed into FormData, skip
 */
export function containsFileOrBlob(body?: Record<string, any> | FormData): boolean {
	if (!body) return false;
	if (body instanceof FormData) return false;

	for (const maybeRefValue of Object.values(body)) {
		const v = toValue(maybeRefValue);

		if (v instanceof File || v instanceof Blob) return true;

		if (typeof v === 'object' && containsFileOrBlob(v)) return true;

		if (Array.isArray(v) && v.some((item) => item instanceof File || item instanceof Blob))
			return true;
	}

	return false;
}

/**
 * Fill a path with reactive parameters
 */
export function fillPath(path: string, params: MaybeRef<Record<string, unknown>> = {}) {
	for (const [k, v] of Object.entries(toValue(params)))
		path = path.replaceAll(`{${k}}`, encodeURIComponent(String(toValue(v))));
	return path;
}
