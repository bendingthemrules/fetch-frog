import { afterEach, describe, expect, test } from 'vitest';
import { createFetchClient } from './fetch-frog';
import { matchHttpError } from './http-errors';
import type { ErrorPaths } from './test/fixtures/error-paths';
import { deadBaseUrl, startServer, type Reply } from './test/fixtures/server';

let close: (() => Promise<void>) | undefined;

afterEach(async () => {
	await close?.();
	close = undefined;
});

async function clientReplying(reply: Reply) {
	const server = await startServer(() => reply);
	close = server.close;
	return createFetchClient<ErrorPaths>(server.baseUrl, {});
}

describe('matchHttpError', () => {
	test('routes a documented status to its exact handler', async () => {
		// Arrange
		const client = await clientReplying({ status: 404, body: { message: 'no frog' } });
		const { error } = await client('/pet/{petId}', { path: { petId: 'frog' } });

		// Act
		const result = matchHttpError(error!, {
			404: (e) => `404:${e.body.message}`,
			422: () => '422',
			'5XX': () => '5XX',
			otherwise: () => 'otherwise',
			network: () => 'network'
		});

		// Assert
		expect(result).toBe('404:no frog');
	});

	test('routes an undocumented status to its matching wildcard handler', async () => {
		// Arrange
		const client = await clientReplying({ status: 503, body: { retryAfter: 30 } });
		const { error } = await client('/pet/{petId}', { path: { petId: 'frog' } });

		// Act
		const result = matchHttpError(error!, {
			404: () => '404',
			422: () => '422',
			'5XX': (e) => `${e.status}:${e.body.retryAfter}`,
			otherwise: () => 'otherwise',
			network: () => 'network'
		});

		// Assert
		expect(result).toBe('503:30');
	});

	test('routes a status matching no documented key to otherwise', async () => {
		// Arrange
		const client = await clientReplying({ status: 418, body: { teapot: true } });
		const { error } = await client('/pet/{petId}', { path: { petId: 'frog' } });

		// Act
		const result = matchHttpError(error!, {
			404: () => '404',
			422: () => '422',
			'5XX': () => '5XX',
			otherwise: (e) => ({ status: e.status, body: e.body }),
			network: () => 'network'
		});

		// Assert
		expect(result).toEqual({ status: 418, body: { teapot: true } });
	});

	test('routes an explicitly handled undocumented status to its handler', async () => {
		// Arrange
		const client = await clientReplying({ status: 401, body: { reason: 'expired' } });
		const { error } = await client('/pet/{petId}', { path: { petId: 'frog' } });

		// Act
		const result = matchHttpError(error!, {
			404: () => '404',
			422: () => '422',
			'5XX': () => '5XX',
			otherwise: () => 'otherwise',
			network: () => 'network',
			401: (e) => e.body
		});

		// Assert
		expect(result).toEqual({ reason: 'expired' });
	});

	test('routes a status matching no documented key to default when the spec has one', async () => {
		// Arrange
		const client = await clientReplying({ status: 409, body: { code: 'CONFLICT' } });
		const { error } = await client('/pet/{petId}', {
			method: 'DELETE',
			path: { petId: 'frog' }
		});

		// Act
		const result = matchHttpError(error!, {
			404: () => '404',
			default: (e) => `${e.status}:${e.body.code}`,
			network: () => 'network'
		});

		// Assert
		expect(result).toBe('409:CONFLICT');
	});

	test('prefers the exact handler over default', async () => {
		// Arrange
		const client = await clientReplying({ status: 404 });
		const { error } = await client('/pet/{petId}', {
			method: 'DELETE',
			path: { petId: 'frog' }
		});

		// Act
		const result = matchHttpError(error!, {
			404: () => '404',
			default: () => 'default',
			network: () => 'network'
		});

		// Assert
		expect(result).toBe('404');
	});

	test('routes a failure without a response to network', async () => {
		// Arrange
		const client = createFetchClient<ErrorPaths>(await deadBaseUrl(), { retry: 0 });
		const { error } = await client('/pet/{petId}', { path: { petId: 'frog' } });

		// Act
		const result = matchHttpError(error!, {
			404: () => '404',
			422: () => '422',
			'5XX': () => '5XX',
			otherwise: () => 'otherwise',
			network: (e) => e
		});

		// Assert
		expect(result).toBe(error);
	});
});
