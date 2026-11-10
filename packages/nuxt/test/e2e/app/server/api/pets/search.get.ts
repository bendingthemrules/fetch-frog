import { defineEventHandler, getQuery } from 'h3';
import type { operations, components } from '../../../api';

type Query = operations['searchPets']['parameters']['query'];

export default defineEventHandler((event) => {
	const { q } = getQuery<Query>(event);
	return {
		q,
		results: [{ id: q.length, name: `Result for ${q}` }]
	} satisfies components['schemas']['SearchResult'];
});
