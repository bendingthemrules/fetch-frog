// Builds test/e2e/app, starts its server and drives it in Chromium.
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { $fetch, createPage, setup, url } from '@nuxt/test-utils/e2e';

await setup({
	rootDir: fileURLToPath(new URL('./app', import.meta.url)),
	browser: true,
	setupTimeout: 300_000
});

/** Open a page, wait for hydration and record every /api request the browser makes. */
async function open(path: string) {
	const page = await createPage();
	page.setDefaultTimeout(5_000);
	const requests: string[] = [];
	page.on('request', (req) => {
		const u = new URL(req.url());
		if (u.pathname.startsWith('/api/')) requests.push(`${req.method()} ${u.pathname}${u.search}`);
	});
	await page.goto(url(path), { waitUntil: 'hydration' });
	return { page, requests };
}

describe('server rendering', () => {
	test('data is in the server-rendered HTML', async () => {
		const html = await $fetch<string>('/pet');
		expect(html).toContain('Pet 1');
	});

	test('hydration reuses the server data instead of fetching again', async () => {
		const { page, requests } = await open('/pet');
		expect(await page.getByTestId('name').textContent()).toBe('Pet 1');
		expect(requests).toEqual([]);
	});

	test('error responses come through as error, without data', async () => {
		const { page, requests } = await open('/missing');
		expect(await page.getByTestId('status').textContent()).toBe('404');
		expect(await page.getByTestId('has-data').textContent()).toBe('no data');
		expect(requests).toEqual([]);
	});
});

describe('reactivity', () => {
	test('changing a path param fetches the new URL', async () => {
		const { page, requests } = await open('/pet');
		await page.getByTestId('next').click();
		await page.getByTestId('name').filter({ hasText: 'Pet 2' }).waitFor();
		expect(requests).toEqual(['GET /api/pets/2']);
	});

	test('changing a query param fetches with the new query', async () => {
		const { page, requests } = await open('/search');
		expect(await page.getByTestId('result').textContent()).toBe('Result for frog');
		await page.getByTestId('q').fill('toad');
		await page.getByTestId('result').filter({ hasText: 'Result for toad' }).waitFor();
		expect(requests).toEqual(['GET /api/pets/search?q=toad']);
	});

	test('changing a reactive body sends the new body', async () => {
		const { page, requests } = await open('/create');
		expect(await page.getByTestId('created').textContent()).toBe('Frog');
		await page.getByTestId('name-input').fill('Toad');
		await page.getByTestId('created').filter({ hasText: 'Toad' }).waitFor();
		expect(requests).toEqual(['POST /api/pets']);
	});

	test("one component's path param change does not affect another", async () => {
		const { page } = await open('/two');
		const a = page.getByTestId('a');
		const b = page.getByTestId('b');
		expect(await b.locator('.name').textContent()).toBe('Pet 1');
		await a.getByRole('button').click();
		await a.locator('.name').filter({ hasText: 'Pet 2' }).waitFor();
		expect(await b.locator('.name').textContent()).toBe('Pet 1');
	});
});

describe('client-side navigation', () => {
	test('navigating to a page fetches in the browser', async () => {
		const { page, requests } = await open('/');
		await page.getByTestId('to-pet').click();
		await page.getByTestId('name').filter({ hasText: 'Pet 1' }).waitFor();
		expect(requests).toEqual(['GET /api/pets/1']);
	});
});
