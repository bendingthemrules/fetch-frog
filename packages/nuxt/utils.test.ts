import { expect, test, describe } from 'vitest';
import { fillPath, containsFileOrBlob, formdataBodySerializer } from './utils';
import { computed, reactive, ref } from 'vue';

// turns object into formdata
describe('formdataBodySerializer', () => {
	test('should turn undefined into FormData', () => {
		// Arrange
		const input = undefined;

		// Act
		const result = formdataBodySerializer(input) as FormData;

		// Assert
		expect(result).toBeInstanceOf(FormData);
		expect([...result.keys()].length).toBe(0);
	});

	test('should turn empty object into FormData', () => {
		// Arrange
		const input = {};

		// Act
		const result = formdataBodySerializer(input) as FormData;

		// Assert
		expect(result).toBeInstanceOf(FormData);
		expect([...result.keys()].length).toBe(0);
	});

	test('should turn filled object into FormData', () => {
		// Arrange
		const input = { a: 'b', c: 1 };

		// Act
		const result = formdataBodySerializer(input) as never as FormData;

		// Assert
		expect([...result.keys()].length).toBe(2);
		expect(result.get('a')).toBe('b');
		expect(result.get('c')).toBe('1');
	});

	test('should turn object with array into FormData', () => {
		// Arrange
		const input = { a: 'b', c: ['d', 'f'] };

		// Act
		const result = formdataBodySerializer(input) as never as FormData;
		const c = result.getAll('c');

		// Assert
		expect([...result.keys()].length).toBe(3);
		expect(result.get('a')).toBe('b');
		expect(c).toEqual(['d', 'f']);
	});

	// vue specific tests
	test('should handle ref values', () => {
		// Arrange
		const input = {
			name: ref('test-name'),
			value: ref(42),
		};

		// Act
		const result = formdataBodySerializer(input) as unknown as FormData;

		// Assert
		expect(result).toBeInstanceOf(FormData);
		expect(result.get('name')).toBe('test-name');
		expect(result.get('value')).toBe('42');
	});

	test('should handle computed values', () => {
		// Arrange
		const baseValue = ref('hello');
		const input = {
			computed: computed(() => `${baseValue.value}-computed`),
			static: 'world',
		};

		// Act
		const result = formdataBodySerializer(input) as unknown as FormData;

		// Assert
		expect(result).toBeInstanceOf(FormData);
		expect(result.get('computed')).toBe('hello-computed');
		expect(result.get('static')).toBe('world');
	});

	test('should handle reactive objects', () => {
		// Arrange
		const input = reactive({
			username: 'testuser',
			age: 25,
		});

		// Act
		const result = formdataBodySerializer(input) as unknown as FormData;

		// Assert
		expect(result).toBeInstanceOf(FormData);
		expect(result.get('username')).toBe('testuser');
		expect(result.get('age')).toBe('25');
	});

	test('should handle arrays with ref values', () => {
		// Arrange
		const input = {
			tags: [ref('tag1'), ref('tag2'), 'tag3'],
		};

		// Act
		const result = formdataBodySerializer(input) as unknown as FormData;

		// Assert
		expect(result).toBeInstanceOf(FormData);
		const tags = result.getAll('tags');
		expect(tags).toEqual(['tag1', 'tag2', 'tag3']);
	});

	test('should handle mixed reactive and static values', () => {
		// Arrange
		const file = new File(['content'], 'test.txt', { type: 'text/plain' });
		const input = {
			filename: ref('uploaded-file'),
			description: computed(() => 'A test file'),
			file: file,
			metadata: reactive({ type: 'document', size: 1024 }),
		};

		// Act
		const result = formdataBodySerializer(input) as unknown as FormData;

		// Assert
		expect(result).toBeInstanceOf(FormData);
		expect(result.get('filename')).toBe('uploaded-file');
		expect(result.get('description')).toBe('A test file');
		expect(result.get('file')).toBe(file);
		expect(result.get('metadata')).toBe('[object Object]');
	});
});

