import { describe, it, expect, vi, test } from 'vitest';
import { createReactiveApi, type LoadingState } from './use-fetch.svelte.js';
import { flushSync } from 'svelte';

describe('createReactiveApi', () => {
	it('sets success state and data when promise resolves', async () => {
		await new Promise<void>((resolve) => {
			const stop = $effect.root(() => {
				(async () => {
					const spy = vi.fn(async () => ({ data: 123, error: null }));
					const api = createReactiveApi(spy, { immediate: false, watch: false });

					// initial
					expect(api.status).toBe<'loading' | LoadingState>('loading');
					expect(api.data).toBeNull();
					expect(api.error).toBeNull();

					await api.refresh();

					expect(spy).toHaveBeenCalledTimes(1);
					expect(api.status).toBe<'success' | LoadingState>('success');
					expect(api.data).toBe(123);
					expect(api.error).toBeNull();

					stop();
					resolve();
				})();
			});
		});
	});

	it('sets error state when promise yields an error result', async () => {
		await new Promise<void>((resolve) => {
			const stop = $effect.root(() => {
				(async () => {
					const err = new Error('boom');
					const spy = vi.fn(async () => ({ data: null, error: err }));
					const api = createReactiveApi(spy, { immediate: false, watch: false });

					await api.refresh();

					expect(spy).toHaveBeenCalledTimes(1);
					expect(api.status).toBe<'error' | LoadingState>('error');
					expect(api.data).toBeNull();
					expect(api.error).toBe(err);

					stop();
					resolve();
				})();
			});
		});
	});

	it('refresh triggers subsequent calls', async () => {
		await new Promise<void>((resolve) => {
			const stop = $effect.root(() => {
				(async () => {
					const spy = vi.fn(async () => ({ data: 'ok', error: null }));
					const api = createReactiveApi(spy, { immediate: false, watch: false });

					await api.refresh();
					await api.refresh();

					expect(spy).toHaveBeenCalledTimes(2);
					expect(api.status).toBe<'success' | LoadingState>('success');
					expect(api.data).toBe('ok');

					stop();
					resolve();
				})();
			});
		});
	});

	it('updates data reference on subsequent refresh', async () => {
		await new Promise<void>((resolve) => {
			const stop = $effect.root(() => {
				async function run() {
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

					stop();
					resolve();
				}
				run();
			});
		});
	});

	it('thenable resolves with the API facade', async () => {
		await new Promise<void>((resolve) => {
			const stop = $effect.root(() => {
				(async () => {
					const spy = vi.fn(async () => ({ data: 42, error: null }));
					const api = createReactiveApi(spy, { immediate: false, watch: false });

					const value = await (api as unknown as Promise<{
						data: number | null;
						error: unknown;
						status: LoadingState;
						refresh: () => Promise<void>;
					}>);

					expect(value.status).toBe<'success' | LoadingState>('success');
					expect(value.data).toBe(42);
					expect(value.error).toBeNull();

					stop();
					resolve();
				})();
			});
		});
	});
});

test('should watch for changes', async () => {
	await new Promise<void>((resolve) => {
		const stop = $effect.root(() => {
			async function run() {
				let count = $state(1);

				const spy = vi.fn(async ({ count }) => ({ data: count, error: null }));
				const api = await createReactiveApi(() => spy({ count }));
				const { data, error } = $derived(api);

				expect(data).toBe(1);
				expect(error).toBeNull();

				count = 2;
				flushSync();
				await new Promise((resolve) => setTimeout(resolve, 0));

				expect(data).toBe(2);

				stop();
				resolve();
			}
			run();
		});
	});
});
