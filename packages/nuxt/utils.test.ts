import { expect, test, describe } from 'vitest';
import { fillPath, unwrapDeep } from './utils';
import { computed, reactive, ref } from 'vue';

// fill path with parameters
describe('fillPath', () => {
	test('should fill path with parameters', () => {
		// Arrange
		const path = '/pet/{petId}/photo/{photoId}';
		const params = {
			petId: 1,
			photoId: 2
		};

		// Act
		const result = fillPath(path, params);

		// Assert
		expect(result).toBe('/pet/1/photo/2');
	});

	test('should fill path with missing parameters', () => {
		// Arrange
		const path = '/pet/{petId}/photo/{photoId}';
		const params = {
			petId: 1
		};

		// Act
		const result = fillPath(path, params);

		// Assert
		expect(result).toBe('/pet/1/photo/{photoId}');
	});

	test('should fill path with extra parameters', () => {
		// Arrange
		const path = '/pet/{petId}/photo/{photoId}';
		const params = {
			petId: 1,
			photoId: 2,
			extra: 3
		};

		// Act
		const result = fillPath(path, params);

		// Assert
		expect(result).toBe('/pet/1/photo/2');
	});

	test('should fill path with no parameters', () => {
		// Arrange
		const path = '/pet/photo';
		const params = {};

		// Act
		const result = fillPath(path, params);

		// Assert
		expect(result).toBe('/pet/photo');
	});

	test('should fill path with computed parameters', () => {
		// Arrange
		const path = '/pet/{petId}/photo/{photoId}';
		const params = computed(() => ({
			petId: 1,
			photoId: 2
		}));

		// Act
		const result = fillPath(path, params);

		// Assert
		expect(result).toBe('/pet/1/photo/2');
	});

	test('should fill path with reactive parameters', () => {
		// Arrange
		const path = '/user/{userId}/settings/{settingId}';
		const params = reactive({
			userId: ref('123'),
			settingId: computed(() => 'theme')
		});

		// Act
		const result = fillPath(path, params);

		// Assert
		expect(result).toBe('/user/123/settings/theme');
	});

	test('should fill path with mixed ref and static parameters', () => {
		// Arrange
		const path = '/api/{version}/users/{id}/posts/{postId}';
		const userId = ref(42);
		const params = {
			version: 'v1',
			id: userId,
			postId: computed(() => 'latest')
		};

		// Act
		const result = fillPath(path, params);

		// Assert
		expect(result).toBe('/api/v1/users/42/posts/latest');
	});
});

describe('unwrapDeep', () => {
	test('resolves a ref body and refs nested inside it', () => {
		const file = new File(['x'], 'a.txt');
		const at = new Date(0);
		const body = ref({ name: ref('frog'), tags: [ref('a'), 'b'], meta: { file, at } });

		expect(unwrapDeep(body)).toEqual({ name: 'frog', tags: ['a', 'b'], meta: { file, at } });
	});

	test('resolves a getter body and reactive objects', () => {
		const state = reactive({ name: 'frog' });

		expect(unwrapDeep(() => ({ state }))).toEqual({ state: { name: 'frog' } });
	});

	test('keeps files and dates as-is', () => {
		const file = new File(['x'], 'a.txt');
		const out = unwrapDeep({ file }) as { file: File };

		expect(out.file).toBe(file);
	});
});
