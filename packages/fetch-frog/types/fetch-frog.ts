import type { FetchOptions as OfetchFetchOptions } from 'ofetch';
import type { BodySerializer } from '../serializers.js';
import type {
	BodySerializerOption,
	FetchResponseData,
	FetchResponseError,
	MethodOption,
	ParamsOption,
	RequestBodyOption
} from './utils.js';

export type FetchClient<Paths> = <
	ReqT extends Extract<keyof Paths, string>,
	Method extends Extract<keyof Paths[ReqT], string> | Uppercase<Extract<keyof Paths[ReqT], string>>,
	LowercasedMethod extends Lowercase<Method> extends keyof Paths[ReqT] ? Lowercase<Method> : never,
	DefaultMethod extends 'get' extends LowercasedMethod ? 'get' : LowercasedMethod,
	DataT = FetchResponseData<Paths[ReqT][DefaultMethod]>,
	ErrorT = FetchResponseError<Paths[ReqT][DefaultMethod]>
>(
	url: ReqT,
	options: ClientFetchOptions<Method, LowercasedMethod, Paths[ReqT]>
) => Promise<{ data: DataT; error: null } | { data: null; error: ErrorT }>;

type ClientFetchOptions<
	Method,
	LowercasedMethod,
	Params,
	_Operation = 'get' extends LowercasedMethod
		? 'get' extends keyof Params
			? Params['get']
			: never
		: LowercasedMethod extends keyof Params
			? Params[LowercasedMethod]
			: never
> = MethodOption<Method, Params> &
	ParamsOption<_Operation> &
	RequestBodyOption<_Operation> &
	BodySerializerOption<_Operation> &
	Omit<OfetchFetchOptions, 'query' | 'body' | 'method'>;

/**
 * Client-wide defaults: any ofetch option, plus a default `bodySerializer`
 * applied to every request that sends a body.
 */
export type FetchClientDefaults = OfetchFetchOptions & {
	bodySerializer?: BodySerializer;
};
