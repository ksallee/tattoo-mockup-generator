<script>
	let {
		open = $bindable(true),
		title = '',
		summary = '',
		randomize,
		randomizeLabel = 'Randomize',
		children
	} = $props();

	/** @param {MouseEvent} e */
	function onRandomize(e) {
		e.preventDefault();
		e.stopPropagation();
		randomize?.();
	}
</script>

<details class="collapsible" bind:open>
	<summary class="header">
		<iconify-icon class="chevron" icon="lucide:chevron-right" aria-hidden="true"></iconify-icon>
		<span class="title">{title}</span>
		{#if summary && !open}
			<span class="summary">{summary}</span>
		{/if}
		{#if randomize}
			<button
				type="button"
				class="dice-btn"
				title={randomizeLabel}
				aria-label={randomizeLabel}
				onclick={onRandomize}
			>
				<iconify-icon icon="lucide:dices"></iconify-icon>
			</button>
		{/if}
	</summary>
	<div class="content">
		{@render children?.()}
	</div>
</details>

<style>
	.collapsible {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}
	.header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: 0.75rem 1rem;
		cursor: pointer;
		user-select: none;
		list-style: none;
		background: linear-gradient(
			to right,
			color-mix(in srgb, var(--color-accent) 8%, var(--color-surface-2)),
			var(--color-surface-2)
		);
		border-left: 3px solid var(--color-accent);
	}
	.header::-webkit-details-marker {
		display: none;
	}
	.header:hover {
		background: linear-gradient(
			to right,
			color-mix(in srgb, var(--color-accent) 14%, var(--color-surface-2)),
			color-mix(in srgb, var(--color-accent) 4%, var(--color-surface-2))
		);
	}
	.title {
		font-family: var(--font-display);
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-lg);
		color: var(--color-text);
		letter-spacing: -0.01em;
	}
	.summary {
		font-size: var(--font-size-xs);
		color: var(--color-text-dimmed);
		margin-left: auto;
		text-align: right;
		max-width: 60%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.chevron {
		font-size: 1.125rem;
		color: var(--color-accent);
		transition: transform 0.15s ease;
		line-height: 0;
	}
	.collapsible[open] .chevron {
		transform: rotate(90deg);
	}
	.dice-btn {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 0.25rem 0.4rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.2s;
	}
	.summary + .dice-btn {
		margin-left: var(--space-2);
	}
	.dice-btn:hover {
		background: var(--color-surface-2);
		color: var(--color-accent);
		border-color: var(--color-accent);
	}
	.dice-btn:active {
		transform: rotate(90deg);
	}
	.dice-btn :global(iconify-icon) {
		font-size: 1rem;
		line-height: 0;
	}
	.content {
		padding: var(--space-3) var(--space-4) var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		border-top: 1px solid var(--color-divider);
	}
</style>
