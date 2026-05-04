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
	import { readFileAsBase64 } from '$lib/file.js';
	import { readString, readJSON, writeString, writeJSON, STORAGE_KEYS } from '$lib/storage.js';

	let apiKey = $state('');
	let model = $state('gemini-3-pro-image-preview');
	let modelOptions = $state(/** @type {{value:string,label:string}[]} */ ([]));

	/** @type {File | null} */
	let file = $state(null);
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
		!!apiKey && !!model && !!file && !!promptText.trim() && !generating
	);

	async function generate() {
		if (!canGenerate || !file) return;
		generating = true;
		error = '';
		results = [];
		try {
			const image = await readFileAsBase64(file);
			results = await generateMockups({ apiKey, model, prompt: promptText, image, count });
			if (results.length < count) {
				error = `Only ${results.length} of ${count} images returned (some calls failed or were filtered).`;
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

	<div class="layout">
		<section class="card panel left">
			<ApiKeyField bind:value={apiKey} />
			<ModelSelect bind:value={model} {apiKey} bind:options={modelOptions} />
			<ImageDropzone bind:file bind:previewUrl />
		</section>

		<section class="card panel right">
			<h2 class="panel-title">Mockup settings</h2>
			<SettingsPanel bind:settings bind:count />
			<PromptBox bind:value={promptText} autoValue={autoPrompt} bind:dirty={promptDirty} />

			<button
				type="button"
				class="btn btn-accent generate"
				disabled={!canGenerate}
				onclick={generate}
			>
				<iconify-icon icon={generating ? 'lucide:loader-2' : 'lucide:sparkles'} class:spin={generating}
				></iconify-icon>
				{generating ? 'Generating…' : `Generate ${count} mockup${count > 1 ? 's' : ''}`}
			</button>

			{#if !apiKey}
				<div class="hint">Add your Google AI Studio API key above to start.</div>
			{:else if !file}
				<div class="hint">Upload a tattoo design to enable generation.</div>
			{/if}

			{#if error}
				<div class="error">{error}</div>
			{/if}
		</section>
	</div>

	{#if generating || results.length}
		<section class="card results">
			<h2 class="panel-title">Results</h2>
			<ResultsGrid images={results} loading={generating} {count} />
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
		max-width: 1180px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
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
	.layout {
		display: grid;
		grid-template-columns: minmax(320px, 1fr) minmax(360px, 1.2fr);
		gap: var(--space-6);
		align-items: start;
	}
	.panel {
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.panel-title {
		font-family: var(--font-display);
		font-size: var(--font-size-xl);
		margin-bottom: var(--space-1);
	}
	.generate {
		margin-top: var(--space-2);
		padding: 0.875rem 1rem;
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
	}
	.results {
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.footer {
		text-align: center;
		color: var(--color-text-dimmed);
		font-size: var(--font-size-xs);
		padding: var(--space-4) 0;
	}
	@media (max-width: 880px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
</style>
