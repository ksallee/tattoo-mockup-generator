/**
 * Prompt builder for tattoo mockup generation.
 *
 * The uploaded tattoo image is provided as a reference image to the model,
 * so the prompt refers to it as "the provided design" rather than describing it.
 *
 * Structural pattern (Gemini weights first and last tokens most heavily):
 *   [opener with size + ink] → [tattoo body + placement + state + orientation] →
 *   [subject + skin + age + body type] → [framing + lighting + background] →
 *   [style + grading] → [details] → [extra free text] → [exclusions] →
 *   [size emphasis repeat] → [fidelity closer]
 */

// ── Option lists ────────────────────────────────────────────────────────────

export const SIZES = [
	{
		value: 'micro',
		label: 'Micro (fingertip)',
		phrase: 'micro tattoo, no larger than a fingertip, about 1 cm wide'
	},
	{
		value: 'tiny',
		label: 'Tiny (thumbnail)',
		phrase: 'tiny tattoo, the size of a thumbnail, about 2 cm wide'
	},
	{
		value: 'small',
		label: 'Small (coin)',
		phrase: 'small tattoo, the size of a coin, about 3 cm wide'
	},
	{
		value: 'medium-small',
		label: 'Medium-small (matchbox)',
		phrase: 'medium-small tattoo, the size of a matchbox, about 5 cm wide'
	},
	{
		value: 'medium',
		label: 'Medium (credit card)',
		phrase: 'medium-sized tattoo, the size of a credit card, about 8 cm wide'
	},
	{
		value: 'large',
		label: 'Large (palm)',
		phrase: 'large tattoo, the size of a palm, about 12 cm wide'
	},
	{
		value: 'extra-large',
		label: 'Extra large (postcard)',
		phrase: 'extra large tattoo, the size of a postcard, about 15 cm wide'
	},
	{
		value: 'covering',
		label: 'Covering whole area',
		phrase: 'large statement tattoo covering most of the body part'
	}
];

/**
 * Tattoo color/style. One flat chip row — covers black, "any color", and a
 * library of specific palettes. Each entry carries the full phrasing the
 * prompt builder injects, so adding or tuning a palette only changes this
 * list.
 *
 * `accent` is a representative hex (or comma-separated hex pair) used to
 * tint the chip so the user can see at a glance what they're picking.
 */
export const INKS = [
	{
		value: 'black',
		label: 'Black ink',
		phrase: 'solid black ink',
		isColor: false,
		accent: '#1c1917'
	},
	{
		value: 'grey-shading',
		label: 'Black & grey',
		phrase: 'black and grey ink with smooth shading',
		isColor: false,
		accent: '#1c1917,#9ca3af'
	},
	{
		value: 'color-auto',
		label: 'Color (any)',
		phrase: 'color ink',
		isColor: true,
		accent: 'rainbow'
	},
	{
		value: 'vibrant-rainbow',
		label: 'Vibrant rainbow',
		phrase: 'color ink using a vibrant rainbow palette of red, orange, yellow, green, blue, violet',
		isColor: true,
		accent: 'rainbow'
	},
	{
		value: 'pastel',
		label: 'Pastel',
		phrase:
			'color ink using a soft pastel palette: light pink, lavender, mint green, baby blue, butter yellow',
		isColor: true,
		accent: '#fbcfe8,#c4b5fd,#a7f3d0'
	},
	{
		value: 'neon',
		label: 'Neon',
		phrase: 'color ink using a neon palette: electric pink, cyan, lime, hot magenta',
		isColor: true,
		accent: '#ec4899,#22d3ee,#a3e635'
	},
	{
		value: 'watercolor',
		label: 'Watercolor',
		phrase:
			'color ink in a watercolor style with soft bleeding edges and translucent washes',
		isColor: true,
		accent: '#93c5fd,#fda4af,#fcd34d'
	},
	{
		value: 'earth-tones',
		label: 'Earth tones',
		phrase: 'color ink using an earth tones palette: terracotta, ochre, olive, deep brown',
		isColor: true,
		accent: '#c2410c,#a16207,#65a30d'
	},
	{
		value: 'jewel-tones',
		label: 'Jewel tones',
		phrase: 'color ink using a jewel tones palette: sapphire blue, emerald green, ruby red, amethyst purple',
		isColor: true,
		accent: '#1d4ed8,#047857,#b91c1c'
	},
	{
		value: 'tropical',
		label: 'Tropical',
		phrase:
			'color ink using a tropical palette: turquoise, coral, sunshine yellow, hot pink',
		isColor: true,
		accent: '#06b6d4,#fb7185,#fde047'
	},
	{
		value: 'autumn',
		label: 'Autumn',
		phrase: 'color ink using an autumn palette: burnt orange, deep red, golden yellow, warm brown',
		isColor: true,
		accent: '#ea580c,#991b1b,#ca8a04'
	},
	{
		value: 'ocean',
		label: 'Ocean',
		phrase: 'color ink using an ocean palette: deep navy, teal, aqua, seafoam green',
		isColor: true,
		accent: '#1e3a8a,#0d9488,#67e8f9'
	},
	{
		value: 'sunset',
		label: 'Sunset',
		phrase:
			'color ink using a sunset gradient palette: orange, pink, magenta, deep purple',
		isColor: true,
		accent: '#fb923c,#ec4899,#7e22ce'
	},
	{
		value: 'forest',
		label: 'Forest',
		phrase: 'color ink using a forest palette: deep greens, moss, fern, dark teal',
		isColor: true,
		accent: '#166534,#4d7c0f,#0f766e'
	},
	{
		value: 'vintage-muted',
		label: 'Vintage muted',
		phrase: 'color ink using a muted vintage palette: sepia, dusty rose, mustard, sage',
		isColor: true,
		accent: '#a16207,#fda4af,#a3a373'
	},
	{
		value: 'mono-blue',
		label: 'Mono blue',
		phrase: 'monochromatic blue ink, multiple shades of blue from light to deep navy',
		isColor: true,
		accent: '#bfdbfe,#1e40af'
	},
	{
		value: 'mono-red',
		label: 'Mono red',
		phrase: 'monochromatic red ink, multiple shades of red from coral to deep crimson',
		isColor: true,
		accent: '#fda4af,#991b1b'
	},
	{
		value: 'mono-green',
		label: 'Mono green',
		phrase: 'monochromatic green ink, multiple shades of green from sage to deep forest',
		isColor: true,
		accent: '#bbf7d0,#166534'
	},
	{
		value: 'mono-purple',
		label: 'Mono purple',
		phrase: 'monochromatic purple ink, multiple shades of purple from lavender to deep violet',
		isColor: true,
		accent: '#e9d5ff,#6b21a8'
	},
	{
		value: 'black-red',
		label: 'Black + red',
		phrase: 'mostly black ink with bold red accents only',
		isColor: true,
		accent: '#1c1917,#dc2626'
	},
	{
		value: 'black-blue',
		label: 'Black + blue',
		phrase: 'mostly black ink with deep blue accents only',
		isColor: true,
		accent: '#1c1917,#1d4ed8'
	},
	{
		value: 'black-gold',
		label: 'Black + gold',
		phrase: 'mostly black ink with metallic gold accents only',
		isColor: true,
		accent: '#1c1917,#ca8a04'
	},
	{
		value: 'black-green',
		label: 'Black + green',
		phrase: 'mostly black ink with deep emerald green accents only',
		isColor: true,
		accent: '#1c1917,#047857'
	},
	{
		value: 'cool-tones',
		label: 'Cool tones',
		phrase: 'color ink using a cool palette: blues, purples, cool greys',
		isColor: true,
		accent: '#3b82f6,#8b5cf6,#64748b'
	},
	{
		value: 'warm-tones',
		label: 'Warm tones',
		phrase: 'color ink using a warm palette: reds, oranges, warm yellows',
		isColor: true,
		accent: '#dc2626,#ea580c,#facc15'
	},
	{
		value: 'bold-primaries',
		label: 'Bold primaries',
		phrase: 'color ink using bold primary colors: pure red, pure blue, pure yellow, with high contrast',
		isColor: true,
		accent: '#dc2626,#2563eb,#facc15'
	}
];

