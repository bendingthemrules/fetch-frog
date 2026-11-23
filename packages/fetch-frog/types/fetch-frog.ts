import type { FetchOptions as OfetchFetchOptions } from 'ofetch';
import type { BodySerializer } from '../serializers.js';
import type {
	BodySerializerOption,
	FetchResponseData,
	FetchResponseError,
	MethodOption,
	OperationFor,
	ParamsOption,
	RequestBodyOption
} from './utils.js';

export type FetchClient<Paths> = <
	ReqT extends Extract<keyof Paths, string>,
	Method extends Extract<keyof Paths[ReqT], string> | Uppercase<Extract<keyof Paths[ReqT], string>>,
	LowercasedMethod extends Lowercase<Method> extends keyof Paths[ReqT] ? Lowercase<Method> : never,
	DataT = FetchResponseData<OperationFor<Paths[ReqT], LowercasedMethod>>,
	ErrorT = FetchResponseError<OperationFor<Paths[ReqT], LowercasedMethod>>
>(
	url: ReqT,
	options: ClientFetchOptions<Method, LowercasedMethod, Paths[ReqT]>
) => Promise<{ data: DataT; error: null } | { data: null; error: ErrorT }>;

type ClientFetchOptions<
	Method,
	LowercasedMethod,
	Params,
	// computed here rather than in the call signature, so TS doesn't try to infer it from `options`
	_Operation = OperationFor<Params, LowercasedMethod>
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
