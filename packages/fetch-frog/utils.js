/**
 * Turn an object into FormData while keeping its object type
 * @template {Record<string, any>} T
 * @param {T} [body] - The object to convert to FormData
 * @returns {T} - FormData cast to the original type
 */
export function formdataBodySerializer(body) {
	const formData = new FormData();

	if (!body) return /** @type {T} */ (/** @type {unknown} */ (formData));

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

	// @ts-expect-error type tomfoolery
	return formData;
}

/**
 * Check if an object contains a file or a blob
 * If it was already transformed into FormData, skip
 * @param {Record<string, any> | FormData} [body] - The object to check
 * @returns {boolean} - True if contains File or Blob
 */
export function containsFileOrBlob(body) {
	if (!body) return false;
	if (body instanceof FormData) return false;

	for (const v of Object.values(body)) {
		if (v instanceof File || v instanceof Blob) return true;

		if (typeof v === 'object' && containsFileOrBlob(v)) return true;

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
 * @param {string} path - The path template with {param} placeholders
 * @param {Record<string, unknown>} [params] - Parameters to fill
 * @returns {string} - Path with parameters filled
 */
export function fillPath(path, params = {}) {
	for (const [k, v] of Object.entries(params))
		path = path.replace(`{${k}}`, encodeURIComponent(String(v)));
	return path;
}
