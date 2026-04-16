import { toValue, type MaybeRef } from 'vue';

/**
 * Turn an object into FormData while keeping its object type
 */
export function formdataBodySerializer<T extends Record<string, any>>(body?: T): T {
	const formData = new FormData();

	if (!body) return formData as unknown as T;

	function append(obj: Record<string, any>, prefix?: string) {
		for (const [k, maybeRefValue] of Object.entries(obj)) {
			const v = toValue(maybeRefValue);
			const key = prefix ? `${prefix}.${k}` : k;

			if (Array.isArray(v)) {
				for (const item of v) {
					formData.append(key, toValue(item));
				}
			} else if (
				v !== null &&
				typeof v === 'object' &&
				!(v instanceof File) &&
				!(v instanceof Blob)
			) {
				append(v, key);
			} else {
				formData.append(key, toValue(v));
			}
		}
	}

	append(body);

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

		if (v !== null && typeof v === 'object' && containsFileOrBlob(v)) return true;

		// no need to check for arrays, they are handled by Object.values
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
