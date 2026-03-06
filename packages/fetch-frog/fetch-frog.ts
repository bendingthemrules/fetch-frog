import { defu } from 'defu';
import { type FetchOptions, ofetch } from 'ofetch';
import { fillPath } from './utils.js';
import type { FetchClient } from './types/fetch-frog.js';

/**
 * Create a fetch frog client
 *
 * @param {string} baseUrl The base URL for the API
 * @param {import('ofetch').FetchOptions} defaults Default fetch options
 *
 * @example
 * ```js
 * const fetchClient = createFetchClient("https://petstore.swagger.io/v2", {});
 * const { data, error } = await fetchClient("/pet", {
 * 	method: "POST",
 * 	body: {
 * 		name: "doggie",
 * 		photoUrls: ["https://example.com"],
 * 	},
 * });
 *
 * if (error) {
 * 	 console.error(error)
 *   return
 * } else {
 * 	 console.info(data)
 * }
 * ```
 */
export function createFetchClient<Paths>(
	baseUrl: string,
	defaults: FetchOptions
): FetchClient<Paths> {
	return (url: string, options: Record<string, any> = {}) => {
		const filledPath = fillPath(baseUrl + url, options.path);

		const merged = defu(options, defaults);

		return fetchCall(filledPath, merged);
	};
}

/**
 * Internal function to handle the actual fetch call
 * @param {string} url The URL to fetch
 * @param {import('ofetch').FetchOptions} options Fetch options
 * @returns {Promise<{ data: any; error: null } | { data: null; error: any }>} Result object with data or error
 */
async function fetchCall(
	url: string,
	options: FetchOptions
): Promise<{ data: any; error: null } | { data: null; error: any }> {
	try {
		const res = await ofetch(url, options);
		return { data: res, error: null };
	} catch (error) {
		return { data: null, error };
	}
}
