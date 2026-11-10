---
'@fetch-frog/nuxt': minor
---

**Breaking:** the `nuxt` peer dependency is now `^4.6.1`. Nuxt 3 (end-of-life) and Nuxt 4.0–4.6.0 are no longer supported.

`createUseFetchClient`'s types now use Nuxt's own `PickFrom` and `KeysOf` helpers (exported from `nuxt/app` since Nuxt 4.6.1), so the `data` type always matches what Nuxt's `useFetch` returns. This also fixes a type error with Nuxt 4.6+.

**Breaking (types):** `data` and `error` from `createUseFetchClient` no longer include `null`, matching Nuxt 4, which uses `undefined` for unset values. `error` is now `ErrorT | undefined` and the default for `data` is `undefined`. Replace checks like `error.value === null` with `!error.value` or `=== undefined`.
