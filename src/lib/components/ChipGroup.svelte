<script>
	import Chip from './Chip.svelte';

	let {
		label = '',
		options = /** @type {{value:string,label:string}[]} */ ([]),
		value = $bindable(''),
		size = 'sm',
		collapseAfter = 10
	} = $props();

	let expanded = $state(false);

	const needsCollapse = $derived(options.length > collapseAfter);

	/**
	 * When collapsed: show the first N options, but always include the active one
	 * (so the user can see what's selected without expanding).
	 */
	const visible = $derived.by(() => {
		if (expanded || !needsCollapse) return options;
		const head = options.slice(0, collapseAfter);
		if (value && !head.some((/** @type {{value:string}} */ o) => o.value === value)) {
			const active = options.find((/** @type {{value:string}} */ o) => o.value === value);
			if (active) return [...head.slice(0, collapseAfter - 1), active];
		}
		return head;
	});

	const hiddenCount = $derived(options.length - visible.length);
</script>

<div class="chip-group">
	{#if label}<div class="group-label">{label}</div>{/if}
	<div class="chips">
		{#each visible as opt (opt.value)}
			<Chip {size} active={value === opt.value} onclick={() => (value = opt.value)}>
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
