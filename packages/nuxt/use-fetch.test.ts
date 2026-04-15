// @vitest-environment nuxt
import { afterEach, describe, expect, test } from 'vitest';
import { ref, nextTick } from 'vue';
import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { createUseFetchClient } from './index';

describe('createUseFetchClient', () => {
	const cleanups: (() => void)[] = [];
	function register(...args: Parameters<typeof registerEndpoint>) {
		cleanups.push(registerEndpoint(...args));
	}
	afterEach(() => {
		while (cleanups.length) cleanups.pop()!();
	});

	test('basic fetch populates data', async () => {
		register('/ping', () => ({ message: 'pong' }));

		const client = createUseFetchClient<{ '/ping': { get: unknown } }>('', {});
		const { data, error } = await client('/ping', {});

		expect(error.value).toBeNull();
		expect(data.value).toEqual({ message: 'pong' });
	});

	test('immediate: false skips initial fetch until refresh()', async () => {
		let hits = 0;
		register('/manual', () => {
			hits++;
			return { count: hits };
		});

		const client = createUseFetchClient<{ '/manual': { get: unknown } }>('', {});
		const result = client('/manual', { immediate: false });

		// flush a tick so any stray scheduling would have had a chance to run
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(hits).toBe(0);
		expect(result.data.value).toBeNull();

		await result.refresh();

		expect(hits).toBe(1);
		expect(result.data.value).toEqual({ count: 1 });
	});

	test('reactive path params trigger a re-fetch when changed', async () => {
		const hits: string[] = [];
		register('/pet/1', () => {
			hits.push('1');
			return { id: 1 };
		});
		register('/pet/2', () => {
			hits.push('2');
			return { id: 2 };
		});

		type Paths = {
			'/pet/{petId}': {
				get: { parameters: { path: { petId: number } } };
			};
		};

		const petId = ref(1);
		const client = createUseFetchClient<Paths>('', {});
		const result = await client('/pet/{petId}', { path: { petId } });

		expect(hits).toEqual(['1']);
		expect(result.data.value).toEqual({ id: 1 });

		petId.value = 2;
		await nextTick();
		// watchers in useFetch debounce to a microtask; give them one more tick
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(hits).toEqual(['1', '2']);
		expect(result.data.value).toEqual({ id: 2 });
	});
});
