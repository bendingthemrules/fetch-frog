import { Effect } from 'effect';
import {
	catchResponseError,
	createEffectClient,
	type NetworkError,
	type ResponseError
} from './index.js';
import type { ErrorPaths } from './test/fixtures/error-paths.js';

type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const assertType = <T extends true>(_: T) => {};

const client = createEffectClient<ErrorPaths>('https://petstore.swagger.io/v2', {});

type GetPet = ErrorPaths['/pet/{petId}']['get'];

const getPet = client('/pet/{petId}', { path: { petId: 'frog' } });
assertType<
	Equal<
		typeof getPet,
		Effect.Effect<{ id: string; name: string }, ResponseError<GetPet> | NetworkError>
	>
>(true);

// Request options are still checked against the spec.
// @ts-expect-error petId is required
client('/pet/{petId}', { path: {} });

class NotFound {
	readonly _tag = 'NotFound';
}

// Handling every documented status removes ResponseError from the error channel,
// leaving NetworkError plus whatever the handlers fail with.
const handled = getPet.pipe(
	catchResponseError({
		404: (e) => {
			assertType<Equal<typeof e.status, 404>>(true);
			assertType<Equal<typeof e.body, { message: string }>>(true);
			return Effect.fail(new NotFound());
		},
		422: () => Effect.succeed(null),
		'5XX': (e) => {
			assertType<Equal<typeof e.body, { retryAfter: number }>>(true);
			return Effect.succeed(null);
		},
		otherwise: () => Effect.succeed(null)
	})
);
assertType<
	Equal<typeof handled, Effect.Effect<{ id: string; name: string } | null, NetworkError | NotFound>>
>(true);

// Data-first form behaves the same.
const handledDataFirst = catchResponseError(getPet, {
	404: () => Effect.succeed(null),
	422: () => Effect.succeed(null),
	'5XX': () => Effect.succeed(null),
	otherwise: () => Effect.succeed(null)
});
assertType<
	Equal<typeof handledDataFirst, Effect.Effect<{ id: string; name: string } | null, NetworkError>>
>(true);

getPet.pipe(
	// @ts-expect-error a documented status (422) is not handled
	catchResponseError({
		404: () => Effect.succeed(null),
		'5XX': () => Effect.succeed(null),
		otherwise: () => Effect.succeed(null)
	})
);

// @ts-expect-error otherwise is required when the spec has no `default`
catchResponseError(getPet, {
	404: () => Effect.succeed(null),
	422: () => Effect.succeed(null),
	'5XX': () => Effect.succeed(null)
});
