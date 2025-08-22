/**
 * Turn an object into FormData while keeping its object type
 */
export function formdataBodySerializer<T extends Record<string, any>>(
	body?: T
): T {
	const formData = new FormData();

	if (!body) return formData as unknown as T;

	// TODO: handle nested objects

	for (const [k, v] of Object.entries(body)) {
		if (Array.isArray(v)) {
			for (const item of v) {
				formData.append(k, item);
			}
			continue;
		}

		formData.append(k, v);
	}

	// @ts-expect-error typescript tomfoolery
	return formData;
}

/**
 * Check if an object contains a file or a blob
 * If it was already transformed into FormData, skip
 */
export function containsFileOrBlob(
	body?: Record<string, any> | FormData
): boolean {
	if (!body) return false;
	if (body instanceof FormData) return false;

	for (const v of Object.values(body)) {
		if (v instanceof File || v instanceof Blob) return true;

		if (typeof v === "object" && containsFileOrBlob(v)) return true;

		if (
			Array.isArray(v) &&
			v.some((item) => item instanceof File || item instanceof Blob)
		)
			return true;
	}

	return false;
}

/**
 * Fill a path with parameters
 */
export function fillPath(path: string, params: Record<string, unknown> = {}) {
	for (const [k, v] of Object.entries(params))
		path = path.replace(`{${k}}`, encodeURIComponent(String(v)));
	return path;
}
