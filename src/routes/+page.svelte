<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import ApiKeyField from '$lib/components/ApiKeyField.svelte';
	import ModelSelect from '$lib/components/ModelSelect.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import IteratePanel from '$lib/components/IteratePanel.svelte';
	import MockupPanel from '$lib/components/MockupPanel.svelte';
	import { readString, writeString, STORAGE_KEYS } from '$lib/storage.js';

	const MODE_OPTIONS = [
		{ value: 'iterate', label: 'Flash sheet', icon: 'lucide:repeat' },
		{ value: 'mockup', label: 'On the body', icon: 'lucide:wand-2' }
	];

	/** @type {Record<string, string>} */
	const MODE_TAGLINES = {
		iterate:
			'Upload a design and get a flash-sheet of variations on the colored background you choose. Stylistic riffs or full recompositions.',
		mockup:
			'Upload a design, pick a body part and a vibe, and watch AI place it on real skin in seconds.'
	};

	let apiKey = $state('');
	let model = $state('gemini-3-pro-image-preview');
	let modelOptions = $state(/** @type {{value:string,label:string}[]} */ ([]));
	let mode = $state('mockup');

	onMount(() => {
		apiKey = readString(STORAGE_KEYS.apiKey);
		model = readString(STORAGE_KEYS.model) || model;
		const savedMode = readString(STORAGE_KEYS.mode);
		if (MODE_OPTIONS.some((o) => o.value === savedMode)) mode = savedMode;
	});

	$effect(() => writeString(STORAGE_KEYS.apiKey, apiKey));
	$effect(() => {
		if (model) writeString(STORAGE_KEYS.model, model);
	});
	$effect(() => writeString(STORAGE_KEYS.mode, mode));
</script>

<main class="page">
	<header class="hero">
		<h1>Tattoo Mockup Generator</h1>
	</header>

	<div class="mode-rail">
		<SegmentedControl
			options={MODE_OPTIONS}
			bind:value={mode}
			size="lg"
			ariaLabel="Generation mode"
		/>
	</div>

	<div class="tagline-wrap">
		{#key mode}
			<p class="tagline" in:fade={{ duration: 220 }}>{MODE_TAGLINES[mode] ?? ''}</p>
		{/key}
	</div>

	<section class="card row">
		<ApiKeyField bind:value={apiKey} />
	</section>

	<section class="card row">
		<ModelSelect bind:value={model} {apiKey} bind:options={modelOptions} />
	</section>

	{#if mode === 'iterate'}
		<IteratePanel {apiKey} {model} />
	{:else}
		<MockupPanel {apiKey} {model} />
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
	.tagline-wrap {
		text-align: center;
		min-height: 3rem;
	}
	.tagline {
		color: var(--color-text-secondary);
		max-width: 36rem;
		margin: 0 auto;
	}
	.mode-rail {
		display: flex;
		justify-content: center;
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
