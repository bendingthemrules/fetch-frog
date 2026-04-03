import { expect, test, describe } from 'vitest';
import { containsFileOrBlob, formdataBodySerializer, fillPath } from './utils';

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
});

// detect files or blobs in objects
describe('containsFileOrBlob', () => {
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
			g: ['a', 1, { a: 'b' }]
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
			g: new File([''], 'filename.txt', { type: 'text/plain' })
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
				h: new File([''], 'filename.txt', { type: 'text/plain' })
			}
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
			g: ['a', 1, new File([''], 'filename.txt', { type: 'text/plain' })]
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
			g: ['a', 1, { a: new File([''], 'filename.txt', { type: 'text/plain' }) }]
		};

		// Act
		const result = containsFileOrBlob(input);

		// Assert
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

	test('should fill path with multiple parameters with the same name', () => {
		// Arrange
		const path = '/pet/{petId}/photo/{petId}';
		const params = {
			petId: 1
		};

		// Act
		const result = fillPath(path, params);

		// Assert
		expect(result).toBe('/pet/1/photo/1');
	});
});
