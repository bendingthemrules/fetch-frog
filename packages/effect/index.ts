import { Data, Effect } from 'effect';
import { dual } from 'effect/Function';
import type { FetchError, FetchOptions } from 'ofetch';
import { createFetchClient } from 'fetch-frog';
import type {
	ClientFetchOptions,
	FetchResponseData,
	HttpStatusHandlers,
	KeysOf
} from 'fetch-frog/types';
import { selectStatusHandler } from 'fetch-frog/utils';

/** The API answered with a non-2xx status. `Op` is the OpenAPI operation, used to type handlers. */
export class ResponseError<Op = unknown> extends Data.TaggedError('ResponseError')<{
	readonly status: number;
	readonly body: unknown;
	readonly cause: FetchError;
}> {
	declare readonly '~operation'?: Op;
}

/** The request failed without a response: connection refused, DNS, CORS, aborted. */
export class NetworkError extends Data.TaggedError('NetworkError')<{
	readonly cause: FetchError;
}> {}

export type EffectClient<Paths> = <
	ReqT extends Extract<keyof Paths, string>,
	Method extends Extract<keyof Paths[ReqT], string> | Uppercase<Extract<keyof Paths[ReqT], string>>,
	LowercasedMethod extends Lowercase<Method> extends keyof Paths[ReqT] ? Lowercase<Method> : never,
	DefaultMethod extends 'get' extends LowercasedMethod ? 'get' : LowercasedMethod,
	Op = Paths[ReqT][DefaultMethod],
	DataT = FetchResponseData<Op>
>(
	url: ReqT,
	options: ClientFetchOptions<Method, LowercasedMethod, Paths[ReqT], KeysOf<DataT>>
) => Effect.Effect<DataT, ResponseError<Op> | NetworkError>;

/**
 * Create a fetch frog client that returns Effects. Failures are typed as
 * {@link ResponseError} or {@link NetworkError}, and interrupting the Effect
 * aborts the request.
 *
 * @example
 * ```ts
 * const apiClient = createEffectClient<paths>("https://petstore3.swagger.io/api/v3", {});
 *
 * const pet = apiClient("/pet/{petId}", { path: { petId: "frog" } }).pipe(
 *   catchResponseError({
 *     404: () => Effect.succeed(null),
 *     otherwise: (e) => Effect.die(e)
 *   })
 * );
 * ```
 */
export function createEffectClient<Paths>(
	baseUrl: string,
	defaults: FetchOptions
): EffectClient<Paths> {
	const client = createFetchClient<Paths>(baseUrl, defaults) as unknown as (
		url: string,
		options: FetchOptions
	) => Promise<{ data: unknown; error: null } | { data: null; error: FetchError }>;

	return ((url: string, options: FetchOptions = {}) =>
		Effect.flatMap(
			Effect.promise((signal) =>
				client(url, {
					...options,
					signal: options.signal ? AbortSignal.any([options.signal, signal]) : signal
				})
			),
			(result) =>
				result.error ? Effect.fail(toEffectError(result.error)) : Effect.succeed(result.data)
		)) as EffectClient<Paths>;
}

function toEffectError(error: FetchError): ResponseError | NetworkError {
	const status = error.response?.status;
	if (status === undefined) return new NetworkError({ cause: error });
	return new ResponseError({ status, body: error.data, cause: error });
}

type OperationOf<E> = E extends ResponseError<infer Op> ? Op : never;

type AnyEffect = Effect.Effect<any, any, any>;

type HandlerEffects<H> = {
	[K in keyof H]: H[K] extends (...args: any[]) => infer R ? R : never;
}[keyof H];

/**
 * Recover from a {@link ResponseError} by its status. Every status documented
 * for the operation must be handled, plus `otherwise` when the spec has no
 * `default`, so a newly documented status is a type error until it's handled.
 * {@link NetworkError} stays in the error channel.
 */
export const catchResponseError: {
	<E, H extends HttpStatusHandlers<OperationOf<E>, AnyEffect>>(
		handlers: H
	): <A, R>(
		self: Effect.Effect<A, E, R>
	) => Effect.Effect<
		A | Effect.Success<HandlerEffects<H>>,
		Exclude<E, ResponseError<any>> | Effect.Error<HandlerEffects<H>>,
		R | Effect.Services<HandlerEffects<H>>
	>;
	<A, E, R, H extends HttpStatusHandlers<OperationOf<E>, AnyEffect>>(
		self: Effect.Effect<A, E, R>,
		handlers: H
	): Effect.Effect<
		A | Effect.Success<HandlerEffects<H>>,
		Exclude<E, ResponseError<any>> | Effect.Error<HandlerEffects<H>>,
		R | Effect.Services<HandlerEffects<H>>
	>;
} = dual(2, (self: AnyEffect, handlers: Record<string, (error: any) => AnyEffect>) =>
	Effect.catchIf(
		self,
		(error): error is ResponseError => error instanceof ResponseError,
		(error) => selectStatusHandler(handlers, error.status)(error) as AnyEffect
	)
);
