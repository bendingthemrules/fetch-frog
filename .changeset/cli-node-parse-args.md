---
"fetch-frog": minor
---

Replace `yargs-parser` with Node's built-in `util.parseArgs` in the CLI. Unknown flags now throw an error, and Node >= 20 is required.
