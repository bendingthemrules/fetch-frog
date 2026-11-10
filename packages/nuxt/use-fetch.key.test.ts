// @vitest-environment nuxt
import { afterEach, describe, expect, test, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { createUseFetchClient } from './index';

type Paths = {
	'/k/pet/{petId}': { get: { parameters: { path: { petId: number } } } };
	'/k/echo': { post: { requestBody: { content: { 'application/json': { n: number } } } } };
};

describe('createUseFetchClient cache keys', () => {
	const cleanups: (() => void)[] = [];
	afterEach(() => {
		while (cleanups.length) cleanups.pop()!();
	});

	test("changing one caller's reactive path param does not change another caller's data", async () => {
		cleanups.push(registerEndpoint('/k/pet/1', () => ({ id: 1 })));
		cleanups.push(registerEndpoint('/k/pet/2', () => ({ id: 2 })));
		const client = createUseFetchClient<Paths>('', {});
		const petId = ref(1);
		const a = await client('/k/pet/{petId}', { path: { petId } });
		const b = await client('/k/pet/{petId}', { path: { petId: 1 } });
		expect(b.data.value).toEqual({ id: 1 });
		petId.value = 2;
		await vi.waitFor(() => expect(a.data.value).toEqual({ id: 2 }));
		await nextTick();
		expect(b.data.value).toEqual({ id: 1 });
	});

	test('POSTs with different bodies get their own data', async () => {
		let hits = 0;
		cleanups.push(
			registerEndpoint('/k/echo', { method: 'POST', handler: () => ({ hit: ++hits }) })
		);
		const client = createUseFetchClient<Paths>('', {});
		const a = await client('/k/echo', { method: 'POST', body: { n: 1 } });
		const b = await client('/k/echo', { method: 'POST', body: { n: 2 } });
		expect(hits).toBe(2);
		expect(a.data.value).toEqual({ hit: 1 });
		expect(b.data.value).toEqual({ hit: 2 });
	});

	test("does not mutate the caller's options object", async () => {
		cleanups.push(registerEndpoint('/k/pet/1', () => ({ id: 1 })));
		const client = createUseFetchClient<Paths>('', {});
		const options = { path: { petId: 1 } };
		await client('/k/pet/{petId}', options);
		expect(options).not.toHaveProperty('key');
	});
});
