# Fetch Frog Svelte

Svelte specific implementation of fetch-frog.

```ts
import { createLiteFetchClient } from '@btr/fetch-frog';
import type { paths } from '$lib/generated/schema';
import { env } from '$env/dynamic/public';
import { auth } from './auth.svelte';
import defu from 'defu';
import { browser } from '$app/environment';

export function createApiClient() {
	return createLiteFetchClient<paths>(
		`${browser ? env.PUBLIC_API_URL : env.PUBLIC_SERVER_API_URL}/api/v1`,
		{
			onRequest: ({ options }) => {
				const headers = new Headers(options.headers);

				if (auth.accessToken) {
					headers.set('Authorization', `Bearer ${auth.accessToken}`);
				}

				options.headers = headers;
			}
		}
	);
}

export const apiClient = createApiClient();
```
