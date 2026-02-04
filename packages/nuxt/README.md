# Fetch Frog Nuxt

Nuxt specific implementation of fetch-frog.

### Reactive fetching with SSR sync (Nuxt useFetch)

```ts
// src/composables/apiClients.ts
import { createUseFetchClient } from '@fetch-frog/nuxt';
import type { paths } from '~/types/api/v1'; // generated api types

export const reactiveApiClient = createUseFetchClient<paths>(
	'https://petstore3.swagger.io/api/v3',
	{}
);
```

```ts
// src/pages/index.vue
import { reactiveApiClient } from '~/composables/apiClient';

const { data } = await reactiveApiClient('/pet/{petId}', {
	path: {
		petId: 'frog'
	}
});

console.log(data.value);
```

<!-- TODO: recommend to use the basic client if you only need the data once, for example when posting a form -->

## Composable wrapper

Because of how Nuxt/Vue work, if you want to pass default values from a store or plugin for example, you will need to wrap the create function in a function that returns the create function. You wouldn't have access to other composables / stores such as `useRuntimeConfig` otherwise.

```ts
// src/composables/apiClients.ts

import { createUseFetchClient } from 'fetch-frog';
import type { paths } from '~/types/api/v1';

export function createApiClient() {
	const { user } = useNuxtApp().$auth;
	const baseUrl = `${useRuntimeConfig().public.apiUrl}/api/v1`;

	return createUseFetchClient<paths>(baseUrl, {
		onRequest: async ({ options }) => {
			options.headers = {
				...options.headers,
				Authorization: `Bearer ${user.value?.accessToken}`
			};
		}
	});
}
```

```ts
// src/pages/index.vue

const apiClient = createApiClient();
const { data } = await apiClient('/pet/{petId}', {
	path: {
		petId: 'frog'
	}
});
```
