import type {
	ExtractResponse,
	ExtractBody,
	ExtractPathParams,
	ExtractQueryParams,
	ExtractLitePathParams,
	ExtractLiteQueryParams,
} from './types/extractors';
import { formdataBodySerializer } from './utils';

import { createLiteFetchClient } from './fetch-frog';

export { formdataBodySerializer, createLiteFetchClient };

export type {
	ExtractResponse,
	ExtractBody,
	ExtractPathParams,
	ExtractQueryParams,
	ExtractLitePathParams,
	ExtractLiteQueryParams,
};
