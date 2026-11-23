import type { AsyncData, KeysOf, PickFrom, UseFetchOptions as NuxtUseFetchOptions } from 'nuxt/app';
import type {
	BodySerializer,
	BodySerializerOption,
	FetchResponseData,
	FetchResponseError,
	OperationFor,
	ParamsOption,
	RequestBodyOption
} from 'fetch-frog/types';
import type { ComputedOptions, ComputedMethodOption } from './utils';

export type UseFetchClient<Paths, Lazy extends boolean = false> = <
	ReqT extends Extract<keyof Paths, string>,
	Method extends Extract<keyof Paths[ReqT], string> | Uppercase<Extract<keyof Paths[ReqT], string>>,
	LowercasedMethod extends Lowercase<Method> extends keyof Paths[ReqT] ? Lowercase<Method> : never,
	ResT = FetchResponseData<OperationFor<Paths[ReqT], LowercasedMethod>>,
	ErrorT = FetchResponseError<OperationFor<Paths[ReqT], LowercasedMethod>>,
	DataT = ResT,
	PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
	DefaultT = undefined
>(
	url: ReqT | (() => ReqT),
	options: Lazy extends true
		? Omit<
				UseFetchOptions<Method, LowercasedMethod, Paths[ReqT], ResT, DataT, PickKeys, DefaultT>,
				'lazy'
			>
		: UseFetchOptions<Method, LowercasedMethod, Paths[ReqT], ResT, DataT, PickKeys, DefaultT>
) => AsyncData<PickFrom<DataT, PickKeys> | DefaultT, ErrorT | undefined>;

type UseFetchOptions<
	Method,
	LowercasedMethod,
	Params,
	ResT,
	DataT = ResT,
	PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
	DefaultT = undefined,
	// computed here rather than in the call signature, so TS doesn't try to infer it from `options`
	Operation = OperationFor<Params, LowercasedMethod>
> = ComputedMethodOption<Method, Params> &
	ComputedOptions<ParamsOption<Operation>> &
	ComputedOptions<RequestBodyOption<Operation>> &
	BodySerializerOption<Operation> &
	Omit<NuxtUseFetchOptions<ResT, DataT, PickKeys, DefaultT>, 'query' | 'body' | 'method'>;

/**
 * Client-wide defaults: any Nuxt `useFetch` option, plus a default
 * `bodySerializer` applied to every request that sends a body.
 */
export type UseFetchClientDefaults = NuxtUseFetchOptions<any> & {
	bodySerializer?: BodySerializer;
};
