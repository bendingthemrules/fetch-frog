import { createFetchClient } from './fetch-frog.js';
import { matchHttpError } from './http-errors.js';
import type { ErrorPaths } from './test/fixtures/error-paths.js';

const client = createFetchClient<ErrorPaths>('https://petstore.swagger.io/v2', {});

type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const assertType = <T extends true>(_: T) => {};

async function cases() {
	const getPet = await client('/pet/{petId}', { path: { petId: 'frog' } });
	if (!getPet.error) return;
	const getError = getPet.error;

	// Every documented status, plus otherwise and network: accepted, with each
	// handler's body narrowed to that status's schema.
	matchHttpError(getError, {
		404: (e) => {
			assertType<Equal<typeof e.status, 404>>(true);
			assertType<Equal<typeof e.body, { message: string }>>(true);
		},
		422: (e) => {
			assertType<Equal<typeof e.body, { fields: Record<string, string[]> }>>(true);
		},
		'5XX': (e) => {
			assertType<Equal<typeof e.status, number>>(true);
			assertType<Equal<typeof e.body, { retryAfter: number }>>(true);
		},
		otherwise: (e) => {
			assertType<Equal<typeof e.status, number>>(true);
			assertType<Equal<typeof e.body, unknown>>(true);
		},
		network: () => {}
	});

	// The result type is the union of what the handlers return.
	const result = matchHttpError(getError, {
		404: () => 1 as const,
		422: () => 2 as const,
		'5XX': () => 3 as const,
		otherwise: () => 'other' as const,
		network: () => null
	});
	assertType<Equal<typeof result, 1 | 2 | 3 | 'other' | null>>(true);

	// @ts-expect-error a documented status (422) is not handled
	matchHttpError(getError, {
		404: () => {},
		'5XX': () => {},
		otherwise: () => {},
		network: () => {}
	});

	// @ts-expect-error a documented wildcard (5XX) is not handled
	matchHttpError(getError, {
		404: () => {},
		422: () => {},
		otherwise: () => {},
		network: () => {}
	});

	// @ts-expect-error otherwise is required when the spec has no `default`
	matchHttpError(getError, {
		404: () => {},
		422: () => {},
		'5XX': () => {},
		network: () => {}
	});

	// @ts-expect-error network is required
	matchHttpError(getError, {
		404: () => {},
		422: () => {},
		'5XX': () => {},
		otherwise: () => {}
	});

	// An undocumented status can still be handled explicitly; its body is unknown.
	matchHttpError(getError, {
		404: () => {},
		422: () => {},
		'5XX': () => {},
		otherwise: () => {},
		network: () => {},
		401: (e) => {
			assertType<Equal<typeof e.status, 401>>(true);
			assertType<Equal<typeof e.body, unknown>>(true);
		}
	});

	const deletePet = await client('/pet/{petId}', { method: 'DELETE', path: { petId: 'frog' } });
	if (!deletePet.error) return;

	// With a documented `default`, otherwise is not needed. A response without
	// content has an `undefined` body.
	matchHttpError(deletePet.error, {
		404: (e) => {
			assertType<Equal<typeof e.body, undefined>>(true);
		},
		default: (e) => {
			assertType<Equal<typeof e.status, number>>(true);
			assertType<Equal<typeof e.body, { code: string }>>(true);
		},
		network: () => {}
	});

	const health = await client('/health', {});
	if (!health.error) return;

	// No documented errors: only otherwise and network.
	matchHttpError(health.error, {
		otherwise: () => {},
		network: () => {}
	});
}

void cases;
