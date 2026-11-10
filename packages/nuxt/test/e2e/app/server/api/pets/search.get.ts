import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler((event) => {
	const q = String(getQuery(event).q ?? '');
	return { q, results: [{ id: q.length, name: `Result for ${q}` }] };
});
