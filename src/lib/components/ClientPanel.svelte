<script>
	import { onMount } from 'svelte';
	import ImageDropzone from './ImageDropzone.svelte';
	import PromptBox from './PromptBox.svelte';
	import ResultsGrid from './ResultsGrid.svelte';
	import InkPicker from './InkPicker.svelte';
	import ChipGroup from './ChipGroup.svelte';
	import Chip from './Chip.svelte';
	import {
		buildClientPrompt,
		DEFAULT_CLIENT_SETTINGS,
		SIZES,
		TATTOO_STATES,
		ORIENTATIONS,
		BODY_PARTS,
		ASPECT_RATIOS
	} from '$lib/prompt.js';
	import { generateMockups } from '$lib/client/api.js';
	import { readJSON, writeJSON, STORAGE_KEYS } from '$lib/storage.js';

	let { apiKey, model } = $props();

	/** @type {{mimeType:string,data:string} | null} */
	let design = $state(null);
	let designPreviewUrl = $state('');

	/** @type {{mimeType:string,data:string} | null} */
	let bodyPhoto = $state(null);
	let bodyPreviewUrl = $state('');

	let settings = $state({ ...DEFAULT_CLIENT_SETTINGS });
	let count = $state(2);

	let promptText = $state(buildClientPrompt(DEFAULT_CLIENT_SETTINGS));
	let promptDirty = $state(false);
	const autoPrompt = $derived(buildClientPrompt(settings));

	$effect(() => {
		if (!promptDirty) promptText = autoPrompt;
	});

	let generating = $state(false);
	let error = $state('');
	let results = $state(/** @type {{mimeType:string,data:string}[]} */ ([]));
	let resultMeta = $state({ aspectRatio: 'auto', count: 2 });

	const ASPECT_OPTIONS = [{ value: 'auto', label: 'Match photo' }, ...ASPECT_RATIOS];

	const COUNT_OPTIONS = [
		{ value: 1, label: '1' },
		{ value: 2, label: '2' },
		{ value: 3, label: '3' },
		{ value: 4, label: '4' }
	];

	onMount(() => {
		settings = {
			...DEFAULT_CLIENT_SETTINGS,
			...readJSON(STORAGE_KEYS.clientSettings, {})
		};
	});

	$effect(() => writeJSON(STORAGE_KEYS.clientSettings, settings));

	const canGenerate = $derived(
		!!apiKey && !!model && !!design && !!bodyPhoto && !!promptText.trim() && !generating
	);

	async function generate() {
		if (!canGenerate || !design || !bodyPhoto) return;
		generating = true;
		error = '';
		results = [];
		resultMeta = { aspectRatio: settings.aspectRatio, count };
		try {
			results = await generateMockups({
				apiKey,
				model,
				prompt: promptText,
				image: design,
				refImages: [
					{ role: 'body-scene', mimeType: bodyPhoto.mimeType, data: bodyPhoto.data }
				],
				count,
				aspectRatio: settings.aspectRatio === 'auto' ? undefined : settings.aspectRatio
			});
			if (results.length < resultMeta.count) {
				error = `Only ${results.length} of ${resultMeta.count} images returned (some calls failed or were filtered).`;
			}
		} catch (/** @type {any} */ e) {
			error = e.message || 'Something went wrong';
		} finally {
			generating = false;
		}
	}
</script>

<section class="card row">
	<h2 class="row-title">1. Tattoo design</h2>
	<p class="hint">The artwork to apply onto your client's body.</p>
	<ImageDropzone bind:image={design} bind:previewUrl={designPreviewUrl} />
</section>

<section class="card row">
	<h2 class="row-title">2. Client photo</h2>
	<p class="hint">A photo of your client's body — the design will be applied to them.</p>
	<ImageDropzone bind:image={bodyPhoto} bind:previewUrl={bodyPreviewUrl} />
</section>

<section class="card row">
	<h2 class="row-title">3. Placement & ink</h2>

	<ChipGroup
		label="Body part"
		options={BODY_PARTS}
		bind:value={settings.bodyPart}
		customsKey="bodyParts"
		phraseHint="Location for the tattoo, e.g. 'side of the calf'"
	/>

	<InkPicker bind:value={settings.ink} />

	<ChipGroup label="Size" options={SIZES} bind:value={settings.size} />

	<ChipGroup label="State" options={TATTOO_STATES} bind:value={settings.state} />

	<ChipGroup label="Orientation" options={ORIENTATIONS} bind:value={settings.orientation} />

	<ChipGroup label="Aspect ratio" options={ASPECT_OPTIONS} bind:value={settings.aspectRatio} />

	<div class="field">
		<label class="field-label" for="client-extra-input">Extra details (optional)</label>
		<input
			id="client-extra-input"
			class="input"
			type="text"
			placeholder="e.g. slightly faded vintage feel, soft shadow under arm"
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
</section>

<section class="card row">
	<PromptBox bind:value={promptText} autoValue={autoPrompt} bind:dirty={promptDirty} />
</section>

<section class="row generate-row">
	<button
		type="button"
		class="btn btn-accent generate"
		disabled={!canGenerate}
		onclick={generate}
	>
		<iconify-icon
			icon={generating ? 'lucide:loader-2' : 'lucide:sparkles'}
			class:spin={generating}
		></iconify-icon>
		{generating ? 'Generating…' : `Generate ${count} mockup${count > 1 ? 's' : ''}`}
	</button>

	{#if !apiKey}
		<div class="hint">Add your Google AI Studio API key above to start.</div>
	{:else if !design}
		<div class="hint">Upload the tattoo design to enable generation.</div>
	{:else if !bodyPhoto}
		<div class="hint">Upload your client's photo to enable generation.</div>
	{/if}

	{#if error}
		<div class="error">{error}</div>
	{/if}
</section>

{#if generating || results.length}
	<section class="card row">
		<h2 class="row-title">Results</h2>
		<ResultsGrid
			images={results}
			loading={generating}
			count={resultMeta.count}
			aspectRatio={resultMeta.aspectRatio === 'auto' ? '1:1' : resultMeta.aspectRatio}
		/>
	</section>
{/if}

<style>
	.row {
		width: 100%;
	}
	.card.row {
		padding: var(--space-5) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.row-title {
		font-family: var(--font-display);
		font-size: var(--font-size-xl);
		margin: 0;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.field-label {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.chips {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}
	.generate-row {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}
	.generate {
		min-width: 16rem;
		padding: 0.875rem 1.5rem;
		font-size: var(--font-size-base);
		gap: 0.5rem;
	}
	.generate :global(iconify-icon) {
		font-size: 1.15em;
		line-height: 0;
	}
	:global(.spin) {
		animation: spin 0.9s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.hint {
		font-size: var(--font-size-sm);
		color: var(--color-text-dimmed);
		margin: 0;
	}
	.error {
		background: color-mix(in srgb, var(--color-error) 8%, transparent);
		color: var(--color-error);
		border: 1px solid color-mix(in srgb, var(--color-error) 25%, transparent);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		white-space: pre-wrap;
		word-break: break-word;
		max-width: 40rem;
		text-align: center;
	}
	@media (max-width: 640px) {
		.card.row {
			padding: var(--space-4);
		}
	}
</style>
