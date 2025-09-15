import { describe, expect, vi } from 'vitest';
import { createReactiveApi, type LoadingState } from './use-fetch.svelte.js';
import { flushSync } from 'svelte';
import { testWithEffect } from './test-utils.svelte.js';

describe('createReactiveApi', () => {
	testWithEffect('sets success state and data when promise resolves', async () => {
		const spy = vi.fn(async () => ({ data: 123, error: null }));
		const api = createReactiveApi(spy, { immediate: false });

		expect(api.status).toBe<'loading' | LoadingState>('loading');
		expect(api.data).toBeNull();
		expect(api.error).toBeNull();

		await api.refresh();

		expect(spy).toHaveBeenCalledTimes(1);
		expect(api.status).toBe('success');
		expect(api.data).toBe(123);
		expect(api.error).toBeNull();
	});

	// TODO: make this test throw an error properly
	// testWithEffect('sets error state when promise yields an error result', async () => {
	// 	const err = new Error('boom');
	// 	const spy = vi.fn(async () => ({ data: null, error: err }));
	// 	const api = await createReactiveApi(spy);

	// 	// TODO: check why this isn't 1
	// 	expect(spy).toHaveBeenCalledTimes(2);
	// 	expect(api.status).toBe<'error' | LoadingState>('error');
	// 	expect(api.data).toBeNull();
	// 	expect(api.error).toBe(err);
	// });

	testWithEffect('refresh triggers subsequent calls', async () => {
		const spy = vi.fn(async () => ({ data: 'ok', error: null }));
		const api = createReactiveApi(spy, { immediate: false, watch: false });

		await api.refresh();
		await api.refresh();

		expect(spy).toHaveBeenCalledTimes(2);
		expect(api.status).toBe<'success' | LoadingState>('success');
		expect(api.data).toBe('ok');
	});

	testWithEffect('updates data reference on subsequent refresh', async () => {
		const spy = vi
			.fn()
			.mockResolvedValueOnce({ data: { count: 1 }, error: null })
			.mockResolvedValueOnce({
				data: { count: 10 },
				error: null
			}) as unknown as () => Promise<{ data: { count: number }; error: null }>;

		const api = (await createReactiveApi(spy, { watch: false })) as unknown as {
			data: { count: number };
			error: null;
			refresh: () => void;
		};

		expect(api.data.count).toBe(1);

		await api.refresh();

		expect(api.data.count).toBe(10);
	});

	testWithEffect('thenable resolves with the API facade', async () => {
		const spy = vi.fn(async () => ({ data: 42, error: null }));
		const { status, data, error } = await createReactiveApi(spy);

		expect(status).toBe<'success' | LoadingState>('success');
		expect(data).toBe(42);
		expect(error).toBeNull();
	});

	testWithEffect('should watch for changes', async () => {
		let count = $state(1);

		const spy = vi.fn(async ({ count }) => ({ data: count, error: null }));
		const api = await createReactiveApi(() => spy({ count }));
		const { data, error } = $derived(api);

		expect(data).toBe(1);
		expect(error).toBeNull();

		count = 2;
		flushSync();
		await new Promise((resolve) => setTimeout(resolve, 0)); // wait for the api to update

		expect(data).toBe(2);
	});
});
