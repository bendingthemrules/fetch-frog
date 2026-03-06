import type { FetchError } from 'ofetch';
import type {
	ErrorResponse,
	SuccessResponse,
	FilterKeys,
	MediaType,
	ResponseObjectMap,
	OperationRequestBodyContent
} from 'openapi-typescript-helpers';

export type PickFrom<T, K extends Array<string>> =
	T extends Array<any>
		? T
		: T extends Record<string, any>
			? keyof T extends K[number]
				? T
				: K[number] extends never
					? T
					: Pick<T, K[number]>
			: T;

export type KeysOf<T> = Array<T extends T ? (keyof T extends string ? keyof T : never) : never>;

export type FetchResponseData<T> = FilterKeys<SuccessResponse<ResponseObjectMap<T>>, MediaType>;

export type FetchResponseError<T> = FetchError<
	FilterKeys<ErrorResponse<ResponseObjectMap<T>>, MediaType>
>;

export type MethodOption<M, P> = 'get' extends keyof P ? { method?: M } : { method: M };

export type ParamsOption<T> = T extends { parameters: any }
	? T['parameters']
	: { query?: Record<string, unknown> };

export type RequestBodyOption<T> =
	OperationRequestBodyContent<T> extends never
		? { body?: never }
		: undefined extends OperationRequestBodyContent<T>
			? { body?: OperationRequestBodyContent<T> }
			: { body: OperationRequestBodyContent<T> };
