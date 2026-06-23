import { expectTypeOf } from 'vitest';
import type { UseFetchClient } from './types/use-fetch';
import type { paths } from './test/petstore';

// The AsyncData error is widened to include both `null` (Nuxt 3) and `undefined` (Nuxt 4).
declare const client: UseFetchClient<paths>;

// GET with a path param.
const { data: getData, error: getError } = client('/pet/{petId}', { path: { petId: 1 } });

expectTypeOf(getError.value).extract<null>().toEqualTypeOf<null>();
expectTypeOf(getError.value).extract<undefined>().toEqualTypeOf<undefined>();
expectTypeOf(getData).not.toBeAny();

// POST with a request body.
const { data: postData, error: postError } = client('/pet', {
	method: 'POST',
	body: { name: 'doggie', photoUrls: ['https://example.com'] }
});

expectTypeOf(postError.value).extract<null>().toEqualTypeOf<null>();
expectTypeOf(postError.value).extract<undefined>().toEqualTypeOf<undefined>();
expectTypeOf(postData).not.toBeAny();
