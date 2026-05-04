<script>
	import { SIZES, INKS, MODELS, BODY_PARTS, BACKGROUNDS } from '$lib/prompt.js';

	let { settings = $bindable(), count = $bindable(2) } = $props();
</script>

<div class="grid">
	<div class="field">
		<label class="field-label" for="ink-select">Style</label>
		<select id="ink-select" class="select" bind:value={settings.ink}>
			{#each INKS as o}<option value={o.value}>{o.label}</option>{/each}
		</select>
	</div>

	<div class="field">
		<label class="field-label" for="size-select">Size</label>
		<select id="size-select" class="select" bind:value={settings.size}>
			{#each SIZES as o}<option value={o.value}>{o.label}</option>{/each}
		</select>
	</div>

	<div class="field">
		<label class="field-label" for="bodypart-select">Body part</label>
		<select id="bodypart-select" class="select" bind:value={settings.bodyPart}>
			{#each BODY_PARTS as o}<option value={o.value}>{o.label}</option>{/each}
		</select>
	</div>

	<div class="field">
		<label class="field-label" for="model-gender-select">Model</label>
		<select id="model-gender-select" class="select" bind:value={settings.model}>
			{#each MODELS as o}<option value={o.value}>{o.label}</option>{/each}
		</select>
	</div>

	<div class="field span-2">
		<label class="field-label" for="bg-select">Background</label>
		<select id="bg-select" class="select" bind:value={settings.background}>
			{#each BACKGROUNDS as o}<option value={o.value}>{o.label}</option>{/each}
		</select>
	</div>

	<div class="field span-2">
		<label class="field-label" for="extra-input">Extra details (optional)</label>
		<input
			id="extra-input"
			class="input"
			type="text"
			placeholder="e.g. wearing a surfing bikini, side angle, golden hour"
			bind:value={settings.extra}
		/>
	</div>

	<div class="field span-2 toggle-row">
		<label class="toggle">
			<input type="checkbox" bind:checked={settings.stickToIllustration} />
			<span>Reproduce the design exactly (no restyling)</span>
		</label>
	</div>

	<div class="field span-2">
		<div class="field-label">Number of variations</div>
		<div class="count-row">
			{#each [1, 2, 3, 4] as n}
				<label class="count-pill" class:active={count === n}>
					<input type="radio" name="count" value={n} bind:group={count} />
					{n}
				</label>
			{/each}
		</div>
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	.span-2 {
		grid-column: 1 / -1;
	}
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		cursor: pointer;
	}
	.toggle input {
		accent-color: var(--color-accent);
	}
	.count-row {
		display: flex;
		gap: var(--space-2);
	}
	.count-pill {
		flex: 1;
		text-align: center;
		padding: 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		cursor: pointer;
		font-weight: var(--font-weight-medium);
		transition: background 0.15s, border-color 0.15s, color 0.15s;
	}
	.count-pill input {
		display: none;
	}
	.count-pill:hover {
		border-color: var(--color-accent);
	}
	.count-pill.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-surface);
	}
	@media (max-width: 540px) {
		.grid {
			grid-template-columns: 1fr;
		}
		.span-2 {
			grid-column: 1;
		}
	}
</style>
