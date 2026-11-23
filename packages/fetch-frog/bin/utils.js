import converter from 'swagger2openapi';

/**
 * Whether the input should be fetched rather than read from disk.
 * Only http(s) counts: `new URL()` also accepts Windows paths like `C:/api.yaml`.
 * @param {string} string
 */
export function isUrl(string) {
	return URL.canParse(string) && ['http:', 'https:'].includes(new URL(string).protocol);
}

/**
 * Read a schema from a file or URL and return it as OpenAPI 3.
 * Swagger 2.0 is converted to OpenAPI 3.0.1; OpenAPI 3 input passes through.
 * @param {string} input Path or http(s) URL to a JSON or YAML schema
 */
export async function loadAsOpenApi3(input) {
	console.info('Converting:', { inputPath: input });

	/** @type {Partial<import("swagger2openapi").ConvertInputOptions>} */
	const options = { targetVersion: '3.0.1' };

	const result = await (isUrl(input)
		? converter.convertUrl(input, options)
		: converter.convertFile(input, options));

	return result.openapi;
}
