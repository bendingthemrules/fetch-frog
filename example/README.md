# Example of generated files

Examples from swagger petstore: https://petstore3.swagger.io/

## Setup

1. `cd example`
2. Download swagger petstore example yaml, convert it to openapi v3.0.1 and generate types `petstore.d.ts`: `npx fetch-frog generate "https://petstore.swagger.io/v2/swagger.yaml" -o petstore.d.ts`

If you only need to convert a `.yaml` or `.json` the schema to openapi v3.0.1, you can use `npx fetch-frog convert "https://petstore.swagger.io/v2/swagger.yaml" -o swagger.json`

## Composable wrapper

Because of how Nuxt/Vue work, if you want to pass default values from a store or plugin for example, you will need to wrap the create function in a function that returns the create function. You wouldn't have access to other composables / stores such as `useRuntimeConfig` otherwise.

```ts
// src/composables/apiClients.ts

import { createUseFetchClient } from "fetch-frog";
import type { paths } from "~/types/api/v1";

export function createApiClient() {
	const { user } = useNuxtApp().$auth;
	const baseUrl = `${useRuntimeConfig().public.apiUrl}/api/v1`;

	return createUseFetchClient<paths>(baseUrl, {
		onRequest: async ({ options }) => {
			options.headers = {
				...options.headers,
				Authorization: `Bearer ${user.value?.accessToken}`,
			};
		},
	});
}
```

```ts
// src/pages/index.vue

const apiClient = createApiClient();
const { data } = await apiClient("/pet/{petId}", {
	path: {
		petId: "frog",
	},
});
```

## Type extraction helpers

```ts
// POST /pet
type CreatePetBody = ExtractBody<paths, "/pet", "post">;
// type CreatePetBody = {
//     id?: number | undefined;
//     name: string;
//     ...
// }

// GET /pet/findByStatus?status=available
type PetQuery = ExtractQueryParams<paths, "/pet/findByStatus", "get">;
// type PetQuery = {
//     status: ("available" | "pending" | "sold")[] | ("available" | "pending" | "sold" | Ref<"available" | "pending" | "sold">)[] | Ref<("available" | "pending" | "sold")[]>;
// }

// GET /pet/67321
type PetParams = ExtractPathParams<paths, "/pet/{petId}", "get">;
// type PetParams = {
//     petId: number | Ref<number>;
// }
```

ExtractResponse defaults to 'application/json', but accepts an optional fourth type parameter:

```ts
// GET /pet/67321
type PetJson = ExtractResponse<paths, "/pet/{petId}", "get">;
type PetXml = ExtractResponse<paths, "/pet/{petId}", "get", "application/xml">;
// type Pet = {
//     id?: number | undefined;
//     category?: {
//         id?: number | undefined;
//         name?: string | undefined;
//     } | undefined;
//     name: string;
//     photoUrls: string[];
//     tags?: {
//         id?: number | undefined;
//         name?: string | undefined;
//     }[] | undefined;
//     status?: "available" | ... 2 more ... | undefined;
// }
```
