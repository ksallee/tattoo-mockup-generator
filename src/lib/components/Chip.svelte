<script>
	let {
		active = false,
		disabled = false,
		size = 'sm',
		onclick,
		children
	} = $props();

	/** @param {KeyboardEvent} e */
	function onKeydown(e) {
		if (disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onclick?.();
		}
	}
</script>

<button
	type="button"
	class="chip {size}"
	class:active
	class:disabled
	{disabled}
	onclick={() => !disabled && onclick?.()}
	onkeydown={onKeydown}
>
	{@render children?.()}
</button>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		border-radius: 999px;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.12s, border-color 0.12s, color 0.12s;
		font: inherit;
	}
	.chip.sm {
		padding: 0.25rem 0.625rem;
		font-size: var(--font-size-sm);
	}
	.chip.md {
		padding: 0.375rem 0.875rem;
		font-size: var(--font-size-base);
	}
	.chip:hover:not(.disabled):not(.active) {
		border-color: var(--color-text-secondary);
		color: var(--color-text);
	}
	.chip.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-surface);
	}
	.chip.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.chip:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
