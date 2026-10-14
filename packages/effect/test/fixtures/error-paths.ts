// Mirrors the shape openapi-typescript v7 generates for error responses:
// numeric status keys, `4XX`/`5XX` wildcards, `default`, and `content?: never`
// for responses without a body.
export interface ErrorPaths {
	'/pet/{petId}': {
		get: {
			parameters: {
				query?: never;
				header?: never;
				path: { petId: string };
				cookie?: never;
			};
			responses: {
				200: {
					headers: { [name: string]: unknown };
					content: { 'application/json': { id: string; name: string } };
				};
				404: {
					headers: { [name: string]: unknown };
					content: { 'application/json': { message: string } };
				};
				422: {
					headers: { [name: string]: unknown };
					content: { 'application/json': { fields: Record<string, string[]> } };
				};
				'5XX': {
					headers: { [name: string]: unknown };
					content: { 'application/json': { retryAfter: number } };
				};
			};
		};
		delete: {
			parameters: {
				query?: never;
				header?: never;
				path: { petId: string };
				cookie?: never;
			};
			responses: {
				204: {
					headers: { [name: string]: unknown };
					content?: never;
				};
				404: {
					headers: { [name: string]: unknown };
					content?: never;
				};
				default: {
					headers: { [name: string]: unknown };
					content: { 'application/json': { code: string } };
				};
			};
		};
	};
	'/health': {
		get: {
			parameters: {
				query?: never;
				header?: never;
				path?: never;
				cookie?: never;
			};
			responses: {
				200: {
					headers: { [name: string]: unknown };
					content: { 'application/json': { ok: boolean } };
				};
			};
		};
	};
}
