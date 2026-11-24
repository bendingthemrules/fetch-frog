import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { expect, it, describe } from 'vitest';
import { isUrl } from '../bin/utils.js';

describe('cli', () => {
	it('should generate open api spec v2 types', () => {
		const currentDir = import.meta.dirname;
		const outputPath = `${currentDir}/output.d.ts`;
		const binPath = path.resolve(currentDir, '../bin/script.js');

		try {
			fs.rmSync(outputPath, { force: true });

			const output = execSync(
				`node ${binPath} generate ${currentDir}/openApi.v2.json -o ${outputPath}`
			).toString();
			console.log(output);

			expect(fs.existsSync(outputPath)).toBe(true);
		} catch (e) {
			console.error(e);
			expect(true).toBe(false);
		} finally {
			fs.rmSync(outputPath, { force: true });
		}
	});

	it('should generate open api spec v3 types', () => {
		const currentDir = import.meta.dirname;
		const outputPath = `${currentDir}/output.d.ts`;
		const binPath = path.resolve(currentDir, '../bin/script.js');

		try {
			fs.rmSync(outputPath, { force: true });

			const output = execSync(
				`node ${binPath} generate ${currentDir}/openApi.v3.json -o ${outputPath}`
			).toString();
			console.log(output);

			expect(fs.existsSync(outputPath)).toBe(true);
		} catch (e) {
			console.error(e);
			expect(true).toBe(false);
		} finally {
			fs.rmSync(outputPath, { force: true });
		}
	});

	describe('help and usage errors', () => {
		const currentDir = import.meta.dirname;
		const binPath = path.resolve(currentDir, '../bin/script.js');

		function run(...args: string[]) {
			const res = spawnSync('node', [binPath, ...args], { encoding: 'utf8' });
			return { code: res.status, stdout: res.stdout, stderr: res.stderr };
		}

		it.each([['--help'], ['-h'], ['help']])('%s prints usage with all commands', (flag) => {
			const { code, stdout } = run(flag);

			expect(code).toBe(0);
			expect(stdout).toContain('Usage:');
			expect(stdout).toMatch(/generate\s+Generate TypeScript types/);
			expect(stdout).toMatch(/convert\s+Convert a Swagger 2\.0 schema/);
			expect(stdout).toContain('-o, --output');
		});

		it.each([
			['generate', '--help'],
			['help', 'generate'],
			['convert', '-h']
		])('%s %s prints command help', (a, b) => {
			const command = a === 'help' ? b : a;
			const { code, stdout } = run(a, b);

			expect(code).toBe(0);
			expect(stdout).toContain(`fetch-frog ${command} <input>`);
			expect(stdout).toContain('Examples:');
		});

		it('--version prints the package version', () => {
			const pkg = JSON.parse(fs.readFileSync(path.resolve(currentDir, '../package.json'), 'utf8'));
			const { code, stdout } = run('--version');

			expect(code).toBe(0);
			expect(stdout.trim()).toBe(pkg.version);
		});

		it.each([
			[[], 'No command specified', 'fetch-frog --help'],
			[
				['bogus'],
				'Unknown command "bogus". Available commands: generate, convert',
				'fetch-frog --help'
			],
			[['generate', '--nope'], 'Unknown option "--nope"', 'fetch-frog --help'],
			[['generate'], 'No input file or URL specified', 'fetch-frog generate --help'],
			[['generate', 'a.yaml'], 'No output file specified', 'fetch-frog generate --help'],
			[
				['generate', 'a.yaml', 'b.yaml', '-o', 'o.ts'],
				'Unexpected argument "b.yaml"',
				'fetch-frog generate --help'
			],
			[
				['convert', 'a.yaml', '-i', 'b.yaml', '-o', 'o.json'],
				'either as an argument or with --input',
				'fetch-frog convert --help'
			],
			[
				['generate', 'a.yaml', '-o', 'out.json'],
				'Output file must end in .ts',
				'fetch-frog generate --help'
			],
			[
				['convert', 'a.yaml', '-o', 'out.ts'],
				'Output file must end in .json',
				'fetch-frog convert --help'
			]
		])('%j fails with a usage hint', (args, message, hint) => {
			const { code, stderr } = run(...args);

			expect(code).toBe(1);
			expect(stderr).toContain(message);
			expect(stderr).toContain(`Run "${hint}" for usage.`);
		});

		it('accepts the input via -i', () => {
			const outputPath = `${currentDir}/output-input-flag.d.ts`;
			try {
				const { code } = run('generate', '-i', `${currentDir}/openApi.v3.json`, '-o', outputPath);

				expect(code).toBe(0);
				expect(fs.existsSync(outputPath)).toBe(true);
			} finally {
				fs.rmSync(outputPath, { force: true });
			}
		});

		it('converts Swagger 2.0 to OpenAPI 3.0.1 JSON', () => {
			const outputPath = `${currentDir}/output-convert.json`;
			try {
				const { code } = run('convert', `${currentDir}/openApi.v2.json`, '-o', outputPath);

				expect(code).toBe(0);
				expect(JSON.parse(fs.readFileSync(outputPath, 'utf8')).openapi).toBe('3.0.1');
			} finally {
				fs.rmSync(outputPath, { force: true });
			}
		});
	});

	describe('isUrl', () => {
		it.each([
			['https://example.com/openapi.json', true],
			['http://127.0.0.1:8000/openapi.json', true],
			['schema.yaml', false],
			['./schemas/api.json', false],
			['C:/schemas/api.yaml', false],
			['C:\\schemas\\api.yaml', false],
			['file:///tmp/api.yaml', false]
		])('%s -> %s', (input, expected) => {
			expect(isUrl(input)).toBe(expected);
		});
	});
});