export const TATTOO_STATES = [
	{ value: 'auto', label: 'Auto' },
	{ value: 'fresh', label: 'Fresh (just inked)' },
	{ value: 'healed', label: 'Healed (settled)' }
];

export const ORIENTATIONS = [
	{ value: 'auto', label: 'Auto', phrase: '' },
	{
		value: 'reads-toward-hand',
		label: 'Reads toward hand/foot',
		phrase: 'oriented so the top of the design points toward the hand or foot'
	},
	{
		value: 'reads-toward-shoulder',
		label: 'Reads toward shoulder/torso',
		phrase: 'oriented so the top of the design points toward the shoulder or torso'
	},
	{
		value: 'horizontal',
		label: 'Horizontal',
		phrase: 'oriented horizontally along the body part'
	},
	{
		value: 'vertical',
		label: 'Vertical',
		phrase: 'oriented vertically along the body part'
	},
	{
		value: 'diagonal',
		label: 'Diagonal',
		phrase: 'oriented diagonally across the body part'
	}
];

export const MODELS = [
	{ value: 'woman', label: 'Woman' },
	{ value: 'man', label: 'Man' },
	{ value: 'either', label: 'Either' }
];

export const SKIN_TONES = [
	{ value: 'auto', label: 'Auto', phrase: '' },
	{ value: 'very fair porcelain', label: 'Very fair', phrase: 'very fair porcelain skin tone' },
	{ value: 'fair pink-undertone', label: 'Fair pink', phrase: 'fair pink-undertone skin tone' },
	{ value: 'fair neutral', label: 'Fair neutral', phrase: 'fair neutral skin tone' },
	{ value: 'light olive', label: 'Light olive', phrase: 'light olive skin tone' },
	{ value: 'medium olive', label: 'Medium olive', phrase: 'medium olive skin tone' },
	{ value: 'tan golden', label: 'Tan golden', phrase: 'tan golden skin tone' },
	{ value: 'warm caramel', label: 'Warm caramel', phrase: 'warm caramel skin tone' },
	{ value: 'warm brown', label: 'Warm brown', phrase: 'warm brown skin tone' },
	{ value: 'rich brown', label: 'Rich brown', phrase: 'rich brown skin tone' },
	{ value: 'deep brown', label: 'Deep brown', phrase: 'deep brown skin tone' },
	{ value: 'deep ebony', label: 'Deep ebony', phrase: 'deep ebony skin tone' }
];

export const AGE_BRACKETS = [
	{ value: 'auto', label: 'Auto', phrase: '' },
	{ value: 'late teens', label: 'Late teens' },
	{ value: 'in their early 20s', label: 'Early 20s' },
	{ value: 'in their late 20s', label: 'Late 20s' },
	{ value: 'in their early 30s', label: 'Early 30s' },
	{ value: 'in their late 30s', label: 'Late 30s' },
	{ value: 'in their 40s', label: '40s' },
	{ value: 'in their 50s', label: '50s' }
];

/**
 * Whether the model already has other tattoos visible on their skin.
 * Single-select — these are mutually exclusive ("clean" vs "many color tattoos"
 * can't both be true). Default 'none' replaces the old cleanSkin toggle.
 */
export const EXISTING_TATTOOS = [
	{ value: 'none', label: 'Clean skin', phrase: '' },
	{
		value: 'matching-style',
		label: 'Matching style',
		phrase:
			'with several other existing tattoos in a matching style and aesthetic visible nearby on the body'
	},
	{
		value: 'matching-color',
		label: 'Matching color',
		phrase: 'with several other existing tattoos in matching colors visible nearby on the body'
	},
	{
		value: 'few-black',
		label: 'A few black tattoos',
		phrase: 'with a few existing small black ink tattoos visible nearby on the body'
	},
	{
		value: 'many-black',
		label: 'Heavily black-tattooed',
		phrase:
			'heavily tattooed in black ink with many existing black tattoos visible across the body'
	},
	{
		value: 'few-color',
		label: 'A few color tattoos',
		phrase: 'with a few existing small color tattoos visible nearby on the body'
	},
	{
		value: 'many-color',
		label: 'Heavily color-tattooed',
		phrase: 'heavily tattooed with many existing colorful tattoos visible across the body'
	},
	{
		value: 'mixed',
		label: 'Mixed black + color',
		phrase:
			'with several existing tattoos visible on the body — a mix of black and color work'
	},
	{
		value: 'sleeve-black',
		label: 'Black sleeve',
		phrase: 'with an existing full black ink sleeve tattoo on the same arm'
	},
	{
		value: 'sleeve-color',
		label: 'Color sleeve',
		phrase: 'with an existing full color sleeve tattoo on the same arm'
	},
	{
		value: 'fine-line-set',
		label: 'Fine-line set',
		phrase: 'with several existing fine-line tattoos visible nearby on the body'
	},
	{
		value: 'minimalist-set',
		label: 'Minimalist set',
		phrase: 'with several existing minimalist line-art tattoos visible nearby on the body'
	},
	{
		value: 'traditional-set',
		label: 'Traditional set',
		phrase:
			'with several existing American traditional style tattoos visible nearby on the body'
	}
];

