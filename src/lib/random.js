/**
 * Randomization helpers for the settings panel.
 * Pure functions — easy to test, no DOM/state dependencies.
 */

/**
 * Pick one random option's value from a list, optionally excluding values
 * (e.g. 'auto' which means "let the model decide" and isn't useful for random).
 *
 * @param {{value:string,label:string}[]} options
 * @param {string[]} [exclude]
 * @returns {string}
 */
export function pickOne(options, exclude = []) {
	const pool = options.filter((o) => !exclude.includes(o.value));
	if (pool.length === 0) return options[0]?.value ?? '';
	return pool[Math.floor(Math.random() * pool.length)].value;
}

/**
 * Pick N random values from a list (without replacement).
 *
 * @param {{value:string,label:string}[]} options
 * @param {number} count
 * @param {string[]} [exclude]
 * @returns {string[]}
 */
export function pickN(options, count, exclude = []) {
	const pool = options.filter((o) => !exclude.includes(o.value)).slice();
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}
	return pool.slice(0, Math.min(count, pool.length)).map((o) => o.value);
}

/**
 * Pick a random integer in [min, max] inclusive.
 * @param {number} min @param {number} max
 */
export function randInt(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}
