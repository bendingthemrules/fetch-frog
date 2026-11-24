import { afterEach, describe, expect, test, vi } from 'vitest';
import { formdataSerializer, jsonSerializer, urlencodedSerializer } from './serializers';
import { createFetchClient } from './fetch-frog';

describe('formdataSerializer', () => {
	test('flattens nested objects with dot keys', () => {
		const fd = formdataSerializer({ user: { name: 'Froggy', address: { city: 'Pond' } } });

		expect([...fd.entries()]).toEqual([
			['user.name', 'Froggy'],
			['user.address.city', 'Pond']
		]);
	});

	test('repeats the key for arrays of primitives', () => {
		const fd = formdataSerializer({ tags: ['a', 'b'] });

		expect(fd.getAll('tags')).toEqual(['a', 'b']);
	});

	test('indexes arrays of objects', () => {
		const fd = formdataSerializer({ items: [{ name: 'a' }, { name: 'b', meta: { x: 1 } }] });

		expect([...fd.entries()]).toEqual([
			['items[0].name', 'a'],
			['items[1].name', 'b'],
			['items[1].meta.x', '1']
		]);
	});

	test('skips undefined and null', () => {
		const fd = formdataSerializer({ a: undefined, b: null, c: 'kept' });

		expect([...fd.keys()]).toEqual(['c']);
	});

	test('sends dates as ISO strings', () => {
		const fd = formdataSerializer({ at: new Date(0) });

		expect(fd.get('at')).toBe('1970-01-01T00:00:00.000Z');
	});

	test('stringifies numbers and booleans', () => {
		const fd = formdataSerializer({ n: 0, b: false });

		expect(fd.get('n')).toBe('0');
		expect(fd.get('b')).toBe('false');
	});

	test('keeps files and arrays of files intact', () => {
		const file = new File(['x'], 'frog.png', { type: 'image/png' });
		const fd = formdataSerializer({ avatar: file, photos: [file, file] });

		expect((fd.get('avatar') as File).name).toBe('frog.png');
		expect(fd.getAll('photos')).toHaveLength(2);
	});

	test('passes FormData through unchanged', () => {
		const input = new FormData();
		input.append('a', 'b');

		expect(formdataSerializer(input)).toBe(input);
	});
});

describe('urlencodedSerializer', () => {
	test('uses the same key rules as formdata', () => {
		const params = urlencodedSerializer({
			user: { name: 'Froggy' },
			tags: ['a', 'b'],
			items: [{ id: 1 }],
			skip: undefined
		});

		expect(params.toString()).toBe('user.name=Froggy&tags=a&tags=b&items%5B0%5D.id=1');
	});

	test('throws a helpful error for files', () => {
		expect(() => urlencodedSerializer({ doc: { file: new Blob(['x']) } })).toThrow(
			/doc\.file.*formdataSerializer/
		);
	});
});

describe('jsonSerializer', () => {
	test('stringifies the body', () => {
		expect(jsonSerializer({ a: [1, { b: null }] })).toBe('{"a":[1,{"b":null}]}');
	});
});

describe('createFetchClient bodySerializer', () => {
	const fetchMock = vi.fn(async () => Response.json({ ok: true }));

	afterEach(() => {
		fetchMock.mockClear();
		vi.unstubAllGlobals();
	});

	function sentRequest() {
		vi.stubGlobal('fetch', fetchMock);
		return () => {
			const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
			return init;
		};
	}

	test('serializes the body per request', async () => {
		const getInit = sentRequest();
		const client = createFetchClient<any>('https://api.test', {});

		const { error } = await client('/upload', {
			method: 'POST',
			body: { name: 'frog', file: new File(['x'], 'frog.png') },
			bodySerializer: formdataSerializer
		});

		expect(error).toBeNull();
		const init = getInit();
		expect(init.body).toBeInstanceOf(FormData);
		expect((init.body as FormData).get('name')).toBe('frog');
		// fetch must set the multipart boundary itself
		expect(new Headers(init.headers).has('content-type')).toBe(false);
	});

	test('uses the client default and lets a request override it', async () => {
		const getInit = sentRequest();
		const client = createFetchClient<any>('https://api.test', {
			bodySerializer: urlencodedSerializer
		});

		await client('/a', { method: 'POST', body: { a: 1 } });
		expect(getInit().body).toBeInstanceOf(URLSearchParams);

		fetchMock.mockClear();
		await client('/b', { method: 'POST', body: { a: 1 }, bodySerializer: jsonSerializer });
		const init = getInit();
		expect(init.body).toBe('{"a":1}');
		expect(new Headers(init.headers).get('content-type')).toBe('application/json');
	});

	test('does not call the serializer without a body', async () => {
		sentRequest();
		const serializer = vi.fn(formdataSerializer);
		const client = createFetchClient<any>('https://api.test', { bodySerializer: serializer });

		await client('/c', {});

		expect(serializer).not.toHaveBeenCalled();
	});

	test('does not pass bodySerializer on to fetch', async () => {
		const getInit = sentRequest();
		const client = createFetchClient<any>('https://api.test', {});

		await client('/d', { method: 'POST', body: { a: 1 }, bodySerializer: formdataSerializer });

		expect(getInit()).not.toHaveProperty('bodySerializer');
	});
});
