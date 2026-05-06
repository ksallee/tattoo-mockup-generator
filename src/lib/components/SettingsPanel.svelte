<script>
	import {
		SIZES,
		INKS,
TATTOO_STATES,
		ORIENTATIONS,
		MODELS,
		SKIN_TONES,
		AGE_BRACKETS,
		BODY_TYPES,
		EXISTING_TATTOOS,
		BODY_PARTS,
		FRAMINGS,
		CAMERA_ANGLES,
		ASPECT_RATIOS,
		LIGHTING_PRESETS,
		BACKGROUNDS,
		PHOTO_STYLES,
		COLOR_GRADES,
		POSES,
		ACCESSORIES,
		SKIN_DETAILS,
		ATMOSPHERE
	} from '$lib/prompt.js';
	import { pickOne, pickN, randInt } from '$lib/random.js';
	import Collapsible from './Collapsible.svelte';
	import ChipGroup from './ChipGroup.svelte';
	import MultiChipGroup from './MultiChipGroup.svelte';
	import Chip from './Chip.svelte';
	import InkPicker from './InkPicker.svelte';

	let { settings = $bindable(), count = $bindable(2) } = $props();

	/**
	 * @param {{value:string,label:string}[]} list
	 * @param {string} value
	 */
	function labelFor(list, value) {
		return list.find((o) => o.value === value)?.label ?? value;
	}

	const COUNT_OPTIONS = [
		{ value: 1, label: '1' },
		{ value: 2, label: '2' },
		{ value: 3, label: '3' },
		{ value: 4, label: '4' }
	];

	function randomizeTattoo() {
		settings.ink = pickOne(INKS);
		settings.size = pickOne(SIZES);
		settings.state = pickOne(TATTOO_STATES, ['auto']);
		settings.orientation = pickOne(ORIENTATIONS, ['auto']);
	}

	function randomizeSubject() {
		settings.bodyPart = pickOne(BODY_PARTS);
		settings.model = pickOne(MODELS, ['either']);
		settings.skinTone = pickOne(SKIN_TONES, ['auto']);
		settings.ageBracket = pickOne(AGE_BRACKETS, ['auto']);
		settings.bodyType = pickOne(BODY_TYPES, ['auto']);
		settings.existingTattoos = pickOne(EXISTING_TATTOOS);
	}

	function randomizePhoto() {
		settings.framing = pickOne(FRAMINGS);
		settings.cameraAngle = pickOne(CAMERA_ANGLES, ['auto']);
		settings.aspectRatio = pickOne(ASPECT_RATIOS);
		settings.lighting = pickOne(LIGHTING_PRESETS);
		settings.background = pickOne(BACKGROUNDS);
		settings.photoStyle = pickOne(PHOTO_STYLES, ['auto']);
		settings.colorGrade = pickOne(COLOR_GRADES, ['auto']);
	}

	function randomizeDetails() {
		const all = [...POSES, ...ACCESSORIES, ...SKIN_DETAILS, ...ATMOSPHERE];
		settings.details = pickN(all, randInt(2, 5));
	}

	function randomizeAll() {
		randomizeTattoo();
		randomizeSubject();
		randomizePhoto();
		randomizeDetails();
	}
</script>

