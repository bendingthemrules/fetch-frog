import type { AsyncData, UseFetchOptions as NuxtUseFetchOptions } from 'nuxt/app';
import type {
	FetchResponseData,
	FetchResponseError,
	KeysOf,
	ParamsOption,
	PickFrom,
	RequestBodyOption
} from 'fetch-frog/types';
import type { ComputedOptions, ComputedMethodOption } from './utils';

export type UseFetchClient<Paths, Lazy extends boolean = false> = <
	ReqT extends Extract<keyof Paths, string>,
	Method extends Extract<keyof Paths[ReqT], string> | Uppercase<Extract<keyof Paths[ReqT], string>>,
	LowercasedMethod extends Lowercase<Method> extends keyof Paths[ReqT] ? Lowercase<Method> : never,
	DefaultMethod extends 'get' extends LowercasedMethod ? 'get' : LowercasedMethod,
	ResT = FetchResponseData<Paths[ReqT][DefaultMethod]>,
	ErrorT = FetchResponseError<Paths[ReqT][DefaultMethod]>,
	DataT = ResT,
	PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
	DefaultT = null
>(
	url: ReqT | (() => ReqT),
	options: Lazy extends true
		? Omit<
				UseFetchOptions<Method, LowercasedMethod, Paths[ReqT], ResT, DataT, PickKeys, DefaultT>,
				'lazy'
			>
		: UseFetchOptions<Method, LowercasedMethod, Paths[ReqT], ResT, DataT, PickKeys, DefaultT>
) => AsyncData<PickFrom<DataT, PickKeys> | DefaultT, ErrorT | null>;

type UseFetchOptions<
	Method,
	LowercasedMethod,
	Params,
	ResT,
	DataT = ResT,
	PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
	DefaultT = null,
	Operation = 'get' extends LowercasedMethod
		? 'get' extends keyof Params
			? Params['get']
			: never
		: LowercasedMethod extends keyof Params
			? Params[LowercasedMethod]
			: never
> = ComputedMethodOption<Method, Params> &
	ComputedOptions<ParamsOption<Operation>> &
	ComputedOptions<RequestBodyOption<Operation>> &
	Omit<NuxtUseFetchOptions<ResT, DataT, PickKeys, DefaultT>, 'query' | 'body' | 'method'>;
