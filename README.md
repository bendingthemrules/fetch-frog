<div align="center">
    <center>
        <img width="120" height="120" src="assets/FetchFrog.png" alt="fetch frog" align="center">
    </center>
</div>

<div align="center">
    <center>
        <h1 align="center"><b>Fetch Frog</b></h1>
    </center>
    <center>
        <p align="center">Type safe api clients using OpenApi Specs</p>
    </center>
</div>

## Usage

### Single schema

```bash
pnpm fetch-frog generate schema.yaml -o schema.d.ts

# schema.yaml -> schema.ts
```

Supports both json, yml, urls and local file paths

For the full list of options, see [openapi-ts.pages.dev/cli](https://openapi-ts.pages.dev/cli)

## Handling formdata

Fetch frog automaticcaly checks for files and blobs inside the request body and convert the body to formdata if it finds any.

```ts
import { apiClient } from "~/composables/apiClient";

const { data } = await apiClient("/pet/{petId}/uploadImage", {
	path: {
		petId: "frog",
	},
	method: "POST",
	body: {
		additionalMetadata: "string",
		file: new File([""], "frog.png", { type: "image/png" }),
	},
});
```

If you want to manually convert the body to formdata, you can use the `formdataBodySerializer` function.

```ts
import { apiClient } from "~/composables/apiClient";
import { formdataBodySerializer } from "fetch-frog";

const { data } = await apiClient("/auth/login", {
	method: "POST",
	body: formdataBodySerializer({
		username: "string",
		password: "string",
	}),
});
```

## Examples

An example for creating a reusable wrapper composable, useful for authentication headers for example, can be found in [examples/composable-wrapper](./example/README.md#composable-wrapper)

Storing the body / path- or query parameters / response with types requires extracting a type from the generated openapi ts definitions. Some type helpers are exposed from fetch-frog to help with this: `ExtractResponse, ExtractBody, ExtractQueryParams, ExtractPathParams` where QueryParams and PathParams are reactive to help with UseFetch. For example usage, see [examples/type-extraction-helpers](./example/README.md#type-extraction-helpers)

### One-off fetching (ofetch)

```ts
// src/lib/apiClient.ts
import { createFetchClient } from "fetch-frog";
import type { paths } from "~/types/api/v1"; // generated api types

export const apiClient = createFetchClient<paths>(
	"https://petstore3.swagger.io/api/v3",
	{}
);
```

```ts
// src/lib/index.ts
import { apiClient } from "$lib/apiClient";

const { data } = await apiClient("/pet/{petId}", {
	path: {
		petId: "frog",
	},
});

console.log(data);
```

### Reactive fetching with SSR sync (Nuxt useFetch)

```ts
// src/composables/apiClients.ts
import { createUseFetchClient } from "@fetch-frog/nuxt";
import type { paths } from "~/types/api/v1"; // generated api types

export const reactiveApiClient = createUseFetchClient<paths>(
	"https://petstore3.swagger.io/api/v3",
	{}
);
```

```ts
// src/pages/index.vue
import { reactiveApiClient } from "~/composables/apiClient";

const { data } = await reactiveApiClient("/pet/{petId}", {
	path: {
		petId: "frog",
	},
});

console.log(data.value);
```

## Cli tools

### Convert schema version

Convert a schema from 1.x or 2.x to 3.0.1 using the swagger API

<!-- https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml -->

```bash
fetch-frog convert v2.schema.yaml -o v3.schema.json
```

### Generate

Generate types from a schema, uses [openapi-ts.pages.dev/cli](https://openapi-ts.pages.dev/cli) under the hood

<!-- https://petstore3.swagger.io/ -->

```bash
fetch-frog generate v3.schema.json -o schema.d.ts
```

## Credits

-   [openapi-ts](https://github.com/openapi-ts/openapi-typescript)
-   [enkot/nuxt-open-fetch](https://github.com/enkot/nuxt-open-fetch)
