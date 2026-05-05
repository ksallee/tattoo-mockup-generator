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
	{ value: 'auto', label: 'Auto' },
	{ value: 'reads-toward-hand', label: 'Reads toward hand/foot' },
	{ value: 'reads-toward-shoulder', label: 'Reads toward shoulder/torso' },
	{ value: 'horizontal', label: 'Horizontal' },
	{ value: 'vertical', label: 'Vertical' },
	{ value: 'diagonal', label: 'Diagonal' }
];

export const MODELS = [
	{ value: 'woman', label: 'Woman' },
	{ value: 'man', label: 'Man' },
	{ value: 'either', label: 'Either' }
];

export const SKIN_TONES = [
	{ value: 'auto', label: 'Auto' },
	{ value: 'very fair porcelain', label: 'Very fair' },
	{ value: 'fair pink-undertone', label: 'Fair pink' },
	{ value: 'fair neutral', label: 'Fair neutral' },
	{ value: 'light olive', label: 'Light olive' },
	{ value: 'medium olive', label: 'Medium olive' },
	{ value: 'tan golden', label: 'Tan golden' },
	{ value: 'warm caramel', label: 'Warm caramel' },
	{ value: 'warm brown', label: 'Warm brown' },
	{ value: 'rich brown', label: 'Rich brown' },
	{ value: 'deep brown', label: 'Deep brown' },
	{ value: 'deep ebony', label: 'Deep ebony' }
];

export const AGE_BRACKETS = [
	{ value: 'auto', label: 'Auto' },
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
	{ value: 'none', label: 'Clean skin' },
	{ value: 'matching-style', label: 'Matching style' },
	{ value: 'matching-color', label: 'Matching color' },
	{ value: 'few-black', label: 'A few black tattoos' },
	{ value: 'many-black', label: 'Heavily black-tattooed' },
	{ value: 'few-color', label: 'A few color tattoos' },
	{ value: 'many-color', label: 'Heavily color-tattooed' },
	{ value: 'mixed', label: 'Mixed black + color' },
	{ value: 'sleeve-black', label: 'Black sleeve' },
	{ value: 'sleeve-color', label: 'Color sleeve' },
	{ value: 'fine-line-set', label: 'Fine-line set' },
	{ value: 'minimalist-set', label: 'Minimalist set' },
	{ value: 'traditional-set', label: 'Traditional set' }
];

