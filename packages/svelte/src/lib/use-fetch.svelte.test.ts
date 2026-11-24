import { describe, expect, vi } from 'vitest';
import { createReactiveApi, type LoadingState } from './use-fetch.svelte.js';
import { flushSync } from 'svelte';
import { testWithEffect } from '../test/test-utils.svelte.js';

describe('createReactiveApi', () => {
	testWithEffect('sets success state and data when promise resolves', async () => {
		const spy = vi.fn(async () => ({ data: 123, error: null }));
		const api = createReactiveApi(spy, { immediate: false, watch: false });

		expect(api.status).toBe<'idle' | LoadingState>('idle');
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

	for (const [label, body] of [
		['undefined (204 No Content)', undefined],
		['0', 0],
		['false', false],
		['empty string', '']
	] as const) {
		testWithEffect(`treats a falsy body (${label}) as success`, async () => {
			const spy = vi.fn(async () => ({ data: body, error: null }));
			const api = createReactiveApi(spy, { immediate: false, watch: false });

			await api.refresh();

			expect(api.status).toBe<'success' | LoadingState>('success');
			expect(api.data).toBe(body);
			expect(api.error).toBeNull();
		});
	}

	testWithEffect('sets error state when the result carries an error', async () => {
		const err = new Error('boom');
		const spy = vi.fn(async () => ({ data: null, error: err }));
		const api = createReactiveApi(spy, { immediate: false, watch: false });

		await api.refresh();

		expect(api.status).toBe<'error' | LoadingState>('error');
		expect(api.data).toBeNull();
		expect(api.error).toBe(err);
	});

	testWithEffect('a rejected promise sets error state instead of staying loading', async () => {
		const err = new Error('network down');
		const spy = vi.fn(async (): Promise<{ data: string; error: null }> => {
			throw err;
		});
		const api = createReactiveApi(spy, { immediate: false, watch: false });

		await api.refresh();

		expect(api.status).toBe<'error' | LoadingState>('error');
		expect(api.error).toBe(err);
	});

	testWithEffect('a synchronous throw sets error state', async () => {
		const err = new Error('bad input');
		const api = createReactiveApi(
			(): Promise<{ data: string; error: null }> => {
				throw err;
			},
			{ immediate: false, watch: false }
		);

		await api.refresh();

		expect(api.status).toBe<'error' | LoadingState>('error');
		expect(api.error).toBe(err);
	});

	testWithEffect('awaiting resolves with the error state when the request throws', async () => {
		const err = new Error('boom');
		const { status, error } = await createReactiveApi(
			async (): Promise<{ data: string; error: null }> => {
				throw err;
			},
			{ watch: false }
		);

		expect(status).toBe<'error' | LoadingState>('error');
		expect(error).toBe(err);
	});

	testWithEffect('a slow older response does not overwrite a newer one', async () => {
		const resolvers: ((value: { data: string; error: null }) => void)[] = [];
		const spy = vi.fn(
			() => new Promise<{ data: string; error: null }>((resolve) => resolvers.push(resolve))
		);
		const api = createReactiveApi(spy, { immediate: false, watch: false });

		const first = api.refresh();
		const second = api.refresh();

		resolvers[1]({ data: 'new', error: null });
		await second;
		expect(api.data).toBe('new');

		resolvers[0]({ data: 'old', error: null });
		await first;
		expect(api.data).toBe('new');
		expect(api.status).toBe<'success' | LoadingState>('success');
	});

	testWithEffect('refresh resolves only once a newer fetch has settled', async () => {
		const resolvers: ((value: { data: string; error: null }) => void)[] = [];
		const spy = vi.fn(
			() => new Promise<{ data: string; error: null }>((resolve) => resolvers.push(resolve))
		);
		const api = createReactiveApi(spy, { immediate: false, watch: false });

		let firstDone = false;
		const first = api.refresh().then(() => (firstDone = true));
		void api.refresh();

		resolvers[0]({ data: 'old', error: null });
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(firstDone).toBe(false);

		resolvers[1]({ data: 'new', error: null });
		await first;
		expect(api.data).toBe('new');
	});

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

	testWithEffect('immediate: true should fetch on creation', async () => {
		const spy = vi.fn(async () => ({ data: 'hello', error: null }));
		const api = await createReactiveApi(spy, { immediate: true });

		expect(spy).toHaveBeenCalledTimes(1);
		expect(api.status).toBe('success');
		expect(api.data).toBe('hello');
	});

	testWithEffect('immediate: true should re-fetch when watched deps change', async () => {
		let count = $state(1);

		const spy = vi.fn(async () => ({ data: count, error: null }));
		const api = await createReactiveApi(() => spy(), { immediate: true });

		expect(spy).toHaveBeenCalledTimes(1);
		expect(api.data).toBe(1);

		count = 2;
		flushSync();
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(spy).toHaveBeenCalledTimes(2);
		expect(api.data).toBe(2);
	});

	testWithEffect('immediate: false should not fetch on creation', async () => {
		const spy = vi.fn(async () => ({ data: 'hello', error: null }));
		const api = createReactiveApi(spy, { immediate: false });

		expect(spy).not.toHaveBeenCalled();
		expect(api.data).toBeNull();
		expect(api.error).toBeNull();
	});

	testWithEffect('immediate: false should have idle status before first fetch', async () => {
		const spy = vi.fn(async () => ({ data: 'hello', error: null }));
		const api = createReactiveApi(spy, { immediate: false });

		expect(api.status).toBe('idle');

		await api.refresh();

		expect(api.status).toBe('success');
	});

	testWithEffect(
		'immediate: false should not auto-fetch when watched deps change before manual refresh',
		async () => {
			let count = $state(1);

			const spy = vi.fn(async () => ({ data: count, error: null }));
			const api = createReactiveApi(() => spy(), { immediate: false });

			expect(spy).not.toHaveBeenCalled();

			// change a watched dep before any manual refresh
			count = 2;
			flushSync();
			await new Promise((resolve) => setTimeout(resolve, 0));

			// should still not have fetched — user hasn't called refresh() yet
			expect(spy).not.toHaveBeenCalled();
		}
	);

	testWithEffect('immediate: false should allow watch after first manual refresh', async () => {
		let count = $state(1);

		const spy = vi.fn(async () => ({ data: count, error: null }));
		const api = createReactiveApi(() => spy(), { immediate: false, watch: true });

		expect(spy).not.toHaveBeenCalled();

		// manually trigger the first fetch
		await api.refresh();
		expect(api.data).toBe(1);

		// let the effect settle after activation
		await new Promise((resolve) => setTimeout(resolve, 0));
		spy.mockClear();

		// now change a watched dep — should trigger a re-fetch
		count = 2;
		flushSync();
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(spy).toHaveBeenCalledTimes(1);
		expect(api.data).toBe(2);
	});
});
