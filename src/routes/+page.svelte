<script>
	import { onMount } from 'svelte';
	import ApiKeyField from '$lib/components/ApiKeyField.svelte';
	import ImageDropzone from '$lib/components/ImageDropzone.svelte';
	import ModelSelect from '$lib/components/ModelSelect.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import PromptBox from '$lib/components/PromptBox.svelte';
	import ResultsGrid from '$lib/components/ResultsGrid.svelte';
	import { buildPrompt, DEFAULT_SETTINGS } from '$lib/prompt.js';
	import { generateMockups } from '$lib/client/api.js';
	import { readString, readJSON, writeString, writeJSON, STORAGE_KEYS } from '$lib/storage.js';

	let apiKey = $state('');
	let model = $state('gemini-3-pro-image-preview');
	let modelOptions = $state(/** @type {{value:string,label:string}[]} */ ([]));

	/** @type {{mimeType:string,data:string} | null} */
	let image = $state(null);
	let previewUrl = $state('');

	let settings = $state({ ...DEFAULT_SETTINGS });
	let count = $state(2);

	let promptText = $state(buildPrompt(DEFAULT_SETTINGS));
	let promptDirty = $state(false);
	const autoPrompt = $derived(buildPrompt(settings));

	$effect(() => {
		if (!promptDirty) promptText = autoPrompt;
	});

	let generating = $state(false);
	let error = $state('');
	let results = $state(/** @type {{mimeType:string,data:string}[]} */ ([]));

	// Snapshot of the settings that produced the current results — so changing
	// aspect ratio or variation count after generation doesn't re-layout the
	// already-rendered images.
	let resultMeta = $state({ aspectRatio: '1:1', count: 2 });

	onMount(() => {
		apiKey = readString(STORAGE_KEYS.apiKey);
		model = readString(STORAGE_KEYS.model) || model;
		settings = { ...DEFAULT_SETTINGS, ...readJSON(STORAGE_KEYS.settings, {}) };
	});

	$effect(() => writeString(STORAGE_KEYS.apiKey, apiKey));
	$effect(() => {
		if (model) writeString(STORAGE_KEYS.model, model);
	});
	$effect(() => writeJSON(STORAGE_KEYS.settings, settings));

	const canGenerate = $derived(
		!!apiKey && !!model && !!image && !!promptText.trim() && !generating
	);

	async function generate() {
		if (!canGenerate || !image) return;
		generating = true;
		error = '';
		results = [];
		// Lock the aspect/count for this render so subsequent control changes
		// don't re-layout the displayed results.
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

<main class="page">
	<header class="hero">
		<h1>Tattoo Mockup Generator</h1>
		<p class="tagline">
			Upload a design, pick a body part and a vibe, see it on real skin in seconds — powered by
			Google Nano Banana Pro.
		</p>
	</header>

	<section class="card row">
		<ApiKeyField bind:value={apiKey} />
	</section>

	<section class="card row">
		<ModelSelect bind:value={model} {apiKey} bind:options={modelOptions} />
	</section>

	<section class="card row">
		<ImageDropzone bind:image bind:previewUrl />
	</section>

	<section class="card row">
		<h2 class="row-title">Mockup settings</h2>
		<SettingsPanel bind:settings bind:count />
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
		{:else if !image}
			<div class="hint">Upload a tattoo design to enable generation.</div>
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
				aspectRatio={resultMeta.aspectRatio}
			/>
		</section>
	{/if}

	<footer class="footer">
		Built with SvelteKit · Bring your own
		<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Gemini API key</a>.
		Your key never leaves your browser except to call the Gemini API through this app's server.
	</footer>
</main>

<style>
	.page {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.hero {
		text-align: center;
		padding: var(--space-4) 0 var(--space-2);
	}
	.hero h1 {
		font-family: var(--font-display);
		font-size: var(--font-size-2xl);
		margin-bottom: var(--space-2);
	}
	.tagline {
		color: var(--color-text-secondary);
		max-width: 36rem;
		margin: 0 auto;
	}
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
	.footer {
		text-align: center;
		color: var(--color-text-dimmed);
		font-size: var(--font-size-xs);
		padding: var(--space-4) 0 var(--space-6);
	}
	@media (max-width: 640px) {
		.page {
			padding: var(--space-4) var(--space-3);
		}
		.card.row {
			padding: var(--space-4);
		}
	}
</style>
