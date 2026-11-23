import fs from 'node:fs';
import openapiTS, { astToString } from 'openapi-typescript';
import { loadAsOpenApi3 } from '../utils.js';

/** @type {import('../types').Command} */
export default async function ({ input, output }) {
	const types = astToString(await openapiTS(await loadAsOpenApi3(input)));

	console.info('Writing result to:', { outputPath: output });
	fs.writeFileSync(output, types, 'utf8');
}
