/**
 * User-added custom options for chip groups (tattoo styles, body parts,
 * lightings, etc.). Stored under a single `tmg.customs` JSON object keyed
 * by group name, so all customs travel together and one wipe clears
 * everything.
 *
 * @typedef {{value: string, label: string, phrase: string}} CustomOption
 */

import { readJSON, writeJSON } from './storage.js';

const ROOT_KEY = 'tmg.customs';

/**
 * @param {string} group  e.g., 'tattooStyles', 'backgrounds'
 * @returns {CustomOption[]}
 */
export function readCustoms(group) {
	const all = /** @type {Record<string, CustomOption[]>} */ (readJSON(ROOT_KEY, {}));
	return Array.isArray(all[group]) ? all[group] : [];
}

/**
 * @param {string} group
 * @param {CustomOption[]} customs
 */
function writeCustoms(group, customs) {
	const all = /** @type {Record<string, CustomOption[]>} */ (readJSON(ROOT_KEY, {}));
	all[group] = customs;
	writeJSON(ROOT_KEY, all);
}

/**
 * Append a new custom option to the group. By default generates a synthetic
 * value (so the entry is stable across label renames); pass `entry.value` to
 * use a specific value instead — used by the color-preset flow where the
 * value must be the hex itself.
 *
 * @param {string} group
 * @param {{label: string, phrase?: string, value?: string}} entry
 * @returns {CustomOption[]}  the updated list
 */
export function addCustom(group, entry) {
	const label = entry.label.trim();
	if (!label) return readCustoms(group);
	const phrase = (entry.phrase || '').trim() || label;
	const value =
		entry.value || `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	// De-dupe by value so saving the same hex twice replaces (updates label).
	const filtered = readCustoms(group).filter((c) => c.value !== value);
	const next = [...filtered, { value, label, phrase }];
	writeCustoms(group, next);
	return next;
}

/**
 * @param {string} group
 * @param {string} value
 * @returns {CustomOption[]}  the updated list
 */
export function removeCustom(group, value) {
	const next = readCustoms(group).filter((c) => c.value !== value);
	writeCustoms(group, next);
	return next;
}
