import { json } from '@sveltejs/kit';
import { generateTattooMockups } from '$lib/server/gemini.js';
import { resolveApiKey } from '$lib/server/apiKey.js';

export const config = {
	runtime: 'nodejs22.x',
	maxDuration: 300
};

export async function POST({ request }) {
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { model, prompt, image, count, aspectRatio } = body || {};
	const apiKey = resolveApiKey(body?.apiKey);
	if (!apiKey) return json({ error: 'Missing apiKey' }, { status: 400 });
	if (!model) return json({ error: 'Missing model' }, { status: 400 });
	if (!prompt) return json({ error: 'Missing prompt' }, { status: 400 });
	if (!image?.data || !image?.mimeType) {
		return json({ error: 'Missing image' }, { status: 400 });
	}

	try {
		const images = await generateTattooMockups({
			apiKey,
			model,
			prompt,
			refImage: image,
			count: Number(count) || 1,
			aspectRatio: typeof aspectRatio === 'string' ? aspectRatio : undefined
		});
		return json({ images });
	} catch (/** @type {any} */ err) {
		return json({ error: err.message || 'Generation failed' }, { status: 502 });
	}
}
