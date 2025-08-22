import type {
	ExtractBody,
	ExtractPathParams,
	ExtractQueryParams,
	ExtractResponse,
} from "../types/extractors";
import type { paths } from "./petstore";

type CreatePetBody = ExtractBody<paths, "/pet", "post">;
type PetQuery = ExtractQueryParams<paths, "/pet/findByStatus", "get">;
type PetParams = ExtractPathParams<paths, "/pet/{petId}", "get">;
type PetJson = ExtractResponse<paths, "/pet/{petId}", "get">;
type PetXml = ExtractResponse<paths, "/pet/{petId}", "get", 200, "application/xml">;
