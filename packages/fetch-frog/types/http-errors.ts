import type { FetchError } from 'ofetch';
import type {
	ErrorStatus,
	FilterKeys,
	MediaType,
	ResponseObjectMap
} from 'openapi-typescript-helpers';

/** Phantom key that carries the OpenAPI operation on an error's type, so handlers can be derived from it. */
export declare const operation: unique symbol;

export type WithOperation<Op> = { readonly [operation]?: Op };

/** Every response key of an operation that ofetch treats as an error: anything outside 2xx. */
export type ErrorStatusKeys<Op> = {
	[K in keyof ResponseObjectMap<Op>]: `${K & (string | number)}` extends `2${string}` ? never : K;
}[keyof ResponseObjectMap<Op>];

/**
 * Exact keys keep their literal status; wildcards and `default` can be any status.
 * Keys can arrive as numeric strings (`"404"`) while TS contextually types an object literal.
 */
type StatusOf<K> = K extends number ? K : K extends `${infer N extends number}` ? N : number;

type ResponseBody<R> = R extends { content: infer C } ? FilterKeys<C, MediaType> : undefined;

export type HttpError<Status = number, Body = unknown> = {
	status: Status;
	body: Body;
	cause: FetchError<Body>;
};

/**
 * One handler per documented error status (including `4XX`/`5XX` wildcards and `default`),
 * plus `otherwise` for undocumented statuses when the spec has no `default`.
 * Undocumented statuses can also be handled explicitly; their body is `unknown`.
 */
export type HttpStatusHandlers<Op, R> = {
	[K in ErrorStatusKeys<Op>]: (
		error: HttpError<StatusOf<K>, ResponseBody<ResponseObjectMap<Op>[K]>>
	) => R;
} & {
	[S in Exclude<Extract<ErrorStatus, number>, ErrorStatusKeys<Op>>]?: (
		error: HttpError<S, unknown>
	) => R;
} & ('default' extends ErrorStatusKeys<Op>
		? {}
		: { otherwise: (error: HttpError<number, unknown>) => R });

/** {@link HttpStatusHandlers} plus `network` for failures without a response. */
export type HttpErrorHandlers<Op, R> = HttpStatusHandlers<Op, R> & {
	network: (error: FetchError) => R;
};

export type HandlersResult<H> = {
	[K in keyof H]: H[K] extends (...args: any[]) => infer R ? R : never;
}[keyof H];
