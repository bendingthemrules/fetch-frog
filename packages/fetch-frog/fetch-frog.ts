import { defu } from 'defu';
import { ofetch, type FetchOptions } from 'ofetch';
import type { LiteFetchClient } from './types/fetch-frog';
import { containsFileOrBlob, fillPath, formdataBodySerializer } from './utils';

/**
 * Create a lite fetch client
 *
 * @example
 * ```ts
 * const liteFetch = createLiteFetchClient<paths>("https://petstore.swagger.io/v2", {});
 * const { data, error } = await liteFetch("/pet", {
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
 */
export function createLiteFetchClient<Paths>(
	baseUrl: string,
	defaults: FetchOptions
): LiteFetchClient<Paths> {
	return (url: string, options: any) => {
		const filledPath = fillPath(baseUrl + url, options.path);

		if (containsFileOrBlob(options.body)) {
			options.body = formdataBodySerializer(options.body);
		}

		const merged = defu(options, defaults);

		return liteFetchCall(filledPath, merged);
	};
}

async function liteFetchCall(
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
