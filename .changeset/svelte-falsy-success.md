---
'@fetch-frog/svelte': patch
---

Treat responses with a falsy body (204 No Content, `0`, `false`, `''`) as successful. They were previously reported as `status: 'error'` with `error: null`.
