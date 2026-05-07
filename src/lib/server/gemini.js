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
 * @typedef {{role?: string, roles?: string[], mimeType: string, data: string}} RoledImage
 */

/**
 * Aspect phrase for each reference role. Multiple roles are combined into a
 * single caption per image (see captionForRoles below) so we can say "match
 * the pose and the lighting only" instead of stacking two separate
 * instructions.
 *
 * @type {Record<string, string>}
 */
const REF_ROLE_ASPECTS = {
	pose: 'pose, posture, and body angle',
	composition: 'framing, layout, and visual composition',
	'photography-style':
		'lighting character, color grade, lens feel, and photographic aesthetic',
	'body-skin': 'body type, skin tone, skin texture, and age character',
	'vibe-mood': 'overall atmosphere, energy, and mood'
};

/**
 * @param {string[]} roles
 * @returns {string}
 */
function captionForRoles(roles) {
	const aspects = roles
		.map((r) => REF_ROLE_ASPECTS[r])
		.filter(/** @returns {x is string} */ (x) => typeof x === 'string');
	if (aspects.length === 0) return 'A reference image.';
	let listed;
	if (aspects.length === 1) listed = aspects[0];
	else if (aspects.length === 2) listed = `${aspects[0]} and ${aspects[1]}`;
	else listed = `${aspects.slice(0, -1).join('; ')}; and ${aspects[aspects.length - 1]}`;
	return `A reference image — match the ${listed} ONLY. Do not copy the person, their identity, or the rest of the scene's content.`;
}

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

	parts.push({ text: 'The tattoo design to apply:' });
	parts.push({ inline_data: { mime_type: refImage.mimeType, data: refImage.data } });

	for (const r of refs) {
		const roles = Array.isArray(r.roles)
			? r.roles
			: typeof r.role === 'string' && r.role
				? [r.role]
				: [];
		parts.push({ text: captionForRoles(roles) });
		parts.push({ inline_data: { mime_type: r.mimeType, data: r.data } });
	}

	if (refs.length > 0) {
		parts.push({
			text: 'IMPORTANT: produce a SINGLE clean photograph as output. Do not output a chart, grid, comparison sheet, side-by-side panels, labels, captions, or annotations. Do not copy any reference imagery (poses, brackets, text) into the output verbatim.'
		});
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
