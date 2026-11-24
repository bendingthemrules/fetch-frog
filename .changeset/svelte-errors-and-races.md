---
'@fetch-frog/svelte': patch
---

`createReactiveApi` no longer gets stuck in `status: 'loading'` when the request function throws or rejects: the error is now stored in `error` with `status: 'error'`, and awaiting the API resolves with that state instead of rejecting. A slow older response can no longer overwrite a newer one, and `refresh()` resolves once the newest request has settled. The published package no longer includes the demo petstore types and test helpers.
