/**
 * @param {string} string
 */
export function isUrl(string) {
	try {
		new URL(string);
	} catch {
		return false;
	}
	return true;
}