export const BODY_TYPES = [
	{ value: 'auto', label: 'Auto', phrase: '' },
	{ value: 'slim', label: 'Slim', phrase: 'slim build' },
	{ value: 'lean athletic', label: 'Lean athletic', phrase: 'lean athletic build' },
	{ value: 'athletic muscular', label: 'Athletic muscular', phrase: 'athletic muscular build' },
	{ value: 'curvy', label: 'Curvy', phrase: 'curvy build' },
	{ value: 'plus-size', label: 'Plus-size', phrase: 'plus-size build' },
	{ value: 'petite', label: 'Petite', phrase: 'petite build' },
	{ value: 'tall slender', label: 'Tall slender', phrase: 'tall slender build' }
];

export const BODY_PARTS = [
	{ value: 'inner wrist', label: 'Inner wrist' },
	{ value: 'outer wrist', label: 'Outer wrist' },
	{ value: 'side of the wrist', label: 'Side wrist' },
	{ value: 'inner forearm', label: 'Inner forearm' },
	{ value: 'outer forearm', label: 'Outer forearm' },
	{ value: 'wrap-around forearm', label: 'Forearm wrap' },
	{ value: 'elbow', label: 'Elbow' },
	{ value: 'inside of the elbow', label: 'Inner elbow' },
	{ value: 'upper arm bicep', label: 'Bicep' },
	{ value: 'upper arm tricep', label: 'Tricep' },
	{ value: 'shoulder cap', label: 'Shoulder cap' },
	{ value: 'shoulder blade', label: 'Shoulder blade' },
	{ value: 'back of the neck / nape', label: 'Nape' },
	{ value: 'side of the neck', label: 'Side neck' },
	{ value: 'collarbone', label: 'Collarbone' },
	{ value: 'sternum between the breasts', label: 'Sternum' },
	{ value: 'side of the chest', label: 'Side chest' },
	{ value: 'upper back between the shoulder blades', label: 'Upper back' },
	{ value: 'mid back along the spine', label: 'Mid back' },
	{ value: 'ribs', label: 'Ribs' },
	{ value: 'side waist', label: 'Side waist' },
	{ value: 'lower back below the waist line', label: 'Lower back' },
	{ value: 'lower stomach', label: 'Lower stomach' },
	{ value: 'hip', label: 'Hip' },
	{ value: 'inner thigh', label: 'Inner thigh' },
	{ value: 'outer thigh', label: 'Outer thigh' },
	{ value: 'front of the knee', label: 'Knee' },
	{ value: 'back of the knee', label: 'Back of knee' },
	{ value: 'calf', label: 'Calf' },
	{ value: 'shin', label: 'Shin' },
	{ value: 'achilles tendon', label: 'Achilles' },
	{ value: 'ankle', label: 'Ankle' },
	{ value: 'top of the foot', label: 'Top of foot' },
	{ value: 'side of the foot', label: 'Side of foot' },
	{ value: 'behind the ear', label: 'Behind ear' },
	{ value: 'behind the jawline', label: 'Behind jaw' },
	{ value: 'finger', label: 'Finger' },
	{ value: 'between the fingers', label: 'Between fingers' },
	{ value: 'top of the hand', label: 'Top of hand' },
	{ value: 'side of the hand', label: 'Side of hand' }
];

export const FRAMINGS = [
	{ value: 'auto', label: 'Auto', phrase: '' },
	{
		value: 'extreme macro close-up, very shallow depth of field, the tattoo fills the frame',
		label: 'Extreme macro'
	},
	{ value: 'tight close-up, shallow depth of field', label: 'Close-up' },
	{ value: 'medium close-up showing the surrounding body part', label: 'Medium close-up' },
	{ value: 'medium shot showing the upper body', label: 'Medium shot' },
	{ value: 'cowboy shot from mid-thigh up', label: 'Cowboy shot' },
	{ value: 'full-body shot', label: 'Full body' },
	{ value: 'over-the-shoulder shot', label: 'Over-shoulder' }
];

export const CAMERA_ANGLES = [
	{ value: 'auto', label: 'Auto' },
	{ value: 'eye-level angle', label: 'Eye level' },
	{ value: 'slight low angle', label: 'Low angle' },
	{ value: 'slight high angle', label: 'High angle' },
	{ value: 'top-down bird\'s-eye angle', label: 'Bird\'s-eye' },
	{ value: 'three-quarter angle', label: '3/4 angle' },
	{ value: 'profile side view', label: 'Profile' },
	{ value: 'subtle dutch tilt for editorial feel', label: 'Dutch tilt' }
];

export const ASPECT_RATIOS = [
	{ value: '1:1', label: 'Square (1:1)' },
	{ value: '3:4', label: 'Portrait (3:4)' },
	{ value: '4:5', label: 'Instagram (4:5)' },
	{ value: '2:3', label: 'Photo (2:3)' },
	{ value: '9:16', label: 'Stories (9:16)' },
	{ value: '4:3', label: 'Landscape (4:3)' },
	{ value: '3:2', label: 'Photo wide (3:2)' },
	{ value: '16:9', label: 'Widescreen (16:9)' },
	{ value: '21:9', label: 'Ultra-wide (21:9)' }
];

export const LIGHTING_PRESETS = [
	{ value: 'auto', label: 'Auto', phrase: '' },
	{ value: 'large softbox at 45 degrees, even soft light', label: 'Studio softbox' },
	{ value: 'beauty dish lighting, soft and flattering', label: 'Beauty dish' },
	{ value: 'two-light Rembrandt lighting', label: 'Rembrandt' },
	{ value: 'butterfly lighting from above the camera', label: 'Butterfly' },
	{ value: 'split lighting with one side in shadow', label: 'Split lighting' },
	{ value: 'soft window light from the side', label: 'Window light' },
	{ value: 'soft window light from behind, rim light effect', label: 'Window backlit' },
	{ value: 'golden hour backlight, warm rim light', label: 'Golden hour' },
	{ value: 'magic hour soft warm light', label: 'Magic hour' },
	{ value: 'blue hour cool dim light', label: 'Blue hour' },
	{ value: 'overcast diffused daylight, no harsh shadows', label: 'Overcast' },
	{ value: 'midday harsh sun with sharp shadows', label: 'Harsh sun' },
	{ value: 'dappled sunlight through leaves', label: 'Dappled light' },
	{ value: 'single hard key light with dramatic shadows', label: 'Dramatic' },
	{ value: 'soft on-camera flash, slight shadow under chin', label: 'Soft flash' },
	{ value: 'colored gel lighting (magenta and teal)', label: 'Gel lights' },
	{ value: 'neon accent lighting, mixed color sources', label: 'Neon mix' },
	{ value: 'candlelit warm low light', label: 'Candlelight' },
	{ value: 'practical lamp lighting, indoor warm', label: 'Practical lamps' },
	{ value: 'studio lighting', label: 'Generic studio' }
];

