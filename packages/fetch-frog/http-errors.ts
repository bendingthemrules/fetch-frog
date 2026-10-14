import type { FetchError } from 'ofetch';
import type {
	HandlersResult,
	HttpError,
	HttpErrorHandlers,
	WithOperation
} from './types/http-errors.js';

type AnyHandler = (error: any) => unknown;

/**
 * Picks the handler for an HTTP status: exact status, then `4XX`/`5XX` wildcard,
 * then `default`, then `otherwise`. Mirrors how OpenAPI resolves response keys.
 */
export function selectStatusHandler(
	handlers: Record<string, AnyHandler | undefined>,
	status: number
): AnyHandler {
	return (handlers[status] ??
		handlers[`${String(status)[0]}XX`] ??
		handlers.default ??
		handlers.otherwise) as AnyHandler;
}

/** Normalises an ofetch error that has a response into an {@link HttpError}. */
export function toHttpError(error: FetchError, status: number): HttpError {
	return { status, body: error.data, cause: error };
}

/**
 * Handle a fetch frog error by its HTTP status. Every status documented for the
 * operation must have a handler, so a newly documented status is a type error
 * until it's handled.
 *
 * @example
 * ```ts
 * const { data, error } = await apiClient("/pet/{petId}", { path: { petId: "frog" } });
 *
 * if (error) {
 *   return matchHttpError(error, {
 *     404: (e) => `No pet: ${e.body.message}`,
 *     otherwise: (e) => `Unexpected ${e.status}`,
 *     network: () => "Offline"
 *   });
 * }
 * ```
 */
export function matchHttpError<Op, H extends HttpErrorHandlers<Op, unknown>>(
	error: FetchError & WithOperation<Op>,
	handlers: H
): HandlersResult<H> {
	const status = error.response?.status;
	if (status === undefined) {
		return handlers.network(error) as HandlersResult<H>;
	}

	const handler = selectStatusHandler(handlers as Record<string, AnyHandler>, status);
	return handler(toHttpError(error, status)) as HandlersResult<H>;
}
