import fs from "node:fs";
import { execSync } from "node:child_process";

import { expect, test, describe } from "vitest";

describe("cli", () => {
	test("should generate open api spec v2 types", () => {
		const currentDir = import.meta.dirname;
		const outputPath = `${currentDir}/output.d.ts`;

		try {
			fs.rmSync(outputPath, { force: true });

			const output = execSync(
				`node bin/script.js generate ${currentDir}/openApi.v2.json -o ${outputPath}`
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

	test("should generate open api spec v3 types", () => {
		const currentDir = import.meta.dirname;
		const outputPath = `${currentDir}/output.d.ts`;

		try {
			fs.rmSync(outputPath, { force: true });

			const output = execSync(
				`node bin/script.js generate ${currentDir}/openApi.v3.json -o ${outputPath}`
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
