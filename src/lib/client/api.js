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
 * @returns {Promise<{mimeType:string,data:string}[]>}
 */
export async function generateMockups({ apiKey, model, prompt, image, count }) {
	const res = await fetch('/api/generate', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ apiKey, model, prompt, image, count })
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
	return data.images || [];
}
