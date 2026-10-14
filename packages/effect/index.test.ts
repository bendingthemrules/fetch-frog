import { Effect, Exit } from 'effect';
import { afterEach, describe, expect, test } from 'vitest';
import { catchResponseError, createEffectClient, NetworkError, ResponseError } from './index';
import type { ErrorPaths } from './test/fixtures/error-paths';
import { deadBaseUrl, startServer, type Reply } from './test/fixtures/server';

let close: (() => Promise<void>) | undefined;

afterEach(async () => {
	await close?.();
	close = undefined;
});

async function serverReplying(reply: Reply) {
	const server = await startServer(() => reply);
	close = server.close;
	return { ...server, client: createEffectClient<ErrorPaths>(server.baseUrl, { retry: 0 }) };
}

describe('createEffectClient', () => {
	test('succeeds with the response data', async () => {
		// Arrange
		const { client } = await serverReplying({ status: 200, body: { id: '1', name: 'frog' } });

		// Act
		const result = await Effect.runPromise(client('/pet/{petId}', { path: { petId: '1' } }));

		// Assert
		expect(result).toEqual({ id: '1', name: 'frog' });
	});

	test('fails with a ResponseError carrying status and body', async () => {
		// Arrange
		const { client } = await serverReplying({ status: 404, body: { message: 'no frog' } });

		// Act
		const exit = await Effect.runPromiseExit(client('/pet/{petId}', { path: { petId: '1' } }));

		// Assert
		expect(exit).toEqual(Exit.fail(expect.any(ResponseError)));
		const error = Exit.isFailure(exit) && exit.cause.reasons[0];
		expect(error).toMatchObject({
			error: { _tag: 'ResponseError', status: 404, body: { message: 'no frog' } }
		});
	});

	test('fails with a NetworkError when there is no response', async () => {
		// Arrange
		const client = createEffectClient<ErrorPaths>(await deadBaseUrl(), { retry: 0 });

		// Act
		const error = await Effect.runPromise(
			Effect.flip(client('/pet/{petId}', { path: { petId: '1' } }))
		);

		// Assert
		expect(error).toBeInstanceOf(NetworkError);
		expect(error._tag).toBe('NetworkError');
	});

	test('aborts the request when the effect is interrupted', async () => {
		// Arrange
		const { client, aborted } = await serverReplying('hang');

		// Act
		await Effect.runPromiseExit(
			client('/pet/{petId}', { path: { petId: '1' } }).pipe(Effect.timeout('50 millis'))
		);
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Assert
		expect(aborted()).toBe(1);
	});
});

describe('catchResponseError', () => {
	test('recovers using the handler for the response status', async () => {
		// Arrange
		const { client } = await serverReplying({
			status: 422,
			body: { fields: { name: ['required'] } }
		});

		// Act
		const result = await Effect.runPromise(
			client('/pet/{petId}', { path: { petId: '1' } }).pipe(
				catchResponseError({
					404: () => Effect.succeed('404'),
					422: (e) => Effect.succeed(Object.keys(e.body.fields).join()),
					'5XX': () => Effect.succeed('5XX'),
					otherwise: () => Effect.succeed('otherwise')
				})
			)
		);

		// Assert
		expect(result).toBe('name');
	});

	test('leaves network errors in the error channel', async () => {
		// Arrange
		const client = createEffectClient<ErrorPaths>(await deadBaseUrl(), { retry: 0 });

		// Act
		const error = await Effect.runPromise(
			Effect.flip(
				catchResponseError(client('/pet/{petId}', { path: { petId: '1' } }), {
					404: () => Effect.succeed('404'),
					422: () => Effect.succeed('422'),
					'5XX': () => Effect.succeed('5XX'),
					otherwise: () => Effect.succeed('otherwise')
				})
			)
		);

		// Assert
		expect(error._tag).toBe('NetworkError');
	});
});
