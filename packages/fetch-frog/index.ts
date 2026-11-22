export { containsFileOrBlob, formdataBodySerializer } from './utils.js';
export {
	formdataSerializer,
	urlencodedSerializer,
	jsonSerializer,
	type BodySerializer
} from './serializers.js';
export { createFetchClient } from './fetch-frog.js';

export type {
	ExtractResponse,
	ExtractBody,
	ExtractPathParams,
	ExtractQueryParams
} from './types/extractors.js';

export type {
	BodySerializerOption,
	FetchResponseData,
	FetchResponseError,
	KeysOf,
	ParamsOption,
	PickFrom,
	RequestBodyOption
} from './types/utils.js';

export type { FetchClient, FetchClientDefaults } from './types/fetch-frog.js';
