// Hand-written in the shape openapi-typescript generates.
export type Pet = { id: number; name: string };

type Json<T> = { content: { 'application/json': T } };

export type paths = {
	'/pets/{petId}': {
		get: {
			parameters: { path: { petId: number } };
			responses: { 200: Json<Pet>; 404: Json<{ message: string }> };
		};
	};
	'/pets/search': {
		get: {
			parameters: { query: { q: string } };
			responses: { 200: Json<{ q: string; results: Pet[] }> };
		};
	};
	'/pets': {
		post: {
			requestBody: Json<{ name: string }>;
			responses: { 200: Json<Pet> };
		};
	};
};
