import { createUseFetchClient } from './use-fetch';

export { createUseFetchClient };
export type { UseFetchClientDefaults } from './types/use-fetch';

// Re-exported so Nuxt users don't need fetch-frog as a direct dependency.
export {
	formdataSerializer,
	urlencodedSerializer,
	jsonSerializer,
	containsFileOrBlob,
	type BodySerializer
} from 'fetch-frog';
