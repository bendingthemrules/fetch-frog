// @vitest-environment nuxt
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ref } from 'vue';
import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { readFormData, readRawBody, getRequestHeader } from 'h3';
import { createUseFetchClient, formdataSerializer, urlencodedSerializer } from './index';

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

		expect(error.value).toBeUndefined();
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
		expect(result.data.value).toBeUndefined();

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

		await vi.waitFor(() => {
			expect(hits).toEqual(['1', '2']);
			expect(result.data.value).toEqual({ id: 2 });
		});
	});

	describe('bodySerializer', () => {
		type Paths = {
			'/upload': {
				post: {
					requestBody: {
						content: { 'multipart/form-data': { name: string; file?: Blob } };
					};
				};
			};
		};

		test('sends the body as FormData', async () => {
			let received: [string, string][] = [];
			register('/upload', {
				method: 'POST',
				handler: async (event) => {
					const fd = await readFormData(event);
					received = [...fd.entries()].map(([k, v]) => [
						k,
						typeof v === 'string' ? v : `<file ${(v as File).name}>`
					]);
					return { ok: true };
				}
			});

			const client = createUseFetchClient<Paths>('', {});
			const { error } = await client('/upload', {
				method: 'POST',
				body: { name: 'frog', file: new File(['x'], 'frog.png') },
				bodySerializer: formdataSerializer
			});

			expect(error.value).toBeUndefined();
			expect(received).toEqual([
				['name', 'frog'],
				['file', '<file frog.png>']
			]);
		});

		test('uses the client default and resolves refs inside the body', async () => {
			let contentType: string | undefined;
			let raw: string | undefined;
			register('/upload', {
				method: 'POST',
				handler: async (event) => {
					contentType = getRequestHeader(event, 'content-type');
					raw = await readRawBody(event);
					return { ok: true };
				}
			});

			const name = ref('frog');
			const client = createUseFetchClient<Paths>('', { bodySerializer: urlencodedSerializer });
			await client('/upload', { method: 'POST', body: { name } });

			expect(contentType).toMatch(/^application\/x-www-form-urlencoded/);
			expect(raw).toBe('name=frog');
		});

		test('re-fetches with a newly serialized body when a ref inside it changes', async () => {
			const names: string[] = [];
			register('/upload', {
				method: 'POST',
				handler: async (event) => {
					const fd = await readFormData(event);
					names.push(String(fd.get('name')));
					return { ok: true };
				}
			});

			const name = ref('frog');
			const client = createUseFetchClient<Paths>('', {});
			await client('/upload', {
				method: 'POST',
				body: { name },
				bodySerializer: formdataSerializer
			});

			expect(names).toEqual(['frog']);

			name.value = 'toad';

			await vi.waitFor(() => expect(names).toEqual(['frog', 'toad']));
		});
	});
});
