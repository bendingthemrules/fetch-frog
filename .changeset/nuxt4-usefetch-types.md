---
"@fetch-frog/nuxt": patch
---

Fix Nuxt 4 type compatibility in `UseFetchClient`: widen the `AsyncData` error type to `ErrorT | null | undefined`. Nuxt 4's `useFetch` resolves the error as `ErrorT | undefined` (Nuxt 3 used `| null`), so the hand-declared `ErrorT | null` return no longer matched the implementation and broke type-checking. Keeps Nuxt 3 + 4 dual-support (`peerDependencies` already allow `^3 || ^4`).
