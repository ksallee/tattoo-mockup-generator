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

	const { model, prompt, image, refImages, count, aspectRatio } = body || {};
	const apiKey = resolveApiKey(body?.apiKey);
	if (!apiKey) return json({ error: 'Missing apiKey' }, { status: 400 });
	if (!model) return json({ error: 'Missing model' }, { status: 400 });
	if (!prompt) return json({ error: 'Missing prompt' }, { status: 400 });
	if (!image?.data || !image?.mimeType) {
		return json({ error: 'Missing image' }, { status: 400 });
	}

	/** @type {{role: string, mimeType: string, data: string}[]} */
	const cleanRefs = Array.isArray(refImages)
		? refImages
				.filter((r) => r && typeof r.role === 'string' && r.data && r.mimeType)
				.slice(0, 4)
		: [];

	// Stream NDJSON: one {"type":"ping"} line every few seconds while we wait
	// on Gemini, then a final {"type":"images",...} or {"type":"error",...}.
	// The pings keep iOS Safari from treating the long fetch as dead and
	// dropping the connection mid-generation.
	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		start(controller) {
			const ping = setInterval(() => {
				try {
					controller.enqueue(encoder.encode('{"type":"ping"}\n'));
				} catch {
					clearInterval(ping);
				}
			}, 5000);

			generateTattooMockups({
				apiKey,
				model,
				prompt,
				refImage: image,
				refImages: cleanRefs,
				count: Number(count) || 1,
				aspectRatio: typeof aspectRatio === 'string' ? aspectRatio : undefined
			})
				.then((images) => {
					controller.enqueue(
						encoder.encode(JSON.stringify({ type: 'images', images }) + '\n')
					);
				})
				.catch((/** @type {any} */ err) => {
					controller.enqueue(
						encoder.encode(
							JSON.stringify({ type: 'error', error: err?.message || 'Generation failed' }) +
								'\n'
						)
					);
				})
				.finally(() => {
					clearInterval(ping);
					try {
						controller.close();
					} catch {
						/* already closed */
					}
				});
		}
	});

	return new Response(stream, {
		headers: {
			'content-type': 'application/x-ndjson; charset=utf-8',
			'cache-control': 'no-cache, no-transform',
			'x-accel-buffering': 'no'
		}
	});
}
