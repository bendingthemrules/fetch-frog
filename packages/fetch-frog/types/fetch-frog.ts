import type { FetchOptions as OfetchFetchOptions } from 'ofetch';
import type {
	FetchResponseData,
	FetchResponseError,
	KeysOf,
	MethodOption,
	ParamsOption,
	RequestBodyOption,
} from './utils.js';

export type FetchClient<Paths> = <
	ReqT extends Extract<keyof Paths, string>,
	Method extends
		| Extract<keyof Paths[ReqT], string>
		| Uppercase<Extract<keyof Paths[ReqT], string>>,
	LowercasedMethod extends Lowercase<Method> extends keyof Paths[ReqT]
		? Lowercase<Method>
		: never,
	DefaultMethod extends 'get' extends LowercasedMethod
		? 'get'
		: LowercasedMethod,
	DataT = FetchResponseData<Paths[ReqT][DefaultMethod]>,
	ErrorT = FetchResponseError<Paths[ReqT][DefaultMethod]>,
	PickKeys extends KeysOf<DataT> = KeysOf<DataT>
>(
	url: ReqT,
	options: ClientFetchOptions<Method, LowercasedMethod, Paths[ReqT], PickKeys>
) => Promise<{ data: DataT; error: null } | { data: null; error: ErrorT }>;

type ClientFetchOptions<
	Method,
	LowercasedMethod,
	Params,
	_PickKeys,
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
	Omit<OfetchFetchOptions, 'query' | 'body' | 'method'>;
