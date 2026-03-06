#!/usr/bin/env node

import parser from 'yargs-parser';

import convert from './commands/convert.js';
import generate from './commands/generate.js';

/** @type {Record<string, import('./types').Command>} */
const commands = {
	convert,
	generate
};

const timeStart = performance.now();

/** @type {string[]} */
const [, , ...args] = process.argv;

const flags = parser(args, {
	string: ['input', 'output'],
	alias: {
		input: ['i'],
		output: ['o']
	}
});

async function main() {
	const command = flags['_'].shift();

	if (!command) {
		throw new Error('No command specified');
	}

	const commandFn = commands[command];

	if (!commandFn) {
		throw new Error('Unknown command');
	}

	await commandFn(flags, args);
}

main().then(() => {
	const timeEnd = performance.now();
	console.info(`Finished in ${Math.round(timeEnd - timeStart)}ms`);
	process.exit(0);
});
