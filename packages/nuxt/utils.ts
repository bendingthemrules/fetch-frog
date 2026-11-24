import { toValue, unref, type MaybeRef } from 'vue';

/**
 * Resolve a possibly reactive request body into plain data.
 * The body itself may be a ref or getter; values nested inside it may be refs.
 */
export function unwrapDeep(value: unknown): unknown {
	return unwrapNested(toValue(value));
}

function unwrapNested(value: unknown): unknown {
	const v = unref(value);
	if (Array.isArray(v)) return v.map(unwrapNested);
	if (isPlainObject(v)) {
		return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, unwrapNested(x)]));
	}
	return v;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (value === null || typeof value !== 'object') return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}

/**
 * Fill a path with reactive parameters
 */
export function fillPath(path: string, params: MaybeRef<Record<string, unknown>> = {}) {
	for (const [k, v] of Object.entries(toValue(params)))
		path = path.replaceAll(`{${k}}`, encodeURIComponent(String(toValue(v))));
	return path;
}
