<script>
	/**
	 * Curated swatches + native color input + hex text input + user-saved
	 * presets. Three inputs stay in sync via the bound `value`.
	 *
	 * @typedef {{value: string, label: string}} Swatch
	 */

	import { readCustoms, addCustom, removeCustom } from '$lib/customs.js';

	let {
		/** @type {Swatch[]} */
		swatches,
		value = $bindable('#ffffff'),
		label = '',
		customsKey = 'colorSwatches'
	} = $props();

	let customs = $state(/** @type {{value:string,label:string,phrase:string}[]} */ ([]));
	let saving = $state(false);
	let presetName = $state('');
	/** @type {HTMLInputElement | null} */
	let presetInputEl = $state(null);

	$effect(() => {
		customs = readCustoms(customsKey);
	});

	$effect(() => {
		if (saving && presetInputEl) presetInputEl.focus();
	});

	const allSwatches = $derived([
		...customs.map((/** @type {{value:string,label:string}} */ c) => ({
			value: c.value,
			label: c.label,
			custom: true
		})),
		...swatches.map((/** @type {Swatch} */ s) => ({ ...s, custom: false }))
	]);

	/** @param {Event} e */
	function onHexInput(e) {
		const raw = String(/** @type {HTMLInputElement} */ (e.currentTarget).value || '').trim();
		const next = raw.startsWith('#') ? raw : `#${raw}`;
		if (/^#[0-9a-fA-F]{6}$/.test(next)) value = next.toLowerCase();
	}

	const isCurrentSaveable = $derived.by(() => {
		const norm = (value || '').toLowerCase();
		const inBuiltIn = swatches.some(
			(/** @type {Swatch} */ s) => s.value.toLowerCase() === norm
		);
		const inCustom = customs.some(
			(/** @type {{value:string}} */ c) => c.value.toLowerCase() === norm
		);
		return !!norm && !inBuiltIn && !inCustom;
	});

	function savePreset() {
		const name = presetName.trim();
		if (!name || !value) return;
		customs = addCustom(customsKey, { value: value.toLowerCase(), label: name });
		presetName = '';
		saving = false;
	}

	function cancelSave() {
		presetName = '';
		saving = false;
	}

	/** @param {string} v @param {Event} e */
	function deletePreset(v, e) {
		e.stopPropagation();
		customs = removeCustom(customsKey, v);
		if (value.toLowerCase() === v.toLowerCase()) value = swatches[0]?.value ?? '#ffffff';
	}
</script>

<div class="picker">
	{#if label}<div class="group-label">{label}</div>{/if}

	<div class="swatches">
		{#each allSwatches as opt (opt.value)}
			<span
				class="swatch-wrap"
				class:active={value.toLowerCase() === opt.value.toLowerCase()}
			>
				<button
					type="button"
					class="swatch"
					style="background: {opt.value};"
					onclick={() => (value = opt.value)}
					title={opt.label}
					aria-label={opt.label}
				></button>
				{#if opt.custom}
					<button
						type="button"
						class="swatch-del"
						onclick={(e) => deletePreset(opt.value, e)}
						aria-label="Delete preset {opt.label}"
						title="Delete preset"
					>
						<iconify-icon icon="lucide:x" aria-hidden="true"></iconify-icon>
					</button>
				{/if}
			</span>
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
		<button
			type="button"
			class="save-btn"
			class:open={saving}
			disabled={!isCurrentSaveable && !saving}
			onclick={() => (saving = !saving)}
			title={isCurrentSaveable ? 'Save current color as a named preset' : 'Already a preset'}
		>
			<iconify-icon icon={saving ? 'lucide:x' : 'lucide:bookmark-plus'} aria-hidden="true"
			></iconify-icon>
			{saving ? 'Cancel' : 'Save preset'}
		</button>
	</div>

	{#if saving}
		<form
			class="save-form"
			onsubmit={(e) => {
				e.preventDefault();
				savePreset();
			}}
		>
			<span class="preview" style="background: {value};" aria-hidden="true"></span>
			<input
				bind:this={presetInputEl}
				type="text"
				class="input"
				placeholder="Preset name (e.g. studio brand cream)"
				bind:value={presetName}
				maxlength="40"
			/>
			<button type="submit" class="btn btn-accent btn-sm" disabled={!presetName.trim()}>
				Save
			</button>
			<button type="button" class="btn btn-ghost btn-sm" onclick={cancelSave}>Cancel</button>
		</form>
	{/if}
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
		gap: 0.5rem;
	}
	.swatch-wrap {
		position: relative;
		display: inline-block;
		line-height: 0;
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
	.swatch-wrap.active .swatch {
		box-shadow: inset 0 0 0 2px var(--color-surface), 0 0 0 2px var(--color-primary);
	}
	.swatch-del {
		position: absolute;
		top: -5px;
		right: -5px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--color-surface);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
		padding: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.12s, color 0.12s, border-color 0.12s;
	}
	.swatch-wrap:hover .swatch-del {
		opacity: 1;
	}
	.swatch-del:hover {
		color: var(--color-error);
		border-color: var(--color-error);
	}
	.swatch-del :global(iconify-icon) {
		font-size: 10px;
		line-height: 0;
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

	.save-btn {
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
		transition: color 0.15s, border-color 0.15s;
	}
	.save-btn:hover:not(:disabled) {
		color: var(--color-text);
		border-color: var(--color-text-dimmed);
	}
	.save-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.save-btn.open {
		color: var(--color-text);
		border-style: solid;
	}
	.save-btn :global(iconify-icon) {
		font-size: 0.85em;
		line-height: 0;
	}

	.save-form {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		flex-wrap: wrap;
	}
	.preview {
		display: inline-block;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 1px solid var(--color-border);
		flex-shrink: 0;
	}
	.save-form .input {
		flex: 1 1 14rem;
		min-width: 10rem;
	}
</style>
