<div align="center">

![fetch frog](./assets/FetchFrog.png)

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
npx fetch-frog generate schema.yaml -o schema.d.ts
# or
pnpm fetch-frog generate schema.yaml -o schema.d.ts
```

The input can be a local file or a URL, in JSON or YAML, using OpenAPI 3.x or Swagger 2.0 (converted automatically). See [CLI tools](#cli-tools) for details.

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

## Request body serializers

By default bodies are sent as JSON. For other formats, pass a `bodySerializer`. The `body` stays typed against your schema; it's only converted right before the request is sent.

```ts
import { formdataSerializer } from 'fetch-frog';

const { data } = await apiClient('/pet/{petId}/uploadImage', {
	path: { petId: 1 },
	method: 'POST',
	body: { additionalMetadata: 'frog', file },
	bodySerializer: formdataSerializer
});
```

Set it on the client to apply it to every request with a body:

```ts
const apiClient = createFetchClient<paths>(baseUrl, { bodySerializer: formdataSerializer });
```

### Built-in serializers

| Serializer             | Sends             | Content-Type                                          |
| ---------------------- | ----------------- | ----------------------------------------------------- |
| `formdataSerializer`   | `FormData`        | `multipart/form-data` (set by `fetch`, with boundary) |
| `urlencodedSerializer` | `URLSearchParams` | `application/x-www-form-urlencoded`                   |
| `jsonSerializer`       | JSON string       | `application/json`                                    |

`jsonSerializer` matches the default; use it to override a client-wide serializer for a single request.

`formdataSerializer` and `urlencodedSerializer` flatten objects the same way:

| Body                        | Keys                          |
| --------------------------- | ----------------------------- |
| `{ user: { name: 'a' } }`   | `user.name=a`                 |
| `{ tags: ['a', 'b'] }`      | `tags=a`, `tags=b`            |
| `{ items: [{ id: 1 }] }`    | `items[0].id=1`               |
| `{ at: new Date(0) }`       | `at=1970-01-01T00:00:00.000Z` |
| `undefined` / `null` values | skipped                       |

Files and Blobs are sent as-is with `formdataSerializer`. `urlencodedSerializer` throws if the body contains one.

### Custom serializers

A serializer is any function from the body to something `fetch` can send. It receives the operation's body type:

```ts
await apiClient('/pet', {
	method: 'POST',
	body: { name: 'frog', photoUrls: [] },
	bodySerializer: (body) => new URLSearchParams({ name: body.name })
});
```

### Detecting files

`containsFileOrBlob` checks whether a body contains a `File` or `Blob`, for example to pick a serializer:

```ts
import { containsFileOrBlob, formdataSerializer, jsonSerializer } from 'fetch-frog';

await apiClient('/user/avatar', {
	method: 'POST',
	body,
	bodySerializer: containsFileOrBlob(body) ? formdataSerializer : jsonSerializer
});
```

> `formdataBodySerializer` (called on the body directly) still works but is deprecated: it casts FormData to the object type, so hooks reading `options.body` get a FormData typed as a plain object. Use `bodySerializer: formdataSerializer` instead.

## Type helpers

Type helpers are exported from `fetch-frog` to extract types from generated OpenAPI definitions:

- `ExtractResponse` - Extract the response type from a path
- `ExtractBody` - Extract the request body type
- `ExtractQueryParams` - Extract query parameters
- `ExtractPathParams` - Extract path parameters

## CLI tools

```bash
fetch-frog <command> <input> -o <output>
```

- `<input>`: path or URL (`http://` / `https://`) to a JSON or YAML schema
- `-o, --output` (required): output file, resolved relative to the current directory
- `-i, --input`: the input, as an alternative to passing it as an argument
- `-h, --help`: list the commands, or show details and examples for one (`fetch-frog generate --help`)
- `-v, --version`: print the version

### Generate types

Generate TypeScript types using [openapi-typescript](https://openapi-ts.pages.dev). Swagger 2.0 input is converted to OpenAPI 3.0.1 first, so no separate `convert` step is needed. The output file must end in `.ts`.

```bash
fetch-frog generate v3.schema.json -o schema.d.ts
fetch-frog generate "http://127.0.0.1:8000/api/v1/openapi.json" -o schema.d.ts
```

### Convert schema version

Convert a Swagger 2.0 schema to OpenAPI 3.0.1. The output file must end in `.json`.

```bash
fetch-frog convert v2.schema.yaml -o v3.schema.json
```

### Running the CLI

- **npx / pnpm:** `npx fetch-frog generate …` or `pnpm fetch-frog generate …`
- **npm scripts:** `npm run fetch-frog …` won't work, because `npm run` only runs scripts defined in `package.json`. Add a script instead:

  ```json
  {
  	"scripts": {
  		"generate:api": "fetch-frog generate http://127.0.0.1:8000/api/v1/openapi.json -o schema.d.ts"
  	}
  }
  ```

  Then run `npm run generate:api`. If you pass arguments through `npm run`, put them after `--` (`npm run generate:api -- …`), otherwise npm takes flags like `-o` for itself.

## Framework integrations

- **[Nuxt](https://github.com/bendingthemrules/fetch-frog/tree/main/packages/nuxt)** - SSR-ready reactive fetching with `useFetch` integration
- **[Svelte](https://github.com/bendingthemrules/fetch-frog/tree/main/packages/svelte)** - SvelteKit optimized implementation

## Credits

- [openapi-ts](https://github.com/openapi-ts/openapi-typescript)
- [enkot/nuxt-open-fetch](https://github.com/enkot/nuxt-open-fetch)
