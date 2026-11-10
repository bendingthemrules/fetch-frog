# fetch-frog

## 0.2.0-beta.0

### Minor Changes

- 17d60db: Replace `yargs-parser` with Node's built-in `util.parseArgs` in the CLI. Unknown flags now throw an error, and Node >= 20 is required.

### Patch Changes

- 00847aa: Declare `typescript` (`^5.0.0 || ^6.0.0`) as a peer dependency. The CLI's code generation (via `openapi-typescript`) uses the TypeScript compiler API, which TypeScript 7 no longer ships, so projects on TypeScript 7 now get a peer warning instead of a runtime crash.

## 0.1.0

### Minor Changes

- 4e8abe1: - Fix path parameter replacement not replacing all occurrences
  - Support nested objects in formdata serializer
  - Improve cache key generation
  - Performance optimizations (early null checks, remove toValue calls)
  - Improve and test Svelte client
  - Add Nuxt functionality tests

### Patch Changes

- 059c4b4: Bump dependencies to address security advisories, including `defu` to fix a prototype-pollution issue.
- 5b029d7: Fix `in: header` parameters being surfaced under `header` instead of `headers`.
- b58e18d: Bump openapi-typescript to v7

## 0.1.0-beta.3

### Patch Changes

- 059c4b4: Bump dependencies to address security advisories, including `defu` to fix a prototype-pollution issue.

## 0.1.0-beta.2

### Patch Changes

- 5b029d7: Fix `in: header` parameters being surfaced under `header` instead of `headers`.

## 0.1.0-beta.1

### Patch Changes

- b58e18d: Bump openapi-typescript to v7

## 0.1.0-beta.0

### Minor Changes

- 4e8abe1: - Fix path parameter replacement not replacing all occurrences
  - Support nested objects in formdata serializer
  - Early null check performance optimization

## 0.0.2

### Patch Changes

- 04529bf: Initial release

## 0.0.2-beta.0

### Patch Changes

- 04529bf: Initial release