export const BACKGROUNDS = [
	{ value: 'auto', label: 'Auto', phrase: '' },
	{ value: 'light grey seamless background', label: 'Light grey studio' },
	{ value: 'soft white seamless background', label: 'Soft white studio' },
	{ value: 'warm beige seamless background', label: 'Warm beige studio' },
	{ value: 'matte black seamless background', label: 'Matte black studio' },
	{ value: 'soft pastel pink gradient background', label: 'Pastel gradient' },
	{ value: 'painted earthy plaster wall background', label: 'Plaster wall' },
	{ value: 'aged terracotta wall background', label: 'Terracotta wall' },
	{ value: 'exposed concrete wall background', label: 'Concrete' },
	{ value: 'red brick wall background', label: 'Brick wall' },
	{ value: 'wooden plank wall background', label: 'Wood wall' },
	{ value: 'draped fabric backdrop background', label: 'Draped fabric' },
	{ value: 'sunlit window indoor background', label: 'Sunlit indoor' },
	{ value: 'minimalist bedroom background, soft daylight', label: 'Bedroom' },
	{ value: 'modern bathroom background, tile and chrome', label: 'Bathroom' },
	{ value: 'cozy cafe background with warm bokeh', label: 'Cafe' },
	{ value: 'industrial warehouse background', label: 'Warehouse' },
	{ value: 'natural plants and foliage background', label: 'Plants' },
	{ value: 'lush garden background', label: 'Garden' },
	{ value: 'forest background with soft light', label: 'Forest' },
	{ value: 'meadow with wildflowers background', label: 'Meadow' },
	{ value: 'beach with soft waves background', label: 'Beach' },
	{ value: 'rocky coastline background', label: 'Coastline' },
	{ value: 'pool side background, blue water bokeh', label: 'Poolside' },
	{ value: 'desert sand dune background', label: 'Desert' },
	{ value: 'snowy landscape background', label: 'Snow' },
	{ value: 'mountain landscape background', label: 'Mountains' },
	{ value: 'urban street background, soft bokeh', label: 'City street' },
	{ value: 'paris street background', label: 'Paris street' },
	{ value: 'tokyo neon street background', label: 'Tokyo neon' },
	{ value: 'rooftop at sunset background', label: 'Rooftop' },
	{ value: 'dark moody background', label: 'Dark moody' }
];

export const PHOTO_STYLES = [
	{ value: 'auto', label: 'Auto' },
	{ value: 'editorial fashion photography', label: 'Editorial fashion' },
	{ value: 'high-end magazine cover photography', label: 'Magazine cover' },
	{ value: 'Vogue-style portrait', label: 'Vogue portrait' },
	{ value: 'Helmut Newton high-contrast b&w style', label: 'Newton b&w' },
	{ value: 'Annie Leibovitz portrait style', label: 'Leibovitz portrait' },
	{ value: 'Kodak Portra 400 film grain', label: 'Portra 400' },
	{ value: 'Fuji 400H pastel film stock', label: 'Fuji 400H' },
	{ value: 'CineStill 800T tungsten halation', label: 'CineStill 800T' },
	{ value: 'Ilford HP5 black and white 35mm film', label: 'Ilford HP5' },
	{ value: 'classic black and white 35mm film', label: 'B&W 35mm' },
	{ value: 'polaroid with soft flash', label: 'Polaroid' },
	{ value: 'candid iPhone snapshot', label: 'iPhone candid' },
	{ value: 'instagram lifestyle aesthetic', label: 'IG lifestyle' },
	{ value: 'documentary street photography', label: 'Documentary' },
	{ value: 'minimalist clean studio commercial', label: 'Clean commercial' },
	{ value: 'vintage 70s film aesthetic', label: '70s film' },
	{ value: '90s grunge editorial', label: '90s grunge' }
];

export const COLOR_GRADES = [
	{ value: 'auto', label: 'Auto' },
	{ value: 'natural neutral color grade', label: 'Natural' },
	{ value: 'warm color grade, slightly desaturated, film-like contrast', label: 'Warm film' },
	{ value: 'cool color grade, soft contrast', label: 'Cool soft' },
	{ value: 'high contrast punchy color grade', label: 'High contrast' },
	{ value: 'teal and orange cinematic color grade', label: 'Teal & orange' },
	{ value: 'bleach bypass desaturated grade', label: 'Bleach bypass' },
	{ value: 'cross-processed color grade', label: 'Cross-process' },
	{ value: 'lifted shadows, low contrast pastel grade', label: 'Lifted pastel' },
	{ value: 'crushed blacks, deep shadow grade', label: 'Crushed blacks' },
	{ value: 'sepia warm vintage grade', label: 'Sepia warm' },
	{ value: 'muted earth tone grade', label: 'Muted earth' },
	{ value: 'vibrant saturated commercial grade', label: 'Vibrant pop' },
	{ value: 'creamy skin tones with green-shifted greens', label: 'Creamy skin' }
];

// ── Multi-select option lists ──────────────────────────────────────────────
// Selected values are appended verbatim to the prompt.

export const POSES = [
	{ value: 'side angle view', label: 'Side angle' },
	{ value: 'three-quarter angle view', label: '3/4 angle' },
	{ value: 'profile view', label: 'Profile' },
	{ value: 'shot from above looking down', label: 'From above' },
	{ value: 'shot from below', label: 'From below' },
	{ value: 'subject looking down at the tattoo', label: 'Looking at tattoo' },
	{ value: 'subject looking away from camera', label: 'Looking away' },
	{ value: 'subject with eyes closed', label: 'Eyes closed' },
	{ value: 'arm relaxed at the side', label: 'Arm relaxed' },
	{ value: 'arm slightly flexed', label: 'Arm flexed' },
	{ value: 'arm raised overhead', label: 'Arm raised' },
	{ value: 'hands behind back', label: 'Hands behind back' },
	{ value: 'hands on hips', label: 'Hands on hips' },
	{ value: 'hand tucking hair behind the ear', label: 'Tucking hair' },
	{ value: 'leaning against a wall', label: 'Leaning' },
	{ value: 'subject seated', label: 'Seated' },
	{ value: 'subject mid-walk', label: 'Walking' },
	{ value: 'subject mid-stretch', label: 'Stretching' }
];

