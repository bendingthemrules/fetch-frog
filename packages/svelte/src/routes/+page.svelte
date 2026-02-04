<script lang="ts">
	import { createFetchClient } from 'fetch-frog';
	import { createReactiveApi } from '$lib/use-fetch.svelte.js';
	import type { paths } from '$lib/petstore.ts';
	import { onMount } from 'svelte';

	const apiClient = createFetchClient<paths>('', {});

	// const _useApiClient = createReactiveApi(() =>
	// 	apiClient('/pet/{petId}', {
	// 		path: {
	// 			petId: 1
	// 		}
	// 	})
	// );

	async function mockCall({ count }: { count: number }) {
		await new Promise((resolve) => setTimeout(resolve, 100));
		return { data: count, error: null };
	}

	let count = $state(1);

	const api = createReactiveApi(() => mockCall({ count }));
	const { data, error } = $derived(api);

	onMount(async () => {
		const { data } = await apiClient('/pet/{petId}', {
			path: {
				petId: 1
			}
		});
		console.info('mount data', data);
	});
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<button onclick={() => count++}>Increment</button>

<pre>
count: {JSON.stringify(count, null, 2)}
data: {JSON.stringify(data, null, 2)}
error: {JSON.stringify(error, null, 2)}
</pre>