export const BODY_TYPES = [
	{ value: 'auto', label: 'Auto' },
	{ value: 'slim', label: 'Slim' },
	{ value: 'lean athletic', label: 'Lean athletic' },
	{ value: 'athletic muscular', label: 'Athletic muscular' },
	{ value: 'curvy', label: 'Curvy' },
	{ value: 'plus-size', label: 'Plus-size' },
	{ value: 'petite', label: 'Petite' },
	{ value: 'tall slender', label: 'Tall slender' }
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
const EXISTING_TATTOOS_PHRASE = {
	'none': '',
	'matching-style':
		'with several other existing tattoos in a matching style and aesthetic visible nearby on the body',
	'matching-color':
		'with several other existing tattoos in matching colors visible nearby on the body',
	'few-black': 'with a few existing small black ink tattoos visible nearby on the body',
	'many-black':
		'heavily tattooed in black ink with many existing black tattoos visible across the body',
	'few-color': 'with a few existing small color tattoos visible nearby on the body',
	'many-color':
		'heavily tattooed with many existing colorful tattoos visible across the body',
	'mixed':
		'with several existing tattoos visible on the body — a mix of black and color work',
	'sleeve-black': 'with an existing full black ink sleeve tattoo on the same arm',
	'sleeve-color': 'with an existing full color sleeve tattoo on the same arm',
	'fine-line-set': 'with several existing fine-line tattoos visible nearby on the body',
	'minimalist-set':
		'with several existing minimalist line-art tattoos visible nearby on the body',
	'traditional-set':
		'with several existing American traditional style tattoos visible nearby on the body'
};

/** @type {Record<string, string>} */
const ORIENTATION_PHRASE = {
	'auto': '',
	'reads-toward-hand': 'oriented so the top of the design points toward the hand or foot',
	'reads-toward-shoulder': 'oriented so the top of the design points toward the shoulder or torso',
	'horizontal': 'oriented horizontally along the body part',
	'vertical': 'oriented vertically along the body part',
	'diagonal': 'oriented diagonally across the body part'
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
	const size = sizePhrase(s.size);
	const ink = inkEntry(s.ink);

	const opener = s.stickToIllustration
		? `A ${size}, in ${ink.phrase}, of the EXACT design shown in the reference image. `
		: `A ${size}, in ${ink.phrase}. `;

	/** @type {string[]} */
	const parts = [];

	// Tattoo body + placement
	parts.push(`tattoo on the ${s.bodyPart}`);
	const orient = ORIENTATION_PHRASE[s.orientation];
	if (orient) parts.push(orient);
	const state = STATE_PHRASE[s.state];
	if (state) parts.push(state);

	// Subject
	const modelPhrase = MODEL_PHRASE[s.model];
	if (modelPhrase) parts.push(modelPhrase);
	if (s.skinTone && s.skinTone !== 'auto') parts.push(`${s.skinTone} skin tone`);
	if (s.ageBracket && s.ageBracket !== 'auto') parts.push(s.ageBracket);
	if (s.bodyType && s.bodyType !== 'auto') parts.push(`${s.bodyType} build`);

	// Existing tattoos on the model's skin (or explicit "clean")
	const existing = EXISTING_TATTOOS_PHRASE[s.existingTattoos];
	if (existing) parts.push(existing);

	// Framing + angle + lighting + background
	if (s.framing) parts.push(s.framing);
	if (s.cameraAngle && s.cameraAngle !== 'auto') parts.push(s.cameraAngle);
	parts.push('tattoo photo shoot');
	parts.push(s.lighting || 'studio lighting');
	parts.push(s.background);

	// Style + grading
	if (s.photoStyle && s.photoStyle !== 'auto') parts.push(s.photoStyle);
	if (s.colorGrade && s.colorGrade !== 'auto') parts.push(s.colorGrade);
	parts.push('great composition');
	parts.push('cinematic');

	// Aspect ratio hint (also passed via API config; phrase helps non-Pro models too)
	if (s.aspectRatio && s.aspectRatio !== '1:1') {
		parts.push(`${s.aspectRatio} aspect ratio framing`);
	}

	// Multi-select details
	if (Array.isArray(s.details)) {
		for (const d of s.details) if (d) parts.push(d);
	}

	// Extras
	if (s.extra && s.extra.trim()) parts.push(s.extra.trim());

	let prompt = opener + parts.join(', ');

	// Exclusions — only enforce "no other tattoos" when the user explicitly
	// asked for clean skin. If they picked an existing-tattoos style, allow it.
	if (s.existingTattoos === 'none') {
		prompt +=
			'. Clean skin, no other tattoos visible, no jewelry beyond what is specified, no text, no watermark.';
	} else {
		prompt += '. No text, no watermark.';
	}

	// Color emphasis: bookend the ink instruction so the model actually
	// follows the palette rather than defaulting to black or random colors.
	if (ink.value === 'black') {
		prompt += ' IMPORTANT: the tattoo must be solid black ink only — no color, no greyscale shading.';
	} else if (ink.value === 'grey-shading') {
		prompt += ' IMPORTANT: the tattoo must be black and grey ink only — no color.';
	} else if (ink.isColor && ink.value !== 'color-auto') {
		prompt += ` IMPORTANT: the tattoo must be inked using ${ink.phrase}. Do not use colors outside this palette, and do not render the design in plain black.`;
	} else if (ink.value === 'color-auto') {
		prompt += ' IMPORTANT: the tattoo must be in color ink, not plain black.';
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
