import type { FetchOptions } from 'ofetch';
import type { fetchClient } from './types/fetch-frog';

/**
 * Create a lite fetch client
 */
export function createFetchClient<Paths>(
	baseUrl: string,
	defaults: FetchOptions
): fetchClient<Paths>;
