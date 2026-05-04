<script>
	import { fetchModels } from '$lib/client/api.js';

	let {
		value = $bindable(''),
		apiKey = '',
		options = $bindable(/** @type {{value:string,label:string}[]} */ ([]))
	} = $props();

	let loading = $state(false);
	let error = $state('');
	let lastFetchedKey = $state('');

	async function load() {
		if (!apiKey || apiKey === lastFetchedKey) return;
		loading = true;
		error = '';
		try {
			options = await fetchModels(apiKey);
			lastFetchedKey = apiKey;
			if (!options.find((/** @type {{value:string}} */ m) => m.value === value)) {
				value = options[0]?.value || '';
			}
		} catch (/** @type {any} */ e) {
			error = e.message || 'Failed to load models';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (apiKey && apiKey !== lastFetchedKey) load();
	});
</script>

<div class="field">
	<label class="field-label" for="model-select">
		Model
		{#if loading}<span class="field-help-inline">— loading…</span>{/if}
	</label>
	<select id="model-select" class="select" bind:value disabled={!options.length}>
		{#each options as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
		{#if !options.length}
			<option value="">{apiKey ? 'No models — add API key' : 'Add API key to load models'}</option>
		{/if}
	</select>
	{#if error}
		<div class="field-help error">{error}</div>
	{/if}
</div>

<style>
	.field-help-inline {
		font-weight: var(--font-weight-normal);
		color: var(--color-text-dimmed);
		font-size: var(--font-size-xs);
		margin-left: var(--space-1);
	}
	.error {
		color: var(--color-error);
	}
</style>
