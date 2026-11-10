import { fileURLToPath } from 'node:url';
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
	compatibilityDate: '2025-01-01',
	// Import the package source the same way an app imports the published package.
	alias: { '@fetch-frog/nuxt': fileURLToPath(new URL('../../../index.ts', import.meta.url)) }
});
