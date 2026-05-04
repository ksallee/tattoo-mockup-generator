/**
 * Gemini API client — server-side only.
 * Calls the Generative Language REST API with the user-supplied API key.
 */

const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-3-pro-image-preview';

/**
 * @typedef {Object} ModelInfo
 * @property {string} [name]
 * @property {string} [displayName]
 * @property {string[]} [supportedGenerationMethods]
 */

/**
 * @typedef {{mimeType: string, data: string}} InlineImage
 */

/**
 * List available image-generation models for the given API key.
 * Filters for Gemini models that support generateContent and produce images.
 *
 * @param {string} apiKey
 * @returns {Promise<{value: string, label: string}[]>}
 */
export async function listImageModels(apiKey) {
	const res = await fetch(`${BASE}/models?key=${encodeURIComponent(apiKey)}&pageSize=200`);
	if (!res.ok) {
		throw new Error(`Gemini /models returned ${res.status}: ${await res.text()}`);
	}
	const data = await res.json();
	/** @type {ModelInfo[]} */
	const all = Array.isArray(data.models) ? data.models : [];

	const candidates = all.filter((m) => {
		const name = (m.name || '').toLowerCase();
		const methods = m.supportedGenerationMethods || [];
		if (!methods.includes('generateContent')) return false;
		// Image-output Gemini models all have "image" in the name (e.g. gemini-3-pro-image-preview).
		return name.includes('image') && !name.includes('embed');
	});

	if (candidates.length === 0) {
		// Fall back to known default so the dropdown is never empty.
		return [{ value: DEFAULT_MODEL, label: DEFAULT_MODEL }];
	}

	return candidates
		.map((m) => {
			const id = (m.name || '').replace(/^models\//, '');
			return { value: id, label: m.displayName || id };
		})
		.sort((a, b) => a.value.localeCompare(b.value));
}

/**
 * Generate N tattoo mockups in parallel.
 * Each call to generateContent returns one candidate; running N in parallel
 * yields N independently-seeded variations.
 *
 * @param {Object} args
 * @param {string} args.apiKey
 * @param {string} args.model
 * @param {string} args.prompt
 * @param {InlineImage} args.refImage  base64 (no data: prefix)
 * @param {number} args.count  1..4
 * @returns {Promise<InlineImage[]>}
 */
export async function generateTattooMockups({ apiKey, model, prompt, refImage, count }) {
	const n = Math.max(1, Math.min(4, count | 0));
	const calls = Array.from({ length: n }, () =>
		generateOne({ apiKey, model, prompt, refImage })
	);
	const results = await Promise.allSettled(calls);

	/** @type {InlineImage[]} */
	const images = [];
	/** @type {string[]} */
	const errors = [];
	for (const r of results) {
		if (r.status === 'fulfilled' && r.value) images.push(r.value);
		else if (r.status === 'rejected') errors.push(r.reason?.message || String(r.reason));
	}

	if (images.length === 0) {
		throw new Error(errors[0] || 'No images returned');
	}
	return images;
}

/**
 * @param {{apiKey: string, model: string, prompt: string, refImage: InlineImage}} args
 * @returns {Promise<InlineImage>}
 */
async function generateOne({ apiKey, model, prompt, refImage }) {
	const url = `${BASE}/models/${encodeURIComponent(model)}:generateContent`;
	const body = {
		contents: [
			{
				role: 'user',
				parts: [
					{ text: prompt },
					{ inline_data: { mime_type: refImage.mimeType, data: refImage.data } }
				]
			}
		],
		generationConfig: {
			responseModalities: ['IMAGE']
		}
	};

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-goog-api-key': apiKey
		},
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Gemini ${model} ${res.status}: ${text.slice(0, 400)}`);
	}

	const data = await res.json();
	const candidate = data.candidates?.[0];
	const parts = candidate?.content?.parts || [];
	for (const p of parts) {
		const inline = p.inlineData || p.inline_data;
		if (inline?.data) {
			return { mimeType: inline.mimeType || inline.mime_type || 'image/png', data: inline.data };
		}
	}

	const finish = candidate?.finishReason;
	const safety = JSON.stringify(candidate?.safetyRatings || candidate?.promptFeedback || {});
	throw new Error(`No image in response (finishReason=${finish}, safety=${safety})`);
}
