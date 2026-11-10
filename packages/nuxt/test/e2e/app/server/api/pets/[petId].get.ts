import { createError, defineEventHandler, getRouterParam } from 'h3';
import type { components } from '../../../api';

type Schemas = components['schemas'];

export default defineEventHandler((event) => {
	const id = Number(getRouterParam(event, 'petId'));
	if (id === 404)
		throw createError({
			statusCode: 404,
			data: { message: 'Pet not found' } satisfies Schemas['NotFound']
		});
	return { id, name: `Pet ${id}` } satisfies Schemas['Pet'];
});
