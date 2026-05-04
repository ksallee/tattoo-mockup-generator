/**
 * Prompt builder for tattoo mockup generation.
 *
 * The uploaded tattoo image is provided as a reference image to the model,
 * so the prompt refers to it as "the provided design" rather than describing it.
 *
 * Tested phrasings that work well with Nano Banana Pro:
 *   "very small black ink duck tattoo on the left lower back below the waist line,
 *    woman model, close up, tattoo photo shoot, warm skin colors, beach background,
 *    studio lighting, great composition, cinematic, woman is wearing a surfing bikini"
 *
 *   "very small duck tattoo on the wrist, close up, tattoo photo shoot,
 *    warm skin colors, light grey background"
 */

export const SIZES = [
	{ value: 'tiny', label: 'Tiny' },
	{ value: 'small', label: 'Small' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'large', label: 'Large' }
];

export const INKS = [
	{ value: 'black', label: 'Black ink' },
	{ value: 'color', label: 'Color' }
];

export const MODELS = [
	{ value: 'woman', label: 'Woman' },
	{ value: 'man', label: 'Man' },
	{ value: 'either', label: 'Either' }
];

export const BODY_PARTS = [
	{ value: 'wrist', label: 'Wrist' },
	{ value: 'inner forearm', label: 'Inner forearm' },
	{ value: 'outer forearm', label: 'Outer forearm' },
	{ value: 'upper arm', label: 'Upper arm' },
	{ value: 'shoulder', label: 'Shoulder' },
	{ value: 'shoulder blade', label: 'Shoulder blade' },
	{ value: 'collarbone', label: 'Collarbone' },
	{ value: 'sternum', label: 'Sternum' },
	{ value: 'ribs', label: 'Ribs' },
	{ value: 'lower back below the waist line', label: 'Lower back' },
	{ value: 'hip', label: 'Hip' },
	{ value: 'thigh', label: 'Thigh' },
	{ value: 'calf', label: 'Calf' },
	{ value: 'ankle', label: 'Ankle' },
	{ value: 'foot', label: 'Foot' },
	{ value: 'neck', label: 'Neck' },
	{ value: 'behind the ear', label: 'Behind the ear' },
	{ value: 'finger', label: 'Finger' },
	{ value: 'hand', label: 'Hand' }
];

export const BACKGROUNDS = [
	{ value: 'light grey background', label: 'Light grey studio' },
	{ value: 'soft white background', label: 'Soft white studio' },
	{ value: 'warm beige studio background', label: 'Warm beige studio' },
	{ value: 'beach background', label: 'Beach' },
	{ value: 'sunlit window indoor background', label: 'Sunlit indoor' },
	{ value: 'urban concrete wall background', label: 'Urban concrete' },
	{ value: 'natural plants background', label: 'Plants / nature' },
	{ value: 'dark moody background', label: 'Dark moody' }
];

/** @type {Record<string, string>} */
const SIZE_PHRASE = {
	tiny: 'very small',
	small: 'small',
	medium: 'medium-sized',
	large: 'large'
};

/** @type {Record<string, string>} */
const INK_PHRASE = {
	black: 'black ink',
	color: 'color'
};

/** @type {Record<string, string>} */
const MODEL_PHRASE = {
	woman: 'woman model',
	man: 'man model',
	either: ''
};

/**
 * @typedef {Object} Settings
 * @property {string} size
 * @property {string} ink
 * @property {string} model
 * @property {string} bodyPart
 * @property {string} background
 * @property {boolean} stickToIllustration
 * @property {string} [extra] free-text additions (e.g. "wearing a surfing bikini")
 */

/**
 * @param {Settings} s
 * @returns {string}
 */
export function buildPrompt(s) {
	const parts = [];

	const size = SIZE_PHRASE[s.size] || 'small';
	const ink = INK_PHRASE[s.ink] || 'black ink';
	parts.push(`${size} ${ink} tattoo of the provided design on the ${s.bodyPart}`);

	const modelPhrase = MODEL_PHRASE[s.model];
	if (modelPhrase) parts.push(modelPhrase);

	parts.push('close up');
	parts.push('tattoo photo shoot');
	parts.push('warm skin colors');
	parts.push(s.background);
	parts.push('studio lighting');
	parts.push('great composition');
	parts.push('cinematic');

	if (s.extra && s.extra.trim()) {
		parts.push(s.extra.trim());
	}

	let prompt = parts.join(', ');

	if (s.stickToIllustration) {
		prompt +=
			'. Reproduce the provided tattoo design exactly — same shapes, lines and proportions — without restyling, reinterpreting or adding elements. The tattoo should look freshly inked on the skin with realistic ink absorption and slight skin texture.';
	} else {
		prompt +=
			'. The tattoo should look freshly inked on the skin with realistic ink absorption and slight skin texture.';
	}

	return prompt;
}

export const DEFAULT_SETTINGS = {
	size: 'small',
	ink: 'black',
	model: 'woman',
	bodyPart: 'wrist',
	background: 'light grey background',
	stickToIllustration: true,
	extra: ''
};
