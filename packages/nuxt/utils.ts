import { toValue, type MaybeRef } from 'vue';

/**
 * Fill a path with reactive parameters
 */
export function fillPath(
	path: string,
	params: MaybeRef<Record<string, unknown>> = {}
) {
	for (const [k, v] of Object.entries(toValue(params)))
		path = path.replace(`{${k}}`, encodeURIComponent(String(toValue(v))));
	return path;
}
