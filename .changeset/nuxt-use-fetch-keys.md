---
'@fetch-frog/nuxt': patch
---

Let Nuxt generate `useFetch` cache keys instead of building them by hand. Fixes three bugs: a reactive path param changing one caller's data could overwrite another caller's data, requests with different bodies shared a key, and the caller's `options` object was mutated with a generated `key`. Explicit `key` options are unaffected; auto-generated keys now use Nuxt's format.
