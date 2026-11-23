#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

import convert from './commands/convert.js';
import generate from './commands/generate.js';

/**
 * @typedef {object} CommandEntry
 * @property {import('./types').Command} run
 * @property {string} summary One line, shown in the command list
 * @property {string} usage
 * @property {string} outputExtension Required extension of the output file
 * @property {string} details Shown by `fetch-frog <command> --help`
 * @property {string[]} examples
 */

/** @type {Record<string, CommandEntry>} */
const commands = {
	generate: {
		run: generate,
		summary: 'Generate TypeScript types from an OpenAPI or Swagger schema',
		usage: 'fetch-frog generate <input> -o <output.ts>',
		outputExtension: '.ts',
		details:
			'Generates types with openapi-typescript. Swagger 2.0 input is converted to\nOpenAPI 3.0.1 first.',
		examples: [
			'fetch-frog generate schema.yaml -o schema.d.ts',
			'fetch-frog generate https://example.com/openapi.json -o schema.d.ts'
		]
	},
	convert: {
		run: convert,
		summary: 'Convert a Swagger 2.0 schema to OpenAPI 3.0.1',
		usage: 'fetch-frog convert <input> -o <output.json>',
		outputExtension: '.json',
		details: 'OpenAPI 3 input is written out unchanged.',
		examples: ['fetch-frog convert swagger.yaml -o openapi.json']
	}
};

const OPTIONS_HELP = `Options:
  -i, --input <path|url>  Schema to read; same as passing <input> as an argument
  -o, --output <path>     File to write, relative to the current directory
  -h, --help              Show help
  -v, --version           Show the version number`;

const INPUT_HELP = `<input> is a local file or an http(s) URL, in JSON or YAML.`;

function mainHelp() {
	const width = Math.max(...Object.keys(commands).map((name) => name.length));
	const list = Object.entries(commands)
		.map(([name, c]) => `  ${name.padEnd(width)}  ${c.summary}`)
		.join('\n');

	return `fetch-frog - type safe API clients from OpenAPI schemas

Usage:
  fetch-frog <command> <input> -o <output>

Commands:
${list}

${INPUT_HELP}

${OPTIONS_HELP}

Run "fetch-frog <command> --help" for details and examples.`;
}

/** @param {string} name */
function commandHelp(name) {
	const c = commands[name];
	return `${c.summary}

Usage:
  ${c.usage}

${c.details} The output file must end in ${c.outputExtension}.
${INPUT_HELP}

${OPTIONS_HELP}

Examples:
${c.examples.map((e) => `  ${e}`).join('\n')}`;
}

function version() {
	const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
	return pkg.version;
}

/** An error the user can fix; printed with a pointer to the relevant help. */
class UsageError extends Error {
	/**
	 * @param {string} message
	 * @param {string} [command] Point to this command's help instead of the general help
	 */
	constructor(message, command) {
		super(message);
		this.command = command;
	}
}

/**
 * @param {string[]} argv
 * @returns {Promise<boolean>} whether a command ran (as opposed to printing help)
 */
async function main(argv) {
	let parsed;
	try {
		parsed = parseArgs({
			args: argv,
			allowPositionals: true,
			options: {
				input: { type: 'string', short: 'i' },
				output: { type: 'string', short: 'o' },
				help: { type: 'boolean', short: 'h' },
				version: { type: 'boolean', short: 'v' }
			}
		});
	} catch (error) {
		// parseArgs' own message suggests "--" tricks, which isn't helpful here
		const option = /** @type {Error} */ (error).message.match(/Unknown option '([^']+)'/)?.[1];
		throw new UsageError(
			option ? `Unknown option "${option}"` : /** @type {Error} */ (error).message
		);
	}

	const { values, positionals } = parsed;
	let command = positionals.shift();

	if (values.version) {
		console.info(version());
		return false;
	}

	// `fetch-frog help [command]` is the same as `fetch-frog [command] --help`
	if (command === 'help') {
		command = positionals.shift();
		values.help = true;
	}

	if (!command) {
		if (values.help) {
			console.info(mainHelp());
			return false;
		}
		throw new UsageError('No command specified');
	}

	const entry = commands[command];

	if (!entry) {
		throw new UsageError(
			`Unknown command "${command}". Available commands: ${Object.keys(commands).join(', ')}`
		);
	}

	if (values.help) {
		console.info(commandHelp(command));
		return false;
	}

	if (values.input !== undefined && positionals.length > 0) {
		throw new UsageError('Pass the input either as an argument or with --input, not both', command);
	}

	const [input = values.input, unexpected] = positionals;

	if (unexpected !== undefined) {
		throw new UsageError(`Unexpected argument "${unexpected}"`, command);
	}
	if (!input) {
		throw new UsageError('No input file or URL specified', command);
	}
	if (!values.output) {
		throw new UsageError('No output file specified (-o, --output)', command);
	}
	if (!values.output.endsWith(entry.outputExtension)) {
		throw new UsageError(`Output file must end in ${entry.outputExtension}`, command);
	}

	await entry.run({ input, output: path.resolve(process.cwd(), values.output) });
	return true;
}

const timeStart = performance.now();

main(process.argv.slice(2))
	.then((ranCommand) => {
		if (ranCommand) {
			console.info(`Finished in ${Math.round(performance.now() - timeStart)}ms`);
		}
		process.exit(0);
	})
	.catch((error) => {
		console.error(`Error: ${error.message}`);
		if (error instanceof UsageError) {
			const target = error.command ? ` ${error.command}` : '';
			console.error(`Run "fetch-frog${target} --help" for usage.`);
		}
		process.exit(1);
	});
