export { formdataBodySerializer } from './utils.js';
export { createFetchClient } from './fetch-frog.js';

export type {
	ExtractResponse,
	ExtractBody,
	ExtractPathParams,
	ExtractQueryParams,
	ExtractLitePathParams,
	ExtractLiteQueryParams,
} from './types/extractors.js';

export type {
	FetchResponseData,
	FetchResponseError,
	KeysOf,
	ParamsOption,
	PickFrom,
	RequestBodyOption,
} from './types/utils.js';

export type { FetchClient } from './types/fetch-frog.js';
