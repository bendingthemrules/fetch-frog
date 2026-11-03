#!/usr/bin/env node

import { parseArgs } from 'node:util';

import convert from './commands/convert.js';
import generate from './commands/generate.js';

/** @type {Record<string, import('./types').Command>} */
const commands = {
	convert,
	generate
};

const timeStart = performance.now();

async function main() {
	const { values, positionals } = parseArgs({
		args: process.argv.slice(2),
		allowPositionals: true,
		options: {
			input: { type: 'string', short: 'i' },
			output: { type: 'string', short: 'o' }
		}
	});

	const command = positionals.shift();

	if (!command) {
		throw new Error('No command specified');
	}

	const commandFn = commands[command];

	if (!commandFn) {
		throw new Error('Unknown command');
	}

	await commandFn(values, positionals);
}

main()
	.then(() => {
		const timeEnd = performance.now();
		console.info(`Finished in ${Math.round(timeEnd - timeStart)}ms`);
		process.exit(0);
	})
	.catch((error) => {
		console.error(error.message);
		process.exit(1);
	});
