---
'@fetch-frog/nuxt': patch
---

Fix type error in `createUseFetchClient` with Nuxt 4.6+, where Nuxt's `PickFrom` type changed. Works across all supported Nuxt 3 and 4 versions.
