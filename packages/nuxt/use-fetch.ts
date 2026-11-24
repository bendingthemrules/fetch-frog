import { useFetch, type UseFetchOptions } from 'nuxt/app';
import { computed, toValue } from 'vue';
import { defu } from 'defu';
import type { UseFetchClient, UseFetchClientDefaults } from './types/use-fetch';
import { fillPath, unwrapDeep } from './utils';

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
	defaults: UseFetchClientDefaults,
	lazy?: Lazy
): UseFetchClient<Paths, Lazy> {
	return (url: string | (() => string), options: any) => {
		const filledPath = computed(() => fillPath(baseUrl + toValue(url), options.path));

		const { bodySerializer, ...merged } = defu(lazy ? { ...options, lazy } : options, defaults);

		// Serialize inside a computed so a reactive body still triggers a refetch,
		// and Nuxt builds its cache key from the serialized body.
		if (bodySerializer && merged.body !== undefined) {
			const body = merged.body;
			merged.body = computed(() => bodySerializer(unwrapDeep(body)));
		}

		return useFetch(filledPath, merged as UseFetchOptions<any>);
	};
}
