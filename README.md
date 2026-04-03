<div align="center">
    <center>
        <img width="120" height="120" src="./assets/FetchFrog.png" alt="fetch frog" align="center">
    </center>
</div>

<div align="center">
    <center>
        <h1 align="center"><b>Fetch Frog</b></h1>
    </center>
    <center>
        <p align="center">Type safe api clients using OpenApi Specifications</p>
    </center>
</div>

## Framework Integrations

- **[Nuxt](./packages/nuxt/README.md)** - SSR-ready reactive fetching with `useFetch` integration
- **[Svelte](./packages/svelte/README.md)** - Svelte and SvelteKit optimized implementation _(beta)_

## Usage

### Single schema

```bash
pnpm fetch-frog generate schema.yaml -o schema.d.ts

# schema.yaml -> schema.ts
```

Supports both json, yml, urls and local file paths

For the full list of options, see [openapi-ts.pages.dev/cli](https://openapi-ts.pages.dev/cli)

## Using the fetch client

```ts
// src/lib/apiClient.ts
import { createFetchClient } from "fetch-frog";
import type { paths } from "$lib/types/api/v1"; // generated api types

export const apiClient = createFetchClient<paths>(
	"https://petstore3.swagger.io/api/v3",
	{},
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

This uses [ofetch](https://github.com/unjs/ofetch) under the hood.

## Handling formdata

Fetch Frog provides a `formdataBodySerializer` util function to convert flat objects into formdata while keeping the object type.

```ts
import { apiClient } from "$lib/apiClient";
import { formdataBodySerializer } from "fetch-frog";

const { data } = await apiClient("/pet/{petId}/uploadImage", {
	path: {
		petId: "frog",
	},
	method: "POST",
	body: formdataBodySerializer({
		additionalMetadata: "string",
		file: new File([""], "frog.png", { type: "image/png" }),
	}),
});
```

```ts
import { apiClient } from "$lib/apiClient";
import { formdataBodySerializer } from "fetch-frog";

const { data } = await apiClient("/auth/login", {
	method: "POST",
	body: formdataBodySerializer({
		username: "string",
		password: "string",
	}),
});
```

### Automatic FormData conversion

Fetch Frog provides a `containsFileOrBlob` utility that can detect when your request body contains File or Blob objects, enabling automatic conversion to FormData.

```ts
import { containsFileOrBlob, formdataBodySerializer } from "fetch-frog";

const requestBody = {
	name: "Profile picture",
	file: new File([""], "avatar.jpg", { type: "image/jpeg" }),
	metadata: "user avatar",
};

// Check if the body contains files/blobs
if (containsFileOrBlob(requestBody)) {
	const { data } = await apiClient("/user/avatar", {
		method: "POST",
		body: formdataBodySerializer(requestBody), // convert to FormData while preserving type
	});
}
```

> [!NOTE]
> If you're using a framework like Nuxt or Svelte, consider using the framework-specific implementations of `containsFileOrBlob` and `formdataBodySerializer`. See [Framework Integrations](#framework-integrations) for more details.

## Examples

An example for creating a reusable wrapper composable, useful for authentication headers for example, can be found in [examples/composable-wrapper](./example/README.md#composable-wrapper)

Storing the body / path- or query parameters / response with types requires extracting a type from the generated openapi ts definitions. Some type helpers are exposed from fetch-frog to help with this: `ExtractResponse, ExtractBody, ExtractQueryParams, ExtractPathParams` where QueryParams and PathParams are reactive to help with UseFetch. For example usage, see [examples/type-extraction-helpers](./example/README.md#type-extraction-helpers)

## Cli tools

### Convert schema version

Convert a schema from 1.x or 2.x to 3.0.1 using swagger2openapi

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

- [openapi-ts](https://github.com/openapi-ts/openapi-typescript)
- [enkot/nuxt-open-fetch](https://github.com/enkot/nuxt-open-fetch)
