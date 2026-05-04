import { env } from '$env/dynamic/private';

/**
 * Resolve the API key to use for a request.
 * Prefers the user-supplied key (sent from the browser); falls back to a
 * server-side env var (`GEMINI_API_KEY`) for local development convenience.
 *
 * @param {unknown} clientKey
 * @returns {string}
 */
export function resolveApiKey(clientKey) {
	if (typeof clientKey === 'string' && clientKey.trim()) return clientKey.trim();
	return (env.GEMINI_API_KEY || '').trim();
}
