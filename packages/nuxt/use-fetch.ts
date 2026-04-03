import { useFetch, type UseFetchOptions } from 'nuxt/app';
import { computed, toValue } from 'vue';
import { defu } from 'defu';
import type { UseFetchClient } from './types/use-fetch';
import { fillPath } from './utils';

/**
 * Create a reactive fetch client
 *
 * @example
 * ```ts
 * const fetchClient = createUseFetchClient<paths>("https://petstore.swagger.io/v2", {});
 * const { data, error } = fetchClient("/pet", {
 * 	method: "POST",
 * 	body: {
 * 		name: "doggie",
 * 		photoUrls: ["https://example.com"],
 * 	},
 * });
 *
 * if (error.value) {
 * 	 console.log(error.value)
 *   return
 * } else {
 * 	 console.log(data.value)
 * }
 * ```
 */
export function createUseFetchClient<Paths, Lazy extends boolean = boolean>(
	baseUrl: string,
	defaults: UseFetchOptions<any>,
	lazy?: Lazy
): UseFetchClient<Paths, Lazy> {
	return (url: string | (() => string), options: any) => {
		if (!options.key) {
			// generate a key based on baseUrl, urlPath, query and method
			const segments = [
				baseUrl,
				toValue(fillPath(toValue(url), options.path)),
				toValue(options.method)?.toUpperCase() || 'GET'
			];

			const query = toValue(options.query) as Record<string, string>;
			if (query) {
				const params = new URLSearchParams(query);
				params.sort();
				segments.push(params.toString());
			}

			options.key = segments.join('|');
		}

		const filledPath = computed(() => fillPath(baseUrl + toValue(url), options.path));

		const opts = { ...options };

		const merged = defu(lazy ? { ...opts, lazy } : opts, defaults);

		return useFetch(filledPath, merged);
	};
}
