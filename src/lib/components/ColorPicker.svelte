<script>
	/**
	 * Curated swatches + native color input + hex text input.
	 * Three inputs stay in sync via the bound `value`.
	 *
	 * @typedef {{value: string, label: string}} Swatch
	 */

	let {
		/** @type {Swatch[]} */
		swatches,
		value = $bindable('#ffffff'),
		label = ''
	} = $props();

	/** @param {Event} e */
	function onHexInput(e) {
		const raw = String(/** @type {HTMLInputElement} */ (e.currentTarget).value || '').trim();
		const next = raw.startsWith('#') ? raw : `#${raw}`;
		if (/^#[0-9a-fA-F]{6}$/.test(next)) value = next.toLowerCase();
	}
</script>

<div class="picker">
	{#if label}<div class="group-label">{label}</div>{/if}

	<div class="swatches">
		{#each swatches as opt (opt.value)}
			<button
				type="button"
				class="swatch"
				class:active={value.toLowerCase() === opt.value.toLowerCase()}
				style="background: {opt.value};"
				onclick={() => (value = opt.value)}
				title={opt.label}
				aria-label={opt.label}
			></button>
		{/each}
	</div>

	<div class="custom">
		<label class="custom-color">
			<span class="hint">Custom</span>
			<input
				type="color"
				value={value || '#ffffff'}
				oninput={(e) => (value = /** @type {HTMLInputElement} */ (e.currentTarget).value)}
				aria-label="Custom color"
			/>
		</label>
		<label class="hex">
			<span class="hint">HEX</span>
			<input
				type="text"
				value={value}
				oninput={onHexInput}
				maxlength="7"
				spellcheck="false"
				aria-label="Hex color"
			/>
		</label>
	</div>
</div>

<style>
	.picker {
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
	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}
	.swatch {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 1px solid var(--color-border);
		box-shadow: inset 0 0 0 2px var(--color-surface);
		cursor: pointer;
		padding: 0;
		transition: transform 0.12s, box-shadow 0.12s;
	}
	.swatch:hover {
		transform: scale(1.08);
	}
	.swatch.active {
		box-shadow: inset 0 0 0 2px var(--color-surface), 0 0 0 2px var(--color-primary);
	}
	.custom {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
		align-items: center;
	}
	.custom-color,
	.hex {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}
	.hint {
		font-size: var(--font-size-xs);
		color: var(--color-text-dimmed);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.custom-color input[type='color'] {
		width: 32px;
		height: 32px;
		padding: 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: transparent;
		cursor: pointer;
	}
	.hex input[type='text'] {
		width: 9ch;
		font: inherit;
		font-size: var(--font-size-sm);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		padding: 0.25rem 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text);
	}
	.hex input[type='text']:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}
</style>