// detect files or blobs in objects
describe('containsFileOrBlob', () => {
	test('should not detect file in undefined', () => {
		// Arrange
		const input = undefined;

		// Act
		const result = containsFileOrBlob(input);

		// Assert
		expect(result).toBe(false);
	});

	test('should not detect file in empty object', () => {
		// Arrange
		const input = {};

		// Act
		const result = containsFileOrBlob(input);

		// Assert
		expect(result).toBe(false);
	});

	test('should not detect file in objects', () => {
		// Arrange
		const input = { a: 'b', c: 'd' };

		// Act
		const result = containsFileOrBlob(input);

		// Assert
		expect(result).toBe(false);
	});

	test('should not detect file in objects with array', () => {
		// Arrange
		const input = { a: 'b', c: ['d', 'f'] };

		// Act
		const result = containsFileOrBlob(input);

		// Assert
		expect(result).toBe(false);
	});

	test('should not detect file inside mixed objects and arrays', () => {
		// Arrange
		const input = {
			a: 'b',
			c: ['d', 'f'],
			g: ['a', 1, { a: 'b' }],
		};

		// Act
		const result = containsFileOrBlob(input);

		// Assert
		expect(result).toBe(false);
	});

	test('should detect file inside objects', () => {
		// Arrange
		const input = {
			a: 'b',
			c: ['d', 'f'],
			g: new File([''], 'filename.txt', { type: 'text/plain' }),
		};

		// Act
		const result = containsFileOrBlob(input);

		// Assert
		expect(result).toBe(true);
	});

	test('should detect file inside nested objects', () => {
		// Arrange
		const input = {
			a: 'b',
			c: ['d', 'f'],
			g: {
				h: new File([''], 'filename.txt', { type: 'text/plain' }),
			},
		};

		// Act
		const result = containsFileOrBlob(input);

		// Assert
		expect(result).toBe(true);
	});

	test('should detect file inside mixed array', () => {
		// Arrange
		const input = {
			a: 'b',
			c: ['d', 'f'],
			g: ['a', 1, new File([''], 'filename.txt', { type: 'text/plain' })],
		};

		// Act
		const result = containsFileOrBlob(input);

		// Assert
		expect(result).toBe(true);
	});

	test('should detect file inside mixed objects and arrays', () => {
		// Arrange
		const input = {
			a: 'b',
			c: ['d', 'f'],
			g: [
				'a',
				1,
				{ a: new File([''], 'filename.txt', { type: 'text/plain' }) },
			],
		};

		// Act
		const result = containsFileOrBlob(input);

		// Assert
		expect(result).toBe(true);
	});

	test('should unwrap computed body', () => {
		const input = computed(() => ({
			a: 5,
		}));

		const result = containsFileOrBlob(input);
		expect(result).toBe(false);
	});

	test('should find files in computed body', () => {
		const input = computed(() => ({
			a: new File([''], 'filename.txt', { type: 'text/plain' }),
		}));

		const result = containsFileOrBlob(input);

		expect(result).toBe(true);
	});

	test('should unwrap reactive objects', () => {
		const input = reactive({
			file: new File([''], 'filename.txt', { type: 'text/plain' }),
		});

		const result = containsFileOrBlob(input);
		expect(result).toBe(true);
	});

	test('should unwrap ref objects', () => {
		const input = ref({
			file: new File([''], 'filename.txt', { type: 'text/plain' }),
		});

		const result = containsFileOrBlob(input);
		expect(result).toBe(true);
	});
});

// fill path with parameters
describe('fillPath', () => {
	test('should fill path with parameters', () => {
		// Arrange
		const path = '/pet/{petId}/photo/{photoId}';
		const params = {
			petId: 1,
			photoId: 2,
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
			petId: 1,
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
			extra: 3,
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
			photoId: 2,
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
			settingId: computed(() => 'theme'),
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
			postId: computed(() => 'latest'),
		};

		// Act
		const result = fillPath(path, params);

		// Assert
		expect(result).toBe('/api/v1/users/42/posts/latest');
	});
});
