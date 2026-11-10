import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
	const body = await readBody<{ name: string }>(event);
	return { id: 1, name: body.name };
});
