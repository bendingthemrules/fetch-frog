import { defineEventHandler, readBody } from 'h3';
import type { components } from '../../api';

type Schemas = components['schemas'];

export default defineEventHandler(async (event) => {
	const body = await readBody<Schemas['NewPet']>(event);
	return { id: 1, name: body.name } satisfies Schemas['Pet'];
});
