import fs from 'node:fs';
import path from 'node:path';
import converter from 'swagger2openapi';
import openapiTS from 'openapi-typescript';
import { isUrl } from '../utils.js';

/** @type {import('../types').Command} */
export default async function (flags, _args) {
	if (flags['_'].length === 0) {
		throw new Error('No input file or url specified');
	}

	if (!flags.output) {
		throw new Error('Output file is required');
	}
	if (!flags.output.endsWith('.ts')) {
		throw new Error('Output file must be typescript');
	}

	const inputPath = String(flags['_'][0]);
	const outputPath = path.resolve(process.cwd(), flags.output);

	/**
	 * @type Partial<import("swagger2openapi").ConvertInputOptions>
	 */
	const converterOptions = {
		targetVersion: '3.0.1',
	};

	console.log('Converting:', { inputPath });

	const output = await (isUrl(inputPath)
		? converter.convertUrl(inputPath, converterOptions)
		: converter.convertFile(inputPath, converterOptions));

	const types = await openapiTS(output.openapi);

	console.info('Writing result to:', { outputPath });
	fs.writeFileSync(outputPath, types, 'utf8');
}
