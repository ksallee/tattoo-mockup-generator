<script>
	import { onMount } from 'svelte';
	import ImageDropzone from './ImageDropzone.svelte';
	import PromptBox from './PromptBox.svelte';
	import ResultsGrid from './ResultsGrid.svelte';
	import InkPicker from './InkPicker.svelte';
	import ChipGroup from './ChipGroup.svelte';
	import Chip from './Chip.svelte';
	import ColorPicker from './ColorPicker.svelte';
	import {
		buildIteratePrompt,
		DEFAULT_ITERATE_SETTINGS,
		FAITHFULNESS_LEVELS,
		TATTOO_STYLES,
		ASPECT_RATIOS,
		BACKGROUND_COLORS
	} from '$lib/prompt.js';
	import { generateMockups } from '$lib/client/api.js';
	import { readJSON, writeJSON, STORAGE_KEYS } from '$lib/storage.js';

	let { apiKey, model } = $props();

	/** @type {{mimeType:string,data:string} | null} */
	let image = $state(null);
	let previewUrl = $state('');

	let settings = $state({ ...DEFAULT_ITERATE_SETTINGS });
	let count = $state(2);

	let promptText = $state(buildIteratePrompt(DEFAULT_ITERATE_SETTINGS));
	let promptDirty = $state(false);
	const autoPrompt = $derived(buildIteratePrompt(settings));

	$effect(() => {
		if (!promptDirty) promptText = autoPrompt;
	});

	let generating = $state(false);
	let error = $state('');
	let results = $state(/** @type {{mimeType:string,data:string}[]} */ ([]));
	let resultMeta = $state({ aspectRatio: '1:1', count: 2 });

	onMount(() => {
		settings = {
			...DEFAULT_ITERATE_SETTINGS,
			...readJSON(STORAGE_KEYS.iterateSettings, {})
		};
	});

	$effect(() => writeJSON(STORAGE_KEYS.iterateSettings, settings));

	const COUNT_OPTIONS = [
		{ value: 1, label: '1' },
		{ value: 2, label: '2' },
		{ value: 3, label: '3' },
		{ value: 4, label: '4' }
	];

	const faithfulnessLabel = $derived(
		FAITHFULNESS_LEVELS.find((l) => l.value === Number(settings.faithfulness))?.label ?? ''
	);
	const faithfulnessHint = $derived(
		FAITHFULNESS_LEVELS.find((l) => l.value === Number(settings.faithfulness))?.hint ?? ''
	);

	const canGenerate = $derived(
		!!apiKey && !!model && !!image && !!promptText.trim() && !generating
	);

	async function generate() {
		if (!canGenerate || !image) return;
		generating = true;
		error = '';
		results = [];
		resultMeta = { aspectRatio: settings.aspectRatio, count };
		try {
			results = await generateMockups({
				apiKey,
				model,
				prompt: promptText,
				image,
				count,
				aspectRatio: settings.aspectRatio
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
	<ImageDropzone bind:image bind:previewUrl />
</section>

<section class="card row">
	<h2 class="row-title">Iteration settings</h2>

	<div class="field">
		<label class="field-label" for="iterate-faith-slider">
			Faithfulness
			<span class="slider-value">{faithfulnessLabel}</span>
		</label>
		<input
			id="iterate-faith-slider"
			class="slider"
			type="range"
			min="1"
			max="5"
			step="1"
			bind:value={settings.faithfulness}
		/>
		<div class="slider-hint">{faithfulnessHint}</div>
	</div>

	<InkPicker bind:value={settings.ink} />

	<ChipGroup
		label="Tattoo style"
		options={TATTOO_STYLES}
		bind:value={settings.tattooStyle}
		customsKey="tattooStyles"
		phraseHint="How the AI should describe this style (optional)"
	/>

	<ChipGroup label="Aspect ratio" options={ASPECT_RATIOS} bind:value={settings.aspectRatio} />

	<ColorPicker
		swatches={BACKGROUND_COLORS}
		bind:value={settings.backgroundColor}
		label="Background color"
	/>

	<div class="field">
		<label class="field-label" for="iterate-designs-slider">
			Designs per sheet
			<span class="slider-value">{settings.designsPerSheet}</span>
		</label>
		<input
			id="iterate-designs-slider"
			class="slider"
			type="range"
			min="1"
			max="10"
			step="1"
			bind:value={settings.designsPerSheet}
		/>
		<div class="slider-hint">
			{settings.designsPerSheet === 1
				? 'Single design centered on the page.'
				: `Flash sheet with ${settings.designsPerSheet} variations on one page.`}
		</div>
	</div>

	<div class="field">
		<label class="field-label" for="iterate-extra-input">Extra details (optional)</label>
		<input
			id="iterate-extra-input"
			class="input"
			type="text"
			placeholder="e.g. add small floral elements, more delicate linework"
			bind:value={settings.extra}
		/>
	</div>

	<div class="field">
		<div class="field-label">Output sheets</div>
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
		{generating ? 'Generating…' : `Generate ${count} variation${count > 1 ? 's' : ''}`}
	</button>

	{#if !apiKey}
		<div class="hint">Add your Google AI Studio API key above to start.</div>
	{:else if !image}
		<div class="hint">Upload a design to enable generation.</div>
	{/if}

	{#if error}
		<div class="error">{error}</div>
	{/if}
</section>

{#if generating || results.length}
	<section class="card row">
		<h2 class="row-title">Variations</h2>
		<ResultsGrid
			images={results}
			loading={generating}
			count={resultMeta.count}
			aspectRatio={resultMeta.aspectRatio}
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
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.slider {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		max-width: 28rem;
		height: 4px;
		border-radius: 999px;
		background: var(--color-surface-2);
		outline: none;
		cursor: pointer;
	}
	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--color-primary);
		border: 2px solid var(--color-surface);
		box-shadow: 0 0 0 1px var(--color-border);
		cursor: pointer;
	}
	.slider::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--color-primary);
		border: 2px solid var(--color-surface);
		box-shadow: 0 0 0 1px var(--color-border);
		cursor: pointer;
	}
	.slider-value {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.75rem;
		padding: 0.125rem 0.5rem;
		background: var(--color-surface-2);
		border-radius: 999px;
		font-size: var(--font-size-xs);
		color: var(--color-text);
		font-weight: var(--font-weight-medium);
		text-transform: none;
		letter-spacing: normal;
	}
	.slider-hint {
		font-size: var(--font-size-xs);
		color: var(--color-text-dimmed);
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
		text-align: center;
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
