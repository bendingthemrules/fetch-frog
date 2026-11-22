---
'fetch-frog': minor
'@fetch-frog/nuxt': minor
---

Add a `bodySerializer` option, per request or as a client default, with built-in `formdataSerializer`, `urlencodedSerializer` and `jsonSerializer`. The body stays typed against the schema and is only serialized right before the request is sent. In Nuxt the body is serialized inside a `computed`, so refs inside it still trigger a refetch.

The serializers skip `undefined`/`null` values (previously sent as the strings `"undefined"`/`"null"`), send dates as ISO strings (previously dropped), and key arrays of objects as `items[0].name` (previously sent as `"[object Object]"`). The deprecated `formdataBodySerializer` now uses the same rules.

`containsFileOrBlob` is now exported from `fetch-frog` as documented, and `@fetch-frog/nuxt` re-exports the serializers and `containsFileOrBlob`. The core `FetchClient` type drops an unused `PickKeys` type parameter.
