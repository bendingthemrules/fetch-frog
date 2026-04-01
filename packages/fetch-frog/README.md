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
        <p align="center">Type safe API clients using OpenAPI Specifications.</p>
    </center>
</div>

## Install

```bash
pnpm add fetch-frog
```

## Usage

### Generate types from an OpenAPI schema

```bash
pnpm fetch-frog generate schema.yaml -o schema.d.ts
```

Supports JSON, YAML, URLs and local file paths. For the full list of options, see [openapi-ts.pages.dev/cli](https://openapi-ts.pages.dev/cli).

### Create a fetch client

```ts
import { createFetchClient } from 'fetch-frog';
import type { paths } from './schema'; // generated api types

const apiClient = createFetchClient<paths>('https://petstore3.swagger.io/api/v3', {});

const { data } = await apiClient('/pet/{petId}', {
	path: {
		petId: 'frog'
	}
});

console.log(data);
```

## Handling FormData

`formdataBodySerializer` converts flat objects into FormData while keeping the object type.

```ts
import { formdataBodySerializer } from 'fetch-frog';

const { data } = await apiClient('/pet/{petId}/uploadImage', {
	path: { petId: 'frog' },
	method: 'POST',
	body: formdataBodySerializer({
		additionalMetadata: 'string',
		file: new File([''], 'frog.png', { type: 'image/png' })
	})
});
```

### Automatic FormData conversion

`containsFileOrBlob` detects when a request body contains File or Blob objects, enabling automatic conversion to FormData.

```ts
import { containsFileOrBlob, formdataBodySerializer } from 'fetch-frog';

const requestBody = {
	name: 'Profile picture',
	file: new File([''], 'avatar.jpg', { type: 'image/jpeg' })
};

if (containsFileOrBlob(requestBody)) {
	const { data } = await apiClient('/user/avatar', {
		method: 'POST',
		body: formdataBodySerializer(requestBody)
	});
}
```

## Type helpers

Type helpers are exported from `fetch-frog` to extract types from generated OpenAPI definitions:

- `ExtractResponse` - Extract the response type from a path
- `ExtractBody` - Extract the request body type
- `ExtractQueryParams` - Extract query parameters
- `ExtractPathParams` - Extract path parameters

## CLI tools

### Generate types

```bash
fetch-frog generate v3.schema.json -o schema.d.ts
```

### Convert schema version

Convert a schema from 1.x or 2.x to 3.0.1:

```bash
fetch-frog convert v2.schema.yaml -o v3.schema.json
```

## Framework integrations

- **[Nuxt](https://github.com/bendingthemrules/fetch-frog/tree/main/packages/nuxt)** - SSR-ready reactive fetching with `useFetch` integration
- **[Svelte](https://github.com/bendingthemrules/fetch-frog/tree/main/packages/svelte)** - SvelteKit optimized implementation _(beta)_

## Credits

- [openapi-ts](https://github.com/openapi-ts/openapi-typescript)
- [enkot/nuxt-open-fetch](https://github.com/enkot/nuxt-open-fetch)
