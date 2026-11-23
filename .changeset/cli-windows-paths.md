---
'fetch-frog': patch
---

The CLI no longer treats Windows paths like `C:/schemas/api.yaml` as URLs; only `http://` and `https://` inputs are fetched. A wrong output extension is now reported before any work starts, with a pointer to the command's help.
