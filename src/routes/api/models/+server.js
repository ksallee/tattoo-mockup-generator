import { json } from '@sveltejs/kit';
import { listImageModels } from '$lib/server/gemini.js';
import { resolveApiKey } from '$lib/server/apiKey.js';

export async function POST({ request }) {
	let body;
	try {
		body = await request.json();
	} catch {
		body = {};
	}

	const apiKey = resolveApiKey(body?.apiKey);
	if (!apiKey) return json({ error: 'Missing apiKey' }, { status: 400 });

	try {
		const models = await listImageModels(apiKey);
		return json({ models });
	} catch (/** @type {any} */ err) {
		return json({ error: err.message || 'Failed to list models' }, { status: 502 });
	}
}
