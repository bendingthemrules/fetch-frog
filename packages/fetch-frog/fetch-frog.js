import { defu } from 'defu';
import { ofetch } from 'ofetch';
import {
	containsFileOrBlob,
	fillPath,
	formdataBodySerializer,
} from './utils.js';

/**
 * Create a lite fetch client
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
 * 	 console.log(error)
 *   return
 * } else {
 * 	 console.log(data)
 * }
 * ```
 * @template Paths
 * @param {string} baseUrl - The base URL for the API
 * @param {import('ofetch').FetchOptions} defaults - Default fetch options
 * @returns {import('./types/fetch-frog').FetchClient<Paths>} - The fetch client
 */
export function createFetchClient(baseUrl, defaults) {
	return (/** @type {string} */ url, /** @type {any} */ options = {}) => {
		const filledPath = fillPath(baseUrl + url, options.path);

		if (containsFileOrBlob(options.body)) {
			options.body = formdataBodySerializer(options.body);
		}

		const merged = defu(options, defaults);

		return fetchCall(filledPath, merged);
	};
}

/**
 * Internal function to handle the actual fetch call
 * @param {string} url - The URL to fetch
 * @param {import('ofetch').FetchOptions} options - Fetch options
 * @returns {Promise<{ data: any; error: null } | { data: null; error: any }>} - Result object with data or error
 */
async function fetchCall(url, options) {
	try {
		const res = await ofetch(url, options);
		return { data: res, error: null };
	} catch (error) {
		return { data: null, error };
	}
}
