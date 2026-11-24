# Fetch Frog Nuxt

Nuxt specific implementation of [fetch-frog](https://github.com/bendingthemrules/fetch-frog).

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

## Sending FormData and other formats

Pass a `bodySerializer` to send something other than JSON. The body can contain refs; it's serialized inside a `computed`, so changing a ref re-sends the request with the new body.

```ts
import { formdataSerializer } from '@fetch-frog/nuxt';

const name = ref('frog');

const { data } = await reactiveApiClient('/pet/{petId}/uploadImage', {
	method: 'POST',
	path: { petId: 1 },
	body: { additionalMetadata: name, file },
	bodySerializer: formdataSerializer
});
```

`formdataSerializer`, `urlencodedSerializer`, `jsonSerializer` and `containsFileOrBlob` are re-exported from `@fetch-frog/nuxt`, so you don't need `fetch-frog` as a direct dependency. A default can be set on the client with `createUseFetchClient(baseUrl, { bodySerializer })`. See the [fetch-frog README](https://github.com/bendingthemrules/fetch-frog/tree/main/packages/fetch-frog#request-body-serializers) for key formats.

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

## Development

The package supports Nuxt 4.6.1 and up (`^4.6.1`). `pnpm test:types` type-checks the package against the Nuxt version in devDependencies via tsconfig.typecheck.json.

`pnpm test` runs both the type-check and the unit tests.
