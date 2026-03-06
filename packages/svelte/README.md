# Fetch Frog Svelte

Svelte specific implementation of [fetch-frog](https://github.com/bendingthemrules/fetch-frog).

```ts
import { createFetchClient } from 'fetch-frog';
import type { paths } from '$lib/generated/schema';
import { env } from '$env/dynamic/public';
import { auth } from './auth.svelte';

export function createApiClient() {
	return createFetchClient<paths>(env.PUBLIC_API_URL, {
		onRequest: ({ options }) => {
			const headers = new Headers(options.headers);

			if (auth.accessToken) {
				headers.set('Authorization', `Bearer ${auth.accessToken}`);
			}

			options.headers = headers;
		}
	});
}

export const apiClient = createApiClient();
```

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/apiClient';

	let page = $state(1);

	const reactiveApi = createReactiveApi(
		async () =>
			await apiClient('/pet/{petId}', {
				path: {
					petId: 'frog'
				},
				query: {
					page
				}
			})
	);

	onMount(async () => {
		const { data } = await apiClient('/pet/{petId}', {
			path: {
				petId: 1
			}
		});
	});
</script>

<button onclick={() => page++}>Next</button>
```
