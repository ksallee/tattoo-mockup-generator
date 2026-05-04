/**
 * Pure file/image helpers — no DOM mutation, easy to test.
 */

/**
 * Read a File and return its base64 payload (without the data: prefix) plus its mime type.
 * @param {File} file
 * @returns {Promise<{mimeType: string, data: string}>}
 */
export function readFileAsBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(reader.error);
		reader.onload = () => {
			const result = String(reader.result || '');
			const comma = result.indexOf(',');
			resolve({
				mimeType: file.type || 'image/png',
				data: comma >= 0 ? result.slice(comma + 1) : result
			});
		};
		reader.readAsDataURL(file);
	});
}

/**
 * Build a data: URL from an inline image payload.
 * @param {{mimeType: string, data: string}} img
 * @returns {string}
 */
export function toDataUrl(img) {
	return `data:${img.mimeType};base64,${img.data}`;
}

/**
 * Filename-friendly extension from a mime type.
 * @param {string} mimeType
 * @returns {string}
 */
export function extensionForMime(mimeType) {
	const sub = (mimeType.split('/')[1] || 'png').toLowerCase();
	return sub === 'jpeg' ? 'jpg' : sub;
}

/**
 * Trigger a browser download for an inline image. (Side-effect helper, but
 * still easier to mock and call from anywhere than reimplement per-component.)
 * @param {{mimeType: string, data: string}} img
 * @param {string} filenameStem
 */
export function downloadImage(img, filenameStem) {
	const a = document.createElement('a');
	a.href = toDataUrl(img);
	a.download = `${filenameStem}.${extensionForMime(img.mimeType)}`;
	a.click();
}
