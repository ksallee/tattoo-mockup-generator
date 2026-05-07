/**
 * Tiny localStorage wrappers that swallow errors (private mode, quota, SSR).
 * Keeps components free of try/catch noise.
 */

/** @param {string} key @param {string} fallback */
export function readString(key, fallback = '') {
	if (typeof localStorage === 'undefined') return fallback;
	try {
		return localStorage.getItem(key) ?? fallback;
	} catch {
		return fallback;
	}
}

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function readJSON(key, fallback) {
	const raw = readString(key, '');
	if (!raw) return fallback;
	try {
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}

/** @param {string} key @param {string} value */
export function writeString(key, value) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(key, value);
	} catch {
		/* ignore */
	}
}

/** @param {string} key @param {unknown} value */
export function writeJSON(key, value) {
	writeString(key, JSON.stringify(value));
}

export const STORAGE_KEYS = {
	apiKey: 'tmg.apiKey',
	model: 'tmg.model',
	mode: 'tmg.mode',
	settings: 'tmg.settings',
	iterateSettings: 'tmg.iterate.settings'
};
