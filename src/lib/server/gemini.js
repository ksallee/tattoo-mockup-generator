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
 * @typedef {{role: string, mimeType: string, data: string}} RoledImage
 */

/**
 * Per-role text prepended before each reference image so Gemini knows what
 * each image is for. The {LETTER} placeholder is filled with B, C, D… in
 * order so the model can refer to them explicitly.
 *
 * @type {Record<string, string>}
 */
const REF_ROLE_TEXT = {
	pose:
		'Image {LETTER} — pose reference. Match the pose, posture, and body angle ONLY. Do not copy the person, their face, skin, clothing, or scene.',
	composition:
		'Image {LETTER} — composition reference. Match the framing, layout, and visual composition ONLY. Do not copy the content.',
	'photography-style':
		'Image {LETTER} — photographic style reference. Match the lighting character, color grade, lens feel, and overall aesthetic ONLY. Do not copy the content.',
	'body-skin':
		'Image {LETTER} — body and skin reference. Match the body type, skin tone, skin texture, and age character ONLY. Do not copy the person, their face, clothing, or scene.',
	'vibe-mood':
		'Image {LETTER} — mood / vibe reference. Match the overall atmosphere, energy, and feeling ONLY. Do not copy the content.',
	'body-scene':
		'Image {LETTER} — the actual body to place the tattoo on. Apply the tattoo design from image A to this person, matching their existing pose, skin tone, lighting, and skin volume. Preserve their face, body, clothing, and surroundings exactly.',
	'placement-marker':
		'Image {LETTER} — placement marker. The cyan rectangle drawn on this image marks EXACTLY where the tattoo from image A must appear: same position, same size, same rotation as the rectangle. The rest of this image is identical to the body-scene image — use that copy for the actual skin, lighting, and surroundings. DO NOT draw the cyan rectangle in the output; only the tattoo should appear inside the marked region.'
};

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
 * @param {InlineImage} args.refImage  primary design image (sent as image A)
 * @param {RoledImage[]} [args.refImages]  additional role-tagged refs (B, C, D…)
 * @param {number} args.count  1..4
 * @param {string} [args.aspectRatio] e.g. "1:1", "3:4", "9:16" — only honored by Nano Banana Pro
 * @returns {Promise<InlineImage[]>}
 */
export async function generateTattooMockups({ apiKey, model, prompt, refImage, refImages, count, aspectRatio }) {
	const n = Math.max(1, Math.min(4, count | 0));
	const calls = Array.from({ length: n }, () =>
		generateOne({ apiKey, model, prompt, refImage, refImages, aspectRatio })
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
 * @param {{apiKey: string, model: string, prompt: string, refImage: InlineImage, refImages?: RoledImage[], aspectRatio?: string}} args
 * @returns {Promise<InlineImage>}
 */
async function generateOne({ apiKey, model, prompt, refImage, refImages, aspectRatio }) {
	const url = `${BASE}/models/${encodeURIComponent(model)}:generateContent`;
	/** @type {Record<string, any>} */
	const generationConfig = {
		responseModalities: ['IMAGE']
	};
	if (aspectRatio) {
		generationConfig.imageConfig = { aspectRatio };
	}

	const refs = Array.isArray(refImages) ? refImages : [];
	/** @type {Array<{text?: string, inline_data?: {mime_type: string, data: string}}>} */
	const parts = [{ text: prompt }];

	if (refs.length > 0) {
		parts.push({
			text: 'Multiple images follow, in order. Image A is the tattoo design to reproduce. The remaining images are role-tagged references — apply each image only for the aspect named in its label, and do not copy its content into the result.'
		});
	}

	parts.push({ text: 'Image A — tattoo design:' });
	parts.push({ inline_data: { mime_type: refImage.mimeType, data: refImage.data } });

	let letterCode = 'B'.charCodeAt(0);
	for (const r of refs) {
		const letter = String.fromCharCode(letterCode);
		const template = REF_ROLE_TEXT[r.role] || `Image ${letter} — additional reference:`;
		parts.push({ text: template.replace(/{LETTER}/g, letter) });
		parts.push({ inline_data: { mime_type: r.mimeType, data: r.data } });
		letterCode++;
	}

	const body = {
		contents: [{ role: 'user', parts }],
		generationConfig
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
	const respParts = candidate?.content?.parts || [];
	for (const p of respParts) {
		const inline = p.inlineData || p.inline_data;
		if (inline?.data) {
			return { mimeType: inline.mimeType || inline.mime_type || 'image/png', data: inline.data };
		}
	}

	const finish = candidate?.finishReason;
	const safety = JSON.stringify(candidate?.safetyRatings || candidate?.promptFeedback || {});
	throw new Error(`No image in response (finishReason=${finish}, safety=${safety})`);
}
