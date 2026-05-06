/**
 * Browser-side wrappers around our server endpoints.
 * Components import these instead of doing fetch() inline, so the network
 * layer is testable and components stay view-only.
 */

/**
 * @param {string} apiKey
 * @returns {Promise<{value:string,label:string}[]>}
 */
export async function fetchModels(apiKey) {
	const res = await fetch('/api/models', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ apiKey })
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
	return data.models || [];
}

/**
 * @param {Object} args
 * @param {string} args.apiKey
 * @param {string} args.model
 * @param {string} args.prompt
 * @param {{mimeType:string,data:string}} args.image
 * @param {number} args.count
 * @param {string} [args.aspectRatio]
 * @returns {Promise<{mimeType:string,data:string}[]>}
 */
export async function generateMockups({ apiKey, model, prompt, image, count, aspectRatio }) {
	const res = await fetch('/api/generate', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ apiKey, model, prompt, image, count, aspectRatio })
	});

	// Validation errors still come back as a regular JSON response with a non-2xx status.
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.error || `HTTP ${res.status}`);
	}

	const ct = res.headers.get('content-type') || '';
	if (!ct.includes('ndjson')) {
		// Non-streaming fallback (older deploys, or proxies that strip the stream).
		const data = await res.json().catch(() => ({}));
		return data.images || [];
	}

	if (!res.body) throw new Error('Streaming response missing body');
	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buf = '';

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		buf += decoder.decode(value, { stream: true });

		let nl;
		while ((nl = buf.indexOf('\n')) >= 0) {
			const line = buf.slice(0, nl).trim();
			buf = buf.slice(nl + 1);
			if (!line) continue;
			let msg;
			try {
				msg = JSON.parse(line);
			} catch {
				continue;
			}
			if (msg.type === 'ping') continue;
			if (msg.type === 'error') throw new Error(msg.error || 'Generation failed');
			if (msg.type === 'images') return msg.images || [];
		}
	}

	throw new Error('Connection ended before generation completed');
}