export const ACCESSORIES = [
	{ value: 'wearing delicate gold jewelry', label: 'Gold jewelry' },
	{ value: 'wearing silver rings', label: 'Silver rings' },
	{ value: 'wearing layered necklaces', label: 'Necklaces' },
	{ value: 'wearing small gold hoop earrings', label: 'Gold hoops' },
	{ value: 'wearing a thin wristwatch', label: 'Wristwatch' },
	{ value: 'wearing a leather bracelet', label: 'Leather bracelet' },
	{ value: 'wearing thin sunglasses', label: 'Sunglasses' },
	{ value: 'wearing a baseball cap', label: 'Baseball cap' },
	{ value: 'wearing a beanie', label: 'Beanie' },
	{ value: 'wearing wireless headphones', label: 'Headphones' },
	{ value: 'wearing a plain white t-shirt', label: 'White tee' },
	{ value: 'wearing a black tank top', label: 'Black tank' },
	{ value: 'wearing a cropped top', label: 'Crop top' },
	{ value: 'wearing an oversized sweater', label: 'Oversized sweater' },
	{ value: 'wearing a hoodie', label: 'Hoodie' },
	{ value: 'wearing an unbuttoned linen shirt', label: 'Linen shirt' },
	{ value: 'wearing a denim jacket', label: 'Denim jacket' },
	{ value: 'wearing a leather jacket', label: 'Leather jacket' },
	{ value: 'wearing a bralette', label: 'Bralette' },
	{ value: 'wearing a swimsuit', label: 'Swimsuit' },
	{ value: 'wearing high-waisted jeans', label: 'High jeans' },
	{ value: 'bare shoulders', label: 'Bare shoulders' },
	{ value: 'with painted nails', label: 'Painted nails' },
	{ value: 'with manicured natural nails', label: 'Natural nails' }
];

export const SKIN_DETAILS = [
	{ value: 'sun-kissed skin', label: 'Sun-kissed' },
	{ value: 'with light freckles', label: 'Freckles' },
	{ value: 'with dense freckles across the face and shoulders', label: 'Heavy freckles' },
	{ value: 'with light tan lines', label: 'Tan lines' },
	{ value: 'smooth flawless skin', label: 'Smooth skin' },
	{ value: 'natural skin texture with visible pores', label: 'Natural texture' },
	{ value: 'dewy glowing skin', label: 'Dewy glow' },
	{ value: 'after-shower glow on the skin', label: 'After-shower glow' },
	{ value: 'glistening with light sweat', label: 'Light sweat' },
	{ value: 'lightly oiled skin', label: 'Oiled skin' },
	{ value: 'with water droplets on the skin', label: 'Water droplets' },
	{ value: 'a few fine hairs visible on the skin', label: 'Fine hairs' },
	{ value: 'with a few small beauty marks', label: 'Beauty marks' },
	{ value: 'with subtle stretch marks', label: 'Stretch marks' },
	{ value: 'with subtle scars', label: 'Subtle scars' }
];

export const ATMOSPHERE = [
	{ value: 'soft on-camera flash', label: 'Soft flash' },
	{ value: 'morning light atmosphere', label: 'Morning' },
	{ value: 'late-afternoon warm atmosphere', label: 'Late afternoon' },
	{ value: 'sunset golden atmosphere', label: 'Sunset' },
	{ value: 'shallow depth of field with creamy bokeh', label: 'Creamy bokeh' },
	{ value: 'subtle film grain', label: 'Film grain' },
	{ value: 'heavy film grain', label: 'Heavy grain' },
	{ value: 'soft motion blur in the background', label: 'Background motion' },
	{ value: 'lens flare', label: 'Lens flare' },
	{ value: 'haze or atmospheric fog', label: 'Haze' },
	{ value: 'rain drops on the skin', label: 'Rain on skin' },
	{ value: 'wet hair from rain', label: 'Wet hair' },
	{ value: 'steam rising from a coffee or bath', label: 'Steam' },
	{ value: 'wind blowing the hair', label: 'Wind in hair' },
	{ value: 'falling petals or leaves around the subject', label: 'Falling petals' },
	{ value: 'string lights bokeh in the background', label: 'String lights' }
];

import { readCustoms } from './customs.js';

/**
 * Tattoo style families for design iteration. Each entry's `phrase` is dropped
 * verbatim into the iterate prompt so adding/tuning a style only changes this
 * list. User-added customs are merged in front of this list at build time.
 */
export const TATTOO_STYLES = [
	{ value: 'auto', label: 'Auto', phrase: '' },
	{
		value: 'fine-line',
		label: 'Fine line',
		phrase: 'fine-line tattoo style with thin delicate single-needle linework'
	},
	{
		value: 'traditional-american',
		label: 'American traditional',
		phrase:
			'American traditional tattoo style with bold black outlines and a limited solid-color palette'
	},
	{
		value: 'neo-traditional',
		label: 'Neo-traditional',
		phrase:
			'neo-traditional tattoo style with bold linework and richer color shading'
	},
	{
		value: 'illustrative',
		label: 'Illustrative',
		phrase: 'illustrative tattoo style with painterly detail and texture'
	},
	{
		value: 'blackwork',
		label: 'Blackwork',
		phrase: 'blackwork tattoo style with bold solid black areas and high contrast'
	},
	{
		value: 'linework',
		label: 'Linework only',
		phrase: 'pure linework tattoo style — outlines only, no fill or shading'
	},
	{
		value: 'dotwork',
		label: 'Dotwork',
		phrase: 'dotwork tattoo style with stippled gradients made of fine dots'
	},
	{
		value: 'geometric',
		label: 'Geometric',
		phrase: 'geometric tattoo style with precise lines, shapes and symmetry'
	},
	{
		value: 'sacred-geometry',
		label: 'Sacred geometry',
		phrase:
			'sacred-geometry tattoo style with mandala and symmetrical geometric patterns'
	},
	{
		value: 'watercolor',
		label: 'Watercolor',
		phrase:
			'watercolor tattoo style with soft bleeding washes and translucent color'
	},
	{
		value: 'japanese',
		label: 'Japanese (irezumi)',
		phrase:
			'Japanese irezumi tattoo style with traditional motifs, bold black outlines and saturated color'
	},
	{
		value: 'tribal',
		label: 'Tribal',
		phrase: 'tribal tattoo style with bold solid black geometric patterns'
	},
	{
		value: 'sketch',
		label: 'Sketch',
		phrase:
			'sketch tattoo style with rough handwritten linework, like pen on paper'
	},
	{
		value: 'etching',
		label: 'Etching',
		phrase:
			'etching/engraving tattoo style with cross-hatching and parallel-line shading'
	},
	{
		value: 'realism',
		label: 'Realism',
		phrase: 'realism tattoo style with photographic detail and smooth shading'
	},
	{
		value: 'ornamental',
		label: 'Ornamental',
		phrase:
			'ornamental tattoo style with decorative filigree and lace-like patterns'
	},
	{
		value: 'trash-polka',
		label: 'Trash polka',
		phrase:
			'trash-polka tattoo style mixing realism with red graphic elements and splatters'
	},
	{
		value: 'micro-realism',
		label: 'Micro-realism',
		phrase: 'micro-realism tattoo style with tiny photographic detail'
	}
];

