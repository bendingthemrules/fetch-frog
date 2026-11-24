/**
 * Turns a typed request body into something `fetch` can send.
 *
 * The body stays fully typed until the moment the request is made, so
 * serializers can be passed as `bodySerializer` without casting.
 */
export type BodySerializer<Body = any> = (body: Body) => BodyInit;

type Entry = [key: string, value: string | Blob];

/**
 * Whether a value should be walked into (plain objects and arrays),
 * as opposed to being treated as a single leaf value.
 */
function isContainer(value: unknown): value is object {
	return (
		value !== null &&
		typeof value === 'object' &&
		!(value instanceof Blob) &&
		!(value instanceof Date)
	);
}

/**
 * Flatten a body into key/value entries.
 *
 * - nested objects use dot keys: `user.name`
 * - arrays of primitives or files repeat the key: `tags=a&tags=b`
 * - arrays of objects are indexed: `items[0].name`
 * - `undefined` and `null` are skipped
 * - dates become ISO strings, blobs and files are kept as-is
 */
function flatten(value: unknown, key: string, out: Entry[]): Entry[] {
	if (value === undefined || value === null) return out;

	if (value instanceof Blob) {
		out.push([key, value]);
	} else if (value instanceof Date) {
		out.push([key, value.toISOString()]);
	} else if (Array.isArray(value)) {
		value.forEach((item, i) => flatten(item, isContainer(item) ? `${key}[${i}]` : key, out));
	} else if (typeof value === 'object') {
		for (const [k, v] of Object.entries(value)) flatten(v, key ? `${key}.${k}` : k, out);
	} else {
		out.push([key, String(value)]);
	}

	return out;
}

/**
 * Serialize a body as `multipart/form-data`.
 * Use it for endpoints that accept file uploads.
 *
 * @example
 * ```ts
 * await client('/pet/{petId}/uploadImage', {
 * 	method: 'POST',
 * 	path: { petId: 1 },
 * 	body: { name: 'frog', file },
 * 	bodySerializer: formdataSerializer
 * });
 * ```
 */
export function formdataSerializer<T extends object>(body: T): FormData {
	if (body instanceof FormData) return body;

	const formData = new FormData();
	for (const [key, value] of flatten(body, '', [])) formData.append(key, value);
	return formData;
}

/**
 * Serialize a body as `application/x-www-form-urlencoded`.
 * Uses the same key rules as {@link formdataSerializer}, but cannot hold files.
 */
export function urlencodedSerializer<T extends object>(body: T): URLSearchParams {
	if (body instanceof URLSearchParams) return body;

	const params = new URLSearchParams();
	for (const [key, value] of flatten(body, '', [])) {
		if (typeof value !== 'string') {
			throw new TypeError(
				`Cannot send a Blob or File as application/x-www-form-urlencoded (at "${key}"). Use formdataSerializer instead.`
			);
		}
		params.append(key, value);
	}
	return params;
}

/**
 * Serialize a body as JSON. This is already the default, so it is only
 * needed to override a client-wide `bodySerializer` for a single request.
 */
export function jsonSerializer<T>(body: T): string {
	return JSON.stringify(body);
}
