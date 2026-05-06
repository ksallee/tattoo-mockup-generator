<script>
	/**
	 * Mutually-exclusive selection rail. One of N options is active.
	 * Used at the top of the page for mode switching.
	 *
	 * @typedef {{value: string, label: string, icon?: string}} Option
	 */

	let {
		/** @type {Option[]} */
		options,
		value = $bindable(''),
		size = 'md',
		ariaLabel = ''
	} = $props();
</script>

<div class="seg" class:size-lg={size === 'lg'} role="radiogroup" aria-label={ariaLabel}>
	{#each options as opt (opt.value)}
		<button
			type="button"
			role="radio"
			aria-checked={value === opt.value}
			class="seg-btn"
			class:active={value === opt.value}
			onclick={() => (value = opt.value)}
		>
			{#if opt.icon}
				<iconify-icon icon={opt.icon} aria-hidden="true"></iconify-icon>
			{/if}
			<span>{opt.label}</span>
		</button>
	{/each}
</div>

<style>
	.seg {
		display: inline-flex;
		gap: 0.25rem;
		padding: 0.25rem;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: 999px;
	}
	.seg-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: none;
		border-radius: 999px;
		padding: 0.5rem 1rem;
		font: inherit;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: background 0.12s, color 0.12s;
		white-space: nowrap;
	}
	.size-lg .seg-btn {
		padding: 0.625rem 1.25rem;
		font-size: var(--font-size-base);
	}
	.seg-btn:hover:not(.active) {
		color: var(--color-text);
	}
	.seg-btn.active {
		background: var(--color-surface);
		color: var(--color-text);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 0 0 1px var(--color-border);
	}
	.seg-btn :global(iconify-icon) {
		font-size: 1.05em;
		line-height: 0;
	}
	@media (max-width: 640px) {
		.seg {
			width: 100%;
			justify-content: stretch;
		}
		.seg-btn {
			flex: 1;
			justify-content: center;
		}
	}
</style>
