# Example of generated files

Examples from swagger petstore: https://petstore3.swagger.io/

## Setup

1. `cd example`
2. Download swagger petstore example yaml, convert it to openapi v3.0.1 and generate types `petstore.d.ts`: `npx fetch-frog generate "https://petstore.swagger.io/v2/swagger.yaml" -o petstore.d.ts`

If you only need to convert a `.yaml` or `.json` the schema to openapi v3.0.1, you can use `npx fetch-frog convert "https://petstore.swagger.io/v2/swagger.yaml" -o swagger.json`

## Type extraction helpers

```ts
// POST /pet
type CreatePetBody = ExtractBody<paths, "/pet", "post">;
// type CreatePetBody = {
//     id?: number | undefined;
//     name: string;
//     ...
// }

// GET /pet/findByStatus?status=available
type PetQuery = ExtractQueryParams<paths, "/pet/findByStatus", "get">;
// type PetQuery = {
//     status: ("available" | "pending" | "sold")[] | ("available" | "pending" | "sold" | Ref<"available" | "pending" | "sold">)[] | Ref<("available" | "pending" | "sold")[]>;
// }

// GET /pet/67321
type PetParams = ExtractPathParams<paths, "/pet/{petId}", "get">;
// type PetParams = {
//     petId: number | Ref<number>;
// }
```

ExtractResponse defaults to 'application/json', but accepts an optional fourth type parameter:

```ts
// GET /pet/67321
type PetJson = ExtractResponse<paths, "/pet/{petId}", "get">;
type PetXml = ExtractResponse<paths, "/pet/{petId}", "get", "application/xml">;
// type Pet = {
//     id?: number | undefined;
//     category?: {
//         id?: number | undefined;
//         name?: string | undefined;
//     } | undefined;
//     name: string;
//     photoUrls: string[];
//     tags?: {
//         id?: number | undefined;
//         name?: string | undefined;
//     }[] | undefined;
//     status?: "available" | ... 2 more ... | undefined;
// }
```
