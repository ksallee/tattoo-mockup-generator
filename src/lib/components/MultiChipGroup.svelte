<script>
	import Chip from './Chip.svelte';
	import { readCustoms, addCustom, removeCustom } from '$lib/customs.js';

	let {
		label = '',
		options = /** @type {{value:string,label:string}[]} */ ([]),
		values = $bindable(/** @type {string[]} */ ([])),
		size = 'sm',
		collapseAfter = 10,
		/** Same semantics as ChipGroup: enables user-added customs persisted under
		 * `tmg.customs.<customsKey>`. Customs render before built-ins. */
		customsKey = '',
		phraseHint = ''
	} = $props();

	let customs = $state(/** @type {{value:string,label:string,phrase:string}[]} */ ([]));
	let adding = $state(false);
	let newLabel = $state('');
	let newPhrase = $state('');
	/** @type {HTMLInputElement | null} */
	let labelInputEl = $state(null);

	$effect(() => {
		customs = customsKey ? readCustoms(customsKey) : [];
	});

	$effect(() => {
		if (adding && labelInputEl) labelInputEl.focus();
	});

	const allOptions = $derived(customsKey ? [...customs, ...options] : options);

	let expanded = $state(false);
	const needsCollapse = $derived(allOptions.length > collapseAfter);

	/**
	 * When collapsed: prefer active options first, fill the rest with inactive
	 * front-of-list options.
	 */
	const visible = $derived.by(() => {
		if (expanded || !needsCollapse) return allOptions;
		const active = allOptions.filter((/** @type {{value:string}} */ o) =>
			values.includes(o.value)
		);
		const inactive = allOptions.filter(
			(/** @type {{value:string}} */ o) => !values.includes(o.value)
		);
		const remaining = Math.max(0, collapseAfter - active.length);
		return [...active, ...inactive.slice(0, remaining)];
	});

	const hiddenCount = $derived(allOptions.length - visible.length);

	/** @param {string} v */
	function toggle(v) {
		values = values.includes(v)
			? values.filter((/** @type {string} */ x) => x !== v)
			: [...values, v];
	}

	/** @param {string} v */
	function isCustom(v) {
		return customs.some((c) => c.value === v);
	}

	function saveCustom() {
		const lbl = newLabel.trim();
		if (!lbl) return;
		customs = addCustom(customsKey, { label: lbl, phrase: newPhrase.trim() });
		const last = customs[customs.length - 1];
		if (last && !values.includes(last.value)) values = [...values, last.value];
		newLabel = '';
		newPhrase = '';
		adding = false;
	}

	function cancelCustom() {
		newLabel = '';
		newPhrase = '';
		adding = false;
	}

	/** @param {string} v @param {Event} e */
	function deleteCustom(v, e) {
		e.stopPropagation();
		customs = removeCustom(customsKey, v);
		if (values.includes(v)) values = values.filter((/** @type {string} */ x) => x !== v);
	}
</script>

<div class="chip-group">
	{#if label}<div class="group-label">{label}</div>{/if}
	<div class="chips">
		{#each visible as opt (opt.value)}
			{#if customsKey && isCustom(opt.value)}
				<span class="custom-chip" class:active={values.includes(opt.value)}>
					<button type="button" class="custom-label" onclick={() => toggle(opt.value)}>
						{opt.label}
					</button>
					<button
						type="button"
						class="custom-del"
						onclick={(e) => deleteCustom(opt.value, e)}
						aria-label="Delete custom option"
						title="Delete"
					>
						<iconify-icon icon="lucide:x" aria-hidden="true"></iconify-icon>
					</button>
				</span>
			{:else}
				<Chip {size} active={values.includes(opt.value)} onclick={() => toggle(opt.value)}>
					{opt.label}
				</Chip>
			{/if}
		{/each}

		{#if customsKey}
			<button
				type="button"
				class="add-btn"
				class:open={adding}
				onclick={() => (adding = !adding)}
				aria-expanded={adding}
			>
				<iconify-icon icon={adding ? 'lucide:x' : 'lucide:plus'} aria-hidden="true"
				></iconify-icon>
				{adding ? 'Cancel' : 'Add custom'}
			</button>
		{/if}

		{#if needsCollapse && !expanded && hiddenCount > 0}
			<button type="button" class="more-btn" onclick={() => (expanded = true)}>
				+{hiddenCount} more
			</button>
		{:else if needsCollapse && expanded}
			<button type="button" class="more-btn" onclick={() => (expanded = false)}>
				Show less
			</button>
		{/if}
	</div>

	{#if adding}
		<form
			class="add-form"
			onsubmit={(e) => {
				e.preventDefault();
				saveCustom();
			}}
		>
			<input
				bind:this={labelInputEl}
				type="text"
				class="input"
				placeholder="Name"
				bind:value={newLabel}
				maxlength="60"
			/>
			<input
				type="text"
				class="input"
				placeholder={phraseHint || 'Description for the AI (optional — defaults to name)'}
				bind:value={newPhrase}
				maxlength="200"
			/>
			<div class="add-actions">
				<button type="submit" class="btn btn-accent btn-sm" disabled={!newLabel.trim()}>
					Save
				</button>
				<button type="button" class="btn btn-ghost btn-sm" onclick={cancelCustom}>
					Cancel
				</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.chip-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.group-label {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		align-items: center;
	}

	.custom-chip {
		display: inline-flex;
		align-items: stretch;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		border-radius: 999px;
		overflow: hidden;
		transition: background 0.12s, border-color 0.12s, color 0.12s;
	}
	.custom-chip:hover {
		border-color: var(--color-text-secondary);
	}
	.custom-chip.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-surface);
	}
	.custom-label {
		background: transparent;
		border: none;
		color: inherit;
		font: inherit;
		font-size: var(--font-size-sm);
		padding: 0.25rem 0.5rem 0.25rem 0.625rem;
		cursor: pointer;
	}
	.custom-del {
		background: transparent;
		border: none;
		border-left: 1px solid currentColor;
		opacity: 0.45;
		color: inherit;
		padding: 0 0.5rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		transition: opacity 0.12s, background 0.12s;
	}
	.custom-del:hover {
		opacity: 1;
		background: rgba(0, 0, 0, 0.06);
	}
	.custom-chip.active .custom-del {
		border-left-color: rgba(255, 255, 255, 0.4);
	}
	.custom-chip.active .custom-del:hover {
		background: rgba(255, 255, 255, 0.15);
	}
	.custom-del :global(iconify-icon) {
		font-size: 0.75rem;
		line-height: 0;
	}

	.add-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: transparent;
		border: 1px dashed var(--color-border);
		color: var(--color-text-dimmed);
		border-radius: 999px;
		padding: 0.25rem 0.625rem;
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s, background 0.15s;
	}
	.add-btn:hover {
		color: var(--color-text);
		border-color: var(--color-text-dimmed);
	}
	.add-btn.open {
		color: var(--color-text);
		border-style: solid;
	}
	.add-btn :global(iconify-icon) {
		font-size: 0.85em;
		line-height: 0;
	}

	.more-btn {
		background: transparent;
		border: 1px dashed var(--color-border);
		color: var(--color-text-dimmed);
		border-radius: 999px;
		padding: 0.25rem 0.625rem;
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s;
	}
	.more-btn:hover {
		color: var(--color-text);
		border-color: var(--color-text-dimmed);
	}

	.add-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	.add-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}
</style>
