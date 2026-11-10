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
		const filledPath = computed(() => fillPath(baseUrl + toValue(url), options.path));

		const merged = defu(lazy ? { ...options, lazy } : options, defaults);

		return useFetch(filledPath, merged);
	};
}
