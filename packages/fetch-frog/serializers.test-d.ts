import { createFetchClient } from './fetch-frog.js';
import { formdataSerializer, jsonSerializer } from './serializers.js';

interface TestPaths {
	'/pet/{petId}/upload': {
		post: {
			parameters: {
				query?: never;
				header?: never;
				path: { petId: number };
				cookie?: never;
			};
			requestBody: {
				content: {
					'multipart/form-data': { name: string; file: Blob };
				};
			};
			responses: {
				200: { content: { 'application/json': { ok: boolean } } };
			};
		};
	};
	'/pet': {
		get: {
			parameters: {
				query?: never;
				header?: never;
				path?: never;
				cookie?: never;
			};
			requestBody?: never;
			responses: {
				200: { content: { 'application/json': { ok: boolean } } };
			};
		};
	};
}

const client = createFetchClient<TestPaths>('https://api.test', {});
const file = new Blob(['x']);

// Built-in serializers are accepted without casting.
void client('/pet/{petId}/upload', {
	method: 'post',
	path: { petId: 1 },
	body: { name: 'frog', file },
	bodySerializer: formdataSerializer
});

void client('/pet/{petId}/upload', {
	method: 'post',
	path: { petId: 1 },
	body: { name: 'frog', file },
	bodySerializer: jsonSerializer
});

// A custom serializer receives the operation's body type.
void client('/pet/{petId}/upload', {
	method: 'post',
	path: { petId: 1 },
	body: { name: 'frog', file },
	bodySerializer: (body) => {
		const name: string = body.name;
		const blob: Blob = body.file;
		// @ts-expect-error not part of the body type
		void body.missing;
		const fd = new FormData();
		fd.append('name', name);
		fd.append('file', blob);
		return fd;
	}
});

// The body itself is still checked against the schema.
void client('/pet/{petId}/upload', {
	method: 'post',
	path: { petId: 1 },
	// @ts-expect-error file is required
	body: { name: 'frog' },
	bodySerializer: formdataSerializer
});

// A serializer must return something fetch can send.
void client('/pet/{petId}/upload', {
	method: 'post',
	path: { petId: 1 },
	body: { name: 'frog', file },
	// @ts-expect-error a number is not a BodyInit
	bodySerializer: () => 42
});

// Operations without a request body don't accept a serializer.
void client('/pet', {
	// @ts-expect-error no body, so no serializer
	bodySerializer: formdataSerializer
});

// Client-wide default.
createFetchClient<TestPaths>('https://api.test', { bodySerializer: formdataSerializer });