/**
 * Curated background-color swatches for the design-iterate panel. Each entry
 * pairs a hex value with a friendly name we inject into the prompt, so the
 * model gets both ("warm ivory off-white (hex #f5f1e8)").
 */
export const BACKGROUND_COLORS = [
	{ value: '#ffffff', label: 'White', name: 'pure white' },
	{ value: '#f5f1e8', label: 'Ivory', name: 'warm ivory off-white' },
	{ value: '#f0e6d2', label: 'Vellum', name: 'warm vellum cream' },
	{ value: '#d4b896', label: 'Kraft', name: 'kraft paper tan' },
	{ value: '#e5e7eb', label: 'Light grey', name: 'soft light grey' },
	{ value: '#9ca3af', label: 'Mid grey', name: 'neutral mid grey' },
	{ value: '#1f2937', label: 'Charcoal', name: 'deep charcoal' },
	{ value: '#000000', label: 'Black', name: 'pure black' },
	{ value: '#a7b89a', label: 'Sage', name: 'muted sage green' },
	{ value: '#c87760', label: 'Terracotta', name: 'warm terracotta' },
	{ value: '#d9a89a', label: 'Dusty pink', name: 'dusty pink' },
	{ value: '#1e3a5f', label: 'Navy', name: 'deep navy blue' },
	{ value: '#f5d780', label: 'Butter', name: 'soft butter yellow' },
	{ value: '#7c2d12', label: 'Burgundy', name: 'rich burgundy' }
];

/**
 * Faithfulness scale for design iteration. 5 = exact reproduction, 1 = wild
 * reinterpretation. Both the intent line (early in the prompt) and the closer
 * (end of prompt) are tuned per level so the user gets a smooth axis from
 * "same design, varied rendering" to "loose creative riff on the subject".
 */
export const FAITHFULNESS_LEVELS = [
	{ value: 1, label: 'Wild', hint: 'Loose riff — only the subject or motif must remain' },
	{ value: 2, label: 'Free', hint: 'Free recomposition — same theme, new layout' },
	{ value: 3, label: 'Balanced', hint: 'Clear variations, source still recognizable' },
	{ value: 4, label: 'Faithful', hint: 'Same design, vary rendering and small details' },
	{ value: 5, label: 'Exact', hint: 'Pixel-perfect reproduction, only style changes' }
];

/** @type {Record<number, string>} */
const FAITHFULNESS_INTENT = {
	1: 'Use the reference image as loose inspiration only — preserve the subject or motif but reinterpret it freely, with new compositions and bold creative liberties.',
	2: 'Use the reference image as creative inspiration — keep the subject and theme, but recompose the design freely with alternative layouts and complementary elements.',
	3: 'Use the reference image as a strong basis — keep the subject and overall composition, but allow noticeable variations in rendering, line treatment, and ornamental details.',
	4: 'Reproduce the design from the reference image with high fidelity — preserve composition and key elements, allowing only minor stylistic variations in linework and detail.',
	5: 'Reproduce the EXACT design from the reference image with pixel-perfect fidelity — preserve every shape, line, proportion and compositional detail.'
};

/** @type {Record<number, string>} */
const FAITHFULNESS_CLOSER = {
	1: ' WILD REINTERPRETATION: reinterpret the source freely — only the subject or motif needs to remain.',
	2: ' FREE REINTERPRETATION: recompose with confidence while keeping the subject and mood.',
	3: ' BALANCED VARIATION: clear variations are welcome, but the source design must remain recognizable.',
	4: ' HIGH FIDELITY: keep the design recognizably the same, vary only rendering and small details.',
	5: ' STRICT FIDELITY: reproduce the source design exactly. Only the rendering style and background change.'
};

/**
 * Resolve a chip-group selection to its prompt phrase.
 *
 * Built-in option lists come in two flavors:
 *   - Some carry a `.phrase` field (INKS, SIZES, TATTOO_STYLES, …) — use that.
 *   - Others use `.value` directly as the phrase (BODY_PARTS, LIGHTING_PRESETS, …).
 *
 * User-added customs always carry `.phrase`. They get merged in front of the
 * built-in list so they take priority and so this helper handles them too.
 *
 * @param {string} value
 * @param {{value: string, phrase?: string}[]} builtIns
 * @param {string} [customsKey]  group key in $lib/customs.js
 * @returns {string}
 */
export function chipPhrase(value, builtIns, customsKey) {
	if (!value) return '';
	const merged = customsKey ? [...readCustoms(customsKey), ...builtIns] : builtIns;
	const opt = merged.find((o) => o.value === value);
	return opt ? (opt.phrase ?? opt.value) : value;
}

/**
 * Resolve a single value from the multi-select "details" pool — which is a
 * flat array of values that can come from any of POSES, ACCESSORIES,
 * SKIN_DETAILS, or ATMOSPHERE (each of which may have user-added customs).
 *
 * @param {string} value
 * @returns {string}
 */
function resolveDetailPhrase(value) {
	for (const list of [POSES, ACCESSORIES, SKIN_DETAILS, ATMOSPHERE]) {
		const opt = /** @type {{value: string, phrase?: string}} */ (
			list.find((o) => o.value === value)
		);
		if (opt) return opt.phrase ?? opt.value;
	}
	for (const group of ['poses', 'accessories', 'skinDetails', 'atmosphere']) {
		const c = readCustoms(group).find((c) => c.value === value);
		if (c) return c.phrase;
	}
	return value;
}

// ── Phrase maps ─────────────────────────────────────────────────────────────

/** @param {string} value */
function sizePhrase(value) {
	return SIZES.find((s) => s.value === value)?.phrase || 'small tattoo, about 3 cm wide';
}

/** @param {string} value */
function inkEntry(value) {
	return INKS.find((i) => i.value === value) || INKS[0];
}

/** @type {Record<string, string>} */
const STATE_PHRASE = {
	auto: '',
	fresh: 'freshly tattooed, slight redness around the lines, glossy finish',
	healed: 'fully healed tattoo, settled into the skin, matte finish'
};

/** @type {Record<string, string>} */
const MODEL_PHRASE = {
	woman: 'on a woman',
	man: 'on a man',
	either: ''
};