<div class="panel">
	<div class="panel-actions">
		<button type="button" class="btn btn-ghost" onclick={randomizeAll}>
			<iconify-icon icon="lucide:dices"></iconify-icon>
			Randomize all
		</button>
	</div>

	<Collapsible
		title="Tattoo"
		summary={[
			labelFor(INKS, settings.ink),
			labelFor(SIZES, settings.size),
			labelFor(TATTOO_STATES, settings.state)
		].join(' · ')}
		randomize={randomizeTattoo}
		randomizeLabel="Randomize Tattoo"
	>
		<InkPicker bind:value={settings.ink} />
		<ChipGroup label="Size" options={SIZES} bind:value={settings.size} />
		<ChipGroup label="State" options={TATTOO_STATES} bind:value={settings.state} />
		<ChipGroup label="Orientation" options={ORIENTATIONS} bind:value={settings.orientation} />
	</Collapsible>

	<Collapsible
		title="Subject"
		summary={[
			labelFor(BODY_PARTS, settings.bodyPart),
			labelFor(MODELS, settings.model),
			labelFor(SKIN_TONES, settings.skinTone)
		].join(' · ')}
		randomize={randomizeSubject}
		randomizeLabel="Randomize Subject"
	>
		<ChipGroup
			label="Body part"
			options={BODY_PARTS}
			bind:value={settings.bodyPart}
			customsKey="bodyParts"
			phraseHint="Location for the tattoo, e.g. 'side of the calf'"
		/>
		<ChipGroup label="Model" options={MODELS} bind:value={settings.model} />
		<ChipGroup label="Skin tone" options={SKIN_TONES} bind:value={settings.skinTone} />
		<ChipGroup label="Age" options={AGE_BRACKETS} bind:value={settings.ageBracket} />
		<ChipGroup label="Body type" options={BODY_TYPES} bind:value={settings.bodyType} />
		<ChipGroup
			label="Existing tattoos"
			options={EXISTING_TATTOOS}
			bind:value={settings.existingTattoos}
		/>
	</Collapsible>

	<Collapsible
		title="Photo"
		summary={[
			labelFor(FRAMINGS, settings.framing).split(',')[0],
			settings.aspectRatio,
			labelFor(BACKGROUNDS, settings.background)
		].join(' · ')}
		randomize={randomizePhoto}
		randomizeLabel="Randomize Photo"
	>
		<ChipGroup label="Framing" options={FRAMINGS} bind:value={settings.framing} />
		<ChipGroup label="Camera angle" options={CAMERA_ANGLES} bind:value={settings.cameraAngle} />
		<ChipGroup label="Aspect ratio" options={ASPECT_RATIOS} bind:value={settings.aspectRatio} />
		<ChipGroup
			label="Lighting"
			options={LIGHTING_PRESETS}
			bind:value={settings.lighting}
			customsKey="lighting"
			phraseHint="Lighting description, e.g. 'soft window light from behind'"
		/>
		<ChipGroup
			label="Background"
			options={BACKGROUNDS}
			bind:value={settings.background}
			customsKey="backgrounds"
			phraseHint="Background description, e.g. 'aged stone wall background'"
		/>
		<ChipGroup
			label="Photo style"
			options={PHOTO_STYLES}
			bind:value={settings.photoStyle}
			customsKey="photoStyles"
			phraseHint="Photographic style, e.g. 'analog film aesthetic'"
		/>
		<ChipGroup
			label="Color grade"
			options={COLOR_GRADES}
			bind:value={settings.colorGrade}
			customsKey="colorGrades"
			phraseHint="Color grade, e.g. 'matte film grade'"
		/>
	</Collapsible>

	<Collapsible
		title="Details (multi-select)"
		summary={settings.details.length
			? `${settings.details.length} selected`
			: 'pose · accessories · skin · atmosphere'}
		randomize={randomizeDetails}
		randomizeLabel="Randomize Details"
	>
		<MultiChipGroup label="Pose / angle" options={POSES} bind:values={settings.details} />
		<MultiChipGroup
			label="Accessories / clothing"
			options={ACCESSORIES}
			bind:values={settings.details}
		/>
		<MultiChipGroup label="Skin" options={SKIN_DETAILS} bind:values={settings.details} />
		<MultiChipGroup label="Atmosphere" options={ATMOSPHERE} bind:values={settings.details} />
	</Collapsible>

	<div class="row toggles">
		<label class="toggle">
			<input type="checkbox" bind:checked={settings.stickToIllustration} />
			<span>Reproduce exactly</span>
		</label>
	</div>

	<div class="field">
		<label class="field-label" for="extra-input">Extra details (optional)</label>
		<input
			id="extra-input"
			class="input"
			type="text"
			placeholder="e.g. wearing a surfing bikini, side angle, golden hour"
			bind:value={settings.extra}
		/>
	</div>

	<div class="field">
		<div class="field-label">Variations</div>
		<div class="chips">
			{#each COUNT_OPTIONS as opt (opt.value)}
				<Chip active={count === opt.value} onclick={() => (count = opt.value)}>
					{opt.label}
				</Chip>
			{/each}
		</div>
	</div>
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.panel-actions {
		display: flex;
		justify-content: flex-end;
	}
	.row {
		display: flex;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.toggles {
		padding: 0 var(--space-2);
	}
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		cursor: pointer;
	}
	.toggle input {
		accent-color: var(--color-accent);
	}
	.chips {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}
</style>
