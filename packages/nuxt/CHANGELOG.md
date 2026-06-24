# @fetch-frog/nuxt

## 0.1.0-beta.2

### Patch Changes

- 1f543b4: Fix Nuxt 4 type compatibility in `UseFetchClient`: widen the `AsyncData` error type to `ErrorT | null | undefined`. Nuxt 4's `useFetch` resolves the error as `ErrorT | undefined` (Nuxt 3 used `| null`), so the hand-declared `ErrorT | null` return no longer matched the implementation and broke type-checking. Keeps Nuxt 3 + 4 dual-support (`peerDependencies` already allow `^3 || ^4`).

## 0.1.0-beta.1

### Patch Changes

- Updated dependencies [b58e18d]
  - fetch-frog@0.1.0-beta.1

## 0.1.0-beta.0

### Minor Changes

- 4e8abe1: - Fix path parameter replacement not replacing all occurrences
  - Support nested objects in formdata serializer
  - Improve cache key generation
  - Performance optimizations (early null checks, remove unnecessary toValue calls)
  - Add functionality tests

### Patch Changes

- Updated dependencies [4e8abe1]
  - fetch-frog@0.1.0-beta.0

## 0.0.2

### Patch Changes

- 04529bf: Initial release
- Updated dependencies [04529bf]
  - fetch-frog@0.0.2

## 0.0.2-beta.0

### Patch Changes

- 04529bf: Initial release
- Updated dependencies [04529bf]
  - fetch-frog@0.0.2-beta.0
