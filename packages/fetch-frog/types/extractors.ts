export type ExtractResponse<
	Paths extends Record<string, any>,
	Url extends keyof Paths,
	Method extends keyof Paths[Url] = 'get',
	StatusCode extends keyof Paths[Url][Method]['responses'] = 200,
	ContentType extends 'application/json' | 'application/xml' = 'application/json'
> =
	Paths[Url] extends Record<
		Method,
		{
			responses: Record<
				StatusCode,
				{
					content: Record<ContentType, infer ResponseType>;
				}
			>;
		}
	>
		? ResponseType
		: never;

export type ExtractBody<
	Paths extends Record<string, any>,
	Url extends keyof Paths,
	Method extends keyof Paths[Url] = 'post'
> =
	Paths[Url] extends Record<
		Method,
		{
			requestBody?: {
				content: Record<string, infer BodyContent>;
			};
		}
	>
		? BodyContent
		: never;

export type ExtractPathParams<
	Paths extends Record<string, any>,
	Url extends keyof Paths,
	Method extends keyof Paths[Url] = 'get'
> =
	Paths[Url] extends Record<
		Method,
		{
			parameters: {
				path: infer PathContent;
			};
		}
	>
		? PathContent
		: never;

export type ExtractQueryParams<
	Paths extends Record<string, any>,
	Url extends keyof Paths,
	Method extends keyof Paths[Url] = 'get'
> =
	Paths[Url] extends Record<
		Method,
		{
			parameters: {
				query?: infer QueryContent;
			};
		}
	>
		? QueryContent
		: never;
