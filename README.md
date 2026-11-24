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
- **[Svelte](./packages/svelte/README.md)** - Svelte and SvelteKit optimized implementation

## Usage

### Single schema

```bash
npx fetch-frog generate schema.yaml -o schema.d.ts
# or
pnpm fetch-frog generate schema.yaml -o schema.d.ts

# schema.yaml -> schema.d.ts
```

The input can be a local file or a URL, in JSON or YAML, using OpenAPI 3.x or Swagger 2.0 (converted automatically). See [Cli tools](#cli-tools) for details.

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

## Sending FormData and other formats

Bodies are sent as JSON by default. Pass a `bodySerializer` to send something else; the `body` stays typed against your schema until the request is made.

```ts
import { apiClient } from "$lib/apiClient";
import { formdataSerializer } from "fetch-frog";

const { data } = await apiClient("/pet/{petId}/uploadImage", {
	path: {
		petId: "frog",
	},
	method: "POST",
	body: {
		additionalMetadata: "string",
		file: new File([""], "frog.png", { type: "image/png" }),
	},
	bodySerializer: formdataSerializer,
});
```

`formdataSerializer`, `urlencodedSerializer` and `jsonSerializer` are built in, and you can set a default on the client. The Nuxt integration accepts the same option. See the [fetch-frog README](./packages/fetch-frog/README.md#request-body-serializers) for key formats, custom serializers and `containsFileOrBlob`.

## Examples

An example for creating a reusable wrapper composable, useful for authentication headers for example, can be found in the [Nuxt README](./packages/nuxt/README.md#composable-wrapper)

Storing the body / path- or query parameters / response with types requires extracting a type from the generated openapi ts definitions. Some type helpers are exposed from fetch-frog to help with this: `ExtractResponse, ExtractBody, ExtractQueryParams, ExtractPathParams`. For example usage, see [examples/type-extraction-helpers](./example/README.md#type-extraction-helpers)

## CLI tools

```bash
fetch-frog <command> <input> -o <output>
```

- `<input>`: path or URL (`http://` / `https://`) to a JSON or YAML schema
- `-o, --output` (required): output file, resolved relative to the current directory
- `-i, --input`: the input, as an alternative to passing it as an argument
- `-h, --help`: list the commands, or show details and examples for one (`fetch-frog generate --help`)
- `-v, --version`: print the version

### Generate

Generate TypeScript types from a schema using [openapi-typescript](https://openapi-ts.pages.dev). Swagger 2.0 input is converted to OpenAPI 3.0.1 first, so no separate `convert` step is needed. The output file must end in `.ts`.

<!-- https://petstore3.swagger.io/ -->

```bash
fetch-frog generate v3.schema.json -o schema.d.ts
fetch-frog generate "http://127.0.0.1:8000/api/v1/openapi.json" -o schema.d.ts
```

### Convert schema version

Convert a Swagger 2.0 schema to OpenAPI 3.0.1 using [swagger2openapi](https://github.com/Mermade/oas-kit). The output file must end in `.json`.

<!-- https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml -->

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

## Credits

- [openapi-ts](https://github.com/openapi-ts/openapi-typescript)
- [enkot/nuxt-open-fetch](https://github.com/enkot/nuxt-open-fetch)
