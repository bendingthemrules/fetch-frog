import { useFetch, type UseFetchOptions } from 'nuxt/app';
import { computed, toValue } from 'vue';
import { defu } from 'defu';
import type { UseFetchClient } from './types/use-fetch';
import { fillPath } from './utils';
import { containsFileOrBlob, formdataBodySerializer } from 'fetch-frog/utils';

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
				toValue(baseUrl),
				toValue(fillPath(toValue(url), options.path)),
				toValue(options.method)?.toUpperCase() || 'GET',
			];

			const query = toValue(options.query) as Record<string, string>;
			if (query) {
				const unwrapped: Record<string, string> = {};
				for (const [key, value] of Object.entries(query)) {
					unwrapped[toValue(key)] = toValue(value);
				}
				segments.push(unwrapped);
			}

			// TODO: use a better hash function
			const hash = JSON.stringify(segments);
			options.key = hash;
		}

		const filledPath = computed(() =>
			fillPath(baseUrl + toValue(url), options.path)
		);

		const opts = { ...options };

		if (containsFileOrBlob(opts.body)) {
			opts.body = formdataBodySerializer(opts.body);
		}

		const merged = defu(lazy ? { ...opts, lazy } : opts, defaults);

		return useFetch(filledPath, merged);
	};
}
