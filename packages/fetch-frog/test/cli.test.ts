import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { expect, it, describe } from 'vitest';

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
});
