<script>
	import { INKS } from '$lib/prompt.js';

	let { value = $bindable(''), collapseAfter = 12 } = $props();

	let expanded = $state(false);
	const needsCollapse = $derived(INKS.length > collapseAfter);

	const visible = $derived.by(() => {
		if (expanded || !needsCollapse) return INKS;
		const head = INKS.slice(0, collapseAfter);
		if (value && !head.some((/** @type {{value:string}} */ o) => o.value === value)) {
			const active = INKS.find((/** @type {{value:string}} */ o) => o.value === value);
			if (active) return [...head.slice(0, collapseAfter - 1), active];
		}
		return head;
	});
	const hiddenCount = $derived(INKS.length - visible.length);

	/** @param {string} accent */
	function swatchStyle(accent) {
		if (accent === 'rainbow') {
			return 'background: conic-gradient(from 180deg, #ef4444, #f59e0b, #facc15, #22c55e, #06b6d4, #6366f1, #a855f7, #ec4899, #ef4444);';
		}
		const colors = accent.split(',').map((c) => c.trim());
		if (colors.length === 1) return `background: ${colors[0]};`;
		const stops = colors
			.map((c, i) => `${c} ${(i * 100) / colors.length}% ${((i + 1) * 100) / colors.length}%`)
			.join(', ');
		return `background: linear-gradient(135deg, ${stops});`;
	}
</script>

<div class="ink-picker">
	<div class="group-label">Style</div>
	<div class="chips">
		{#each visible as opt (opt.value)}
			<button
				type="button"
				class="ink-chip"
				class:active={value === opt.value}
				onclick={() => (value = opt.value)}
			>
				<span class="swatch" style={swatchStyle(opt.accent)}></span>
				<span>{opt.label}</span>
			</button>
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
	.ink-picker {
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
	.ink-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		border-radius: 999px;
		padding: 0.25rem 0.625rem 0.25rem 0.375rem;
		font-size: var(--font-size-sm);
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.12s, border-color 0.12s, color 0.12s;
	}
	.ink-chip:hover:not(.active) {
		border-color: var(--color-text-secondary);
		color: var(--color-text);
	}
	.ink-chip.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-surface);
	}
	.swatch {
		display: inline-block;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 1px solid rgba(0, 0, 0, 0.15);
		flex-shrink: 0;
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
