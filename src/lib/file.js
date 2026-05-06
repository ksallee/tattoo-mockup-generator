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
 * Decode a Blob (typically the canvas-encoded JPEG) to base64 without the data: prefix.
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
function blobToBase64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(reader.error);
		reader.onload = () => {
			const result = String(reader.result || '');
			const comma = result.indexOf(',');
			resolve(comma >= 0 ? result.slice(comma + 1) : result);
		};
		reader.readAsDataURL(blob);
	});
}

/**
 * Downscale an image to a max edge length and re-encode as JPEG. iPhone photos
 * are typically 3–8 MB; sending those raw means a multi-megabyte base64 JSON
 * upload on cellular before the long Gemini call even starts, which makes the
 * whole request more likely to be killed mid-flight by iOS Safari.
 *
 * Falls back to the original file's bytes if anything in the canvas pipeline
 * fails (createImageBitmap unsupported, OOM on huge images, etc.).
 *
 * @param {File} file
 * @param {{maxEdge?: number, quality?: number}} [opts]
 * @returns {Promise<{mimeType: string, data: string}>}
 */
export async function downscaleImage(file, opts = {}) {
	const maxEdge = opts.maxEdge ?? 1280;
	const quality = opts.quality ?? 0.85;

	if (typeof createImageBitmap !== 'function') {
		return readFileAsBase64(file);
	}

	let bitmap;
	try {
		bitmap = await createImageBitmap(file);
	} catch {
		return readFileAsBase64(file);
	}

	const { width, height } = bitmap;
	const longest = Math.max(width, height);
	const scale = longest > maxEdge ? maxEdge / longest : 1;

	// Already small in pixels and on disk — skip the re-encode round trip.
	if (scale === 1 && file.size < 600_000) {
		bitmap.close?.();
		return readFileAsBase64(file);
	}

	const w = Math.max(1, Math.round(width * scale));
	const h = Math.max(1, Math.round(height * scale));
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		bitmap.close?.();
		return readFileAsBase64(file);
	}
	ctx.drawImage(bitmap, 0, 0, w, h);
	bitmap.close?.();

	/** @type {Blob | null} */
	const blob = await new Promise((resolve) => {
		canvas.toBlob(resolve, 'image/jpeg', quality);
	});
	if (!blob) return readFileAsBase64(file);

	const data = await blobToBase64(blob);
	return { mimeType: 'image/jpeg', data };
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
