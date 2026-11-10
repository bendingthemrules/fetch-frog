import { createError, defineEventHandler, getRouterParam } from 'h3';

export default defineEventHandler((event) => {
	const id = Number(getRouterParam(event, 'petId'));
	if (id === 404) throw createError({ statusCode: 404, data: { message: 'Pet not found' } });
	return { id, name: `Pet ${id}` };
});
