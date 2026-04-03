/**
 * Turn an object into FormData while keeping its object type
 * @template {Record<string, any>} T
 * @param {T} [body] The object to convert to FormData
 * @returns {T} FormData cast to the original type
 */
export function formdataBodySerializer<T extends Record<string, any>>(body?: T): T {
	const formData = new FormData();

	if (!body) return formData as unknown as T;

	for (const [k, v] of Object.entries(body)) {
		if (Array.isArray(v)) {
			for (const item of v) {
				formData.append(k, item);
			}
			continue;
		}

		formData.append(k, v);
	}

	// @ts-expect-error type tomfoolery
	return formData;
}

/**
 * Checks if an object contains a file or a blob
 * Skips objects already transformed into FormData
 * @param {Record<string, any> | FormData} [body] The object to check
 */
export function containsFileOrBlob(body: Record<string, any> | FormData) {
	if (!body) return false;
	if (body instanceof FormData) return false;

	for (const v of Object.values(body)) {
		if (v instanceof File || v instanceof Blob) return true;

		if (typeof v === 'object' && containsFileOrBlob(v)) return true;

		// no need to check for arrays, they are handled by Object.values
	}

	return false;
}

/**
 * Fill a path with parameters
 * @param {string} path The path template with {param} placeholders
 * @param {Record<string, unknown>} [params] Parameters to fill
 */
export function fillPath(path: string, params = {} as Record<string, unknown>) {
	for (const [k, v] of Object.entries(params))
		path = path.replaceAll(`{${k}}`, encodeURIComponent(String(v)));
	return path;
}
