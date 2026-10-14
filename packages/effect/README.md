# Fetch Frog Effect

[Effect](https://effect.website) integration for [fetch-frog](https://github.com/bendingthemrules/fetch-frog).

```bash
pnpm add @fetch-frog/effect effect
```

### Creating a client

```ts
import { createEffectClient } from '@fetch-frog/effect';
import type { paths } from '$lib/types/api/v1'; // generated api types

export const apiClient = createEffectClient<paths>('https://petstore3.swagger.io/api/v3', {});
```

Calls return an `Effect` instead of a promise. Request options are type checked against the spec, just like `createFetchClient`.

```ts
// Effect<Pet, ResponseError<...> | NetworkError>
const pet = apiClient('/pet/{petId}', { path: { petId: 'frog' } });
```

- `ResponseError`: the API answered with a non-2xx status. Has `status`, `body` and `cause` (the ofetch error).
- `NetworkError`: there was no response, e.g. connection refused or DNS failure.

Interrupting the Effect (for example with `Effect.timeout`) aborts the request.

### Handling error statuses

`catchResponseError` recovers from a `ResponseError` by its status. Every status documented for the operation needs a handler, plus `otherwise` when the spec has no `default`. When the spec documents a new status, it's a type error until you handle it.

```ts
import { Effect } from 'effect';
import { catchResponseError } from '@fetch-frog/effect';

// Effect<Pet | null, NetworkError | NotFound>
const pet = apiClient('/pet/{petId}', { path: { petId: 'frog' } }).pipe(
	catchResponseError({
		400: (e) => Effect.die(e),
		404: (e) => Effect.fail(new NotFound(e.body.message)), // body typed from the spec's 404 response
		otherwise: () => Effect.succeed(null)
	})
);
```

Handlers are picked by exact status, then `4XX`/`5XX`, then `default`, then `otherwise`, and their results are merged into the returned Effect. `NetworkError` stays in the error channel. It can also be called data-first: `catchResponseError(effect, handlers)`.
