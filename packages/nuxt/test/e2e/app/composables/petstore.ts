import { createUseFetchClient } from '@fetch-frog/nuxt';
import type { paths } from '../api';

export const petstore = createUseFetchClient<paths>('/api', {});
