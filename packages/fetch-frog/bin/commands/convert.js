import fs from 'node:fs';
import { loadAsOpenApi3 } from '../utils.js';

/** @type {import('../types').Command} */
export default async function ({ input, output }) {
	const openapi = await loadAsOpenApi3(input);

	console.info('Writing result to:', { outputPath: output });
	fs.writeFileSync(output, JSON.stringify(openapi, null, 2), 'utf8');
}
