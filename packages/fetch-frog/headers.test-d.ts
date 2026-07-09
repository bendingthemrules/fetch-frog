import { createFetchClient } from './fetch-frog.js';

// Mirrors the exact shape openapi-typescript v7 generates: every parameter
// category is always present, empty ones typed as `never`.
interface TestPaths {
	// Operation WITH an `in: header` parameter.
	'/pet/{petId}': {
		delete: {
			parameters: {
				query?: never;
				header?: {
					api_key?: string;
				};
				path: {
					petId: number;
				};
				cookie?: never;
			};
			responses: {
				200: {
					content: {
						'application/json': { ok: boolean };
					};
				};
			};
		};
	};
	// Operation with NO header parameter (`header?: never`).
	'/pet/findByStatus': {
		get: {
			parameters: {
				query?: {
					status?: string;
				};
				header?: never;
				path?: never;
				cookie?: never;
			};
			responses: {
				200: {
					content: {
						'application/json': { ok: boolean };
					};
				};
			};
		};
	};
}

const client = createFetchClient<TestPaths>('https://petstore.swagger.io/v2', {});

// A spec-defined header parameter should be passed under `headers` (plural),
// matching ofetch's runtime option — so this must be accepted.
client('/pet/{petId}', {
	method: 'DELETE',
	path: { petId: 1 },
	headers: { api_key: 'secret' }
});

// The singular `header` key should NOT be a recognized spec parameter.
client('/pet/{petId}', {
	method: 'DELETE',
	path: { petId: 1 },
	// @ts-expect-error `header` is not a valid option; use `headers`
	header: { api_key: 'secret' }
});

// On an operation WITH a spec header param, you can still add your own
// extra headers alongside the typed one.
client('/pet/{petId}', {
	method: 'DELETE',
	path: { petId: 1 },
	headers: { api_key: 'secret', authorization: 'Bearer token' }
});

// On an operation WITHOUT any spec header params (`header?: never`),
// arbitrary headers must still work.
client('/pet/findByStatus', {
	method: 'GET',
	headers: { authorization: 'Bearer token', 'x-trace-id': 'abc' }
});