// ── Settings ────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Settings
 * @property {string} size
 * @property {string} ink                ink/color style key from INKS
 * @property {string} state              fresh | healed
 * @property {string} orientation        auto | reads-toward-hand | ...
 * @property {string} bodyPart
 * @property {string} model              woman | man | either
 * @property {string} skinTone           auto | "very fair" | ...
 * @property {string} ageBracket         auto | "in their 20s" | ...
 * @property {string} bodyType           auto | slim | athletic | curvy | ...
 * @property {string} existingTattoos    none | matching-style | few-black | ...
 * @property {string} framing
 * @property {string} cameraAngle        auto | eye-level | low | high | ...
 * @property {string} aspectRatio        "1:1" | "3:4" | ...
 * @property {string} lighting
 * @property {string} background
 * @property {string} photoStyle         auto | "editorial fashion photography" | ...
 * @property {string} colorGrade         auto | ...
 * @property {boolean} stickToIllustration
 * @property {string[]} details          multi-select fragments
 * @property {string} [extra]
 */

/** @type {Settings} */
export const DEFAULT_SETTINGS = {
	size: 'tiny',
	ink: 'black',
	state: 'auto',
	orientation: 'auto',
	bodyPart: 'inner wrist',
	model: 'woman',
	skinTone: 'auto',
	ageBracket: 'auto',
	bodyType: 'auto',
	existingTattoos: 'none',
	framing: 'tight close-up, shallow depth of field',
	cameraAngle: 'auto',
	aspectRatio: '1:1',
	lighting: 'large softbox at 45 degrees, even soft light',
	background: 'light grey seamless background',
	photoStyle: 'auto',
	colorGrade: 'auto',
	stickToIllustration: true,
	details: [],
	extra: ''
};

// ── Builder ─────────────────────────────────────────────────────────────────

/**
 * Build the text prompt sent to Gemini. The reference tattoo image is sent
 * separately as inline data alongside this text.
 *
 * @param {Settings} s
 * @returns {string}
 */
export function buildPrompt(s) {
	const size = chipPhrase(s.size, SIZES, 'sizes') || 'small tattoo, about 3 cm wide';
	const ink = inkEntry(s.ink);

	const opener = s.stickToIllustration
		? `A ${size}, in ${ink.phrase}, of the EXACT design shown in the reference image. `
		: `A ${size}, in ${ink.phrase}. `;

	/** @type {string[]} */
	const parts = [];

	// Every chip-group field below routes through chipPhrase so user-added
	// customs land in the prompt the same way as built-ins, and 'auto'
	// entries (phrase: '') are silently skipped.
	const bodyPart = chipPhrase(s.bodyPart, BODY_PARTS, 'bodyParts');
	if (bodyPart) parts.push(`tattoo on the ${bodyPart}`);
	const orient = chipPhrase(s.orientation, ORIENTATIONS, 'orientations');
	if (orient) parts.push(orient);
	const state = STATE_PHRASE[s.state];
	if (state) parts.push(state);

	const modelPhrase = MODEL_PHRASE[s.model];
	if (modelPhrase) parts.push(modelPhrase);
	const skinTone = chipPhrase(s.skinTone, SKIN_TONES, 'skinTones');
	if (skinTone) parts.push(skinTone);
	const ageBracket = chipPhrase(s.ageBracket, AGE_BRACKETS, 'ageBrackets');
	if (ageBracket) parts.push(ageBracket);
	const bodyType = chipPhrase(s.bodyType, BODY_TYPES, 'bodyTypes');
	if (bodyType) parts.push(bodyType);

	const existing = chipPhrase(s.existingTattoos, EXISTING_TATTOOS, 'existingTattoos');
	if (existing) parts.push(existing);

	// Framing + angle + lighting + background. Each routes through chipPhrase
	// so an 'auto' value (phrase: '') is silently skipped from the prompt.
	const framing = chipPhrase(s.framing, FRAMINGS, 'framings');
	if (framing) parts.push(framing);
	if (s.cameraAngle && s.cameraAngle !== 'auto') {
		parts.push(chipPhrase(s.cameraAngle, CAMERA_ANGLES, 'cameraAngles'));
	}
	parts.push('tattoo photo shoot');
	const lighting = chipPhrase(s.lighting, LIGHTING_PRESETS, 'lighting');
	if (lighting) parts.push(lighting);
	const background = chipPhrase(s.background, BACKGROUNDS, 'backgrounds');
	if (background) parts.push(background);

	// Style + grading
	if (s.photoStyle && s.photoStyle !== 'auto') {
		parts.push(chipPhrase(s.photoStyle, PHOTO_STYLES, 'photoStyles'));
	}
	if (s.colorGrade && s.colorGrade !== 'auto') {
		parts.push(chipPhrase(s.colorGrade, COLOR_GRADES, 'colorGrades'));
	}
	parts.push('great composition');
	parts.push('cinematic');

	// Aspect ratio hint (also passed via API config; phrase helps non-Pro models too)
	if (s.aspectRatio && s.aspectRatio !== '1:1') {
		parts.push(`${s.aspectRatio} aspect ratio framing`);
	}

	// Multi-select details (custom values are resolved to their saved phrases)
	if (Array.isArray(s.details)) {
		for (const d of s.details) {
			const phrase = resolveDetailPhrase(d);
			if (phrase) parts.push(phrase);
		}
	}

	// Extras
	if (s.extra && s.extra.trim()) parts.push(s.extra.trim());

	let prompt = opener + parts.join(', ');

	// Exclusions — only enforce "no other tattoos" when the user explicitly
	// asked for clean skin. If they picked an existing-tattoos style, allow it.
	if (s.existingTattoos === 'none') {
		prompt +=
			'. Clean skin, no other tattoos visible, no jewelry beyond what is specified, no added captions, no watermark, no signature. Lettering that is part of the tattoo design itself is allowed.';
	} else {
		prompt += '. No added captions, no watermark, no signature. Lettering that is part of the tattoo design itself is allowed.';
	}

	// Color emphasis. For specific palettes we point the model at the colors
	// as inspiration with a dominant-tone hint, rather than hard-locking it —
	// strict palette directives often produced flat-looking work.
	if (ink.value === 'black') {
		prompt += ' IMPORTANT: the tattoo must be solid black ink only — no color, no greyscale shading.';
	} else if (ink.value === 'grey-shading') {
		prompt += ' IMPORTANT: the tattoo must be black and grey ink only — no color.';
	} else if (ink.isColor && ink.value !== 'color-auto') {
		prompt += ` Use ${ink.phrase} as the color inspiration — let one of those colors be the dominant tone. Do not render the design in plain black.`;
	} else if (ink.value === 'color-auto') {
		prompt += ' Render the design in color ink, not plain black.';
	}

	// Size emphasis — repeat at the end. Subjective sizing is the most-ignored
	// instruction in practice, so we bookend it with a concrete anchor.
	prompt += ` IMPORTANT: the tattoo must be ${size} — not larger, not smaller.`;

	// Fidelity closer
	if (s.stickToIllustration) {
		prompt +=
			' Reproduce the provided tattoo design with pixel-perfect fidelity — same shapes, lines and proportions — without redrawing, restyling, or adding line work. The tattoo should look realistically inked on the skin with proper ink absorption and slight skin texture.';
	} else {
		prompt +=
			' The tattoo should look realistically inked on the skin with proper ink absorption and slight skin texture.';
	}

	return prompt;
}

