---
'@fetch-frog/nuxt': minor
---

**Breaking:** drop Nuxt 3 support, as Nuxt 3 is end-of-life. The `nuxt` peer dependency is now `^4.0.0`.

Also fixes a type error in `createUseFetchClient` with Nuxt 4.6+, where Nuxt's `PickFrom` type changed.
