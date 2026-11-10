---
'fetch-frog': patch
---

Declare `typescript` (`^5.0.0 || ^6.0.0`) as a peer dependency. The CLI's code generation (via `openapi-typescript`) uses the TypeScript compiler API, which TypeScript 7 no longer ships, so projects on TypeScript 7 now get a peer warning instead of a runtime crash.