// ── Iterate settings + builder ─────────────────────────────────────────────

/**
 * @typedef {Object} IterateSettings
 * @property {number} faithfulness       1..5 — see FAITHFULNESS_LEVELS
 * @property {string} ink                key from INKS
 * @property {string} tattooStyle        key from TATTOO_STYLES (or 'auto')
 * @property {string} aspectRatio        "1:1" | "3:4" | ...
 * @property {string} backgroundColor    hex like "#f5f1e8"
 * @property {number} designsPerSheet    1..10 — designs in a single output image
 * @property {string} [extra]
 */

/** @type {IterateSettings} */
export const DEFAULT_ITERATE_SETTINGS = {
	faithfulness: 4,
	ink: 'black',
	tattooStyle: 'auto',
	aspectRatio: '1:1',
	backgroundColor: '#f5f1e8',
	designsPerSheet: 1,
	extra: ''
};

/**
 * @param {string} hex
 * @returns {string} prompt-ready phrase ("warm ivory off-white (hex #f5f1e8)")
 */
function backgroundPhrase(hex) {
	const norm = (hex || '').toLowerCase();
	const builtIn = BACKGROUND_COLORS.find((c) => c.value.toLowerCase() === norm);
	if (builtIn) return `${builtIn.name} (hex ${norm})`;
	const custom = readCustoms('colorSwatches').find((c) => c.value.toLowerCase() === norm);
	if (custom) return `${custom.label} (hex ${norm})`;
	return `solid color hex ${norm}`;
}

/**
 * Build the prompt for design iteration. Output must be a flat 2D illustration
 * on a colored paper background — like a scanned tattoo flash sheet page —
 * with NO body, NO skin, NO scene. The model is biased toward photographic
 * output, so the prompt leads with "flat illustration, not a photograph"
 * and stacks negatives at the end.
 *
 * @param {IterateSettings} s
 * @returns {string}
 */
export function buildIteratePrompt(s) {
	const ink = inkEntry(s.ink);
	const allTattooStyles = [...readCustoms('tattooStyles'), ...TATTOO_STYLES];
	const style = allTattooStyles.find((t) => t.value === s.tattooStyle)?.phrase || '';
	const bg = backgroundPhrase(s.backgroundColor);
	const n = Math.max(1, Math.min(10, Number(s.designsPerSheet) | 0 || 1));
	const f = Math.max(1, Math.min(5, Number(s.faithfulness) | 0 || 4));
	const intent = FAITHFULNESS_INTENT[f];
	const closer = FAITHFULNESS_CLOSER[f];

	/** @type {string[]} */
	const renderingBits = [`rendered in ${ink.phrase}`];
	if (style) renderingBits.push(style);
	const rendering = renderingBits.join(', ');

	const aspect =
		s.aspectRatio && s.aspectRatio !== '1:1'
			? ` Format: ${s.aspectRatio} aspect ratio.`
			: '';
	const extras = s.extra && s.extra.trim() ? ` Notes: ${s.extra.trim()}.` : '';

	/** @type {string} */
	let prompt;
	if (n === 1) {
		prompt =
			'A flat 2D illustration of a tattoo design, drawn on paper — like a scanned page from a tattoo flash sheet. ' +
			'This is artwork on paper, NOT a photograph, NOT a tattoo on skin, NOT a scene. ' +
			'The image shows ONLY the design itself, isolated on a flat colored paper field. ' +
			intent +
			` Rendering: ${rendering}.` +
			` Background: pure flat ${bg} paper, edge to edge, evenly colored, with no shadow, no gradient, no vignette, no texture, no body, no skin, no scene, no environment.` +
			aspect +
			extras;
	} else {
		const multiIntent =
			f >= 4
				? `Each of the ${n} designs is a distinct variation of the source — composition and key elements are preserved across all ${n}, with differences in rendering choices (line weight, shading approach, level of detail, ornamental flourishes).`
				: f === 3
					? `Each of the ${n} designs varies from the source — same subject and overall composition, with clear differences in rendering, line treatment, and ornamental details across the ${n}.`
					: `Each of the ${n} designs is a free reinterpretation of the source — same subject and theme, but each uses an alternative layout and complementary elements.`;

		prompt =
			`A tattoo flash sheet — a single page showing ${n} distinct tattoo designs arranged in a clean grid layout with clear visual separation between each design. ` +
			'This is flat 2D artwork on paper, NOT a photograph, NOT tattoos on skin, NOT a scene. ' +
			intent +
			' ' +
			multiIntent +
			` Rendering: ${rendering}.` +
			` Background: pure flat ${bg} paper across the entire sheet, edge to edge, evenly colored, with no shadow, no gradient, no vignette, no texture, no body, no skin, no scene, no environment.` +
			aspect +
			extras;
	}

	if (ink.value === 'black') {
		prompt += ' IMPORTANT: solid black ink only — no color, no greyscale shading.';
	} else if (ink.value === 'grey-shading') {
		prompt += ' IMPORTANT: black and grey ink only — no color.';
	} else if (ink.isColor && ink.value !== 'color-auto') {
		prompt += ` Use ${ink.phrase} as the color inspiration — let one of those colors be the dominant tone. Do not render in plain black.`;
	} else if (ink.value === 'color-auto') {
		prompt += ' Render in color ink, not plain black.';
	}

	prompt +=
		' STRICT NEGATIVES: NO photograph, NO realistic skin, NO body part, NO person, NO human, NO model, NO 3D rendering, NO scene, NO environment, NO depth of field, NO photographic lighting, NO print bleed, NO added captions, NO labels, NO title or heading text, NO watermark, NO signature. Lettering that is part of the source design is allowed and should be reproduced. The output must look like flat 2D illustration / line art on colored paper, viewed straight-on.';

	if (n > 1) {
		prompt += ` IMPORTANT: the output must contain exactly ${n} distinct tattoo designs on a single flash-sheet page, arranged with clear visual separation between each. Do not merge them into one design. Do not output fewer than ${n} designs.`;
	}

	prompt += closer;

	return prompt;
}

