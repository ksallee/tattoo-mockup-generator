<script>
	import Chip from './Chip.svelte';

	let {
		label = '',
		options = /** @type {{value:string,label:string}[]} */ ([]),
		values = $bindable(/** @type {string[]} */ ([])),
		size = 'sm',
		collapseAfter = 10
	} = $props();

	let expanded = $state(false);

	const needsCollapse = $derived(options.length > collapseAfter);

	/**
	 * When collapsed: prefer to show all currently-active options first, then fill the
	 * remaining slots with inactive options from the front of the list.
	 */
	const visible = $derived.by(() => {
		if (expanded || !needsCollapse) return options;
		const active = options.filter((/** @type {{value:string}} */ o) => values.includes(o.value));
		const inactive = options.filter(
			(/** @type {{value:string}} */ o) => !values.includes(o.value)
		);
		const remaining = Math.max(0, collapseAfter - active.length);
		return [...active, ...inactive.slice(0, remaining)];
	});

	const hiddenCount = $derived(options.length - visible.length);

	/** @param {string} v */
	function toggle(v) {
		values = values.includes(v)
			? values.filter((/** @type {string} */ x) => x !== v)
			: [...values, v];
	}
</script>

<div class="chip-group">
	{#if label}<div class="group-label">{label}</div>{/if}
	<div class="chips">
		{#each visible as opt (opt.value)}
			<Chip {size} active={values.includes(opt.value)} onclick={() => toggle(opt.value)}>
				{opt.label}
			</Chip>
		{/each}
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
</style>
