<script>
	let { value = $bindable('') } = $props();
	let revealed = $state(false);
</script>

<div class="field">
	<label class="field-label" for="api-key">
		Google AI Studio API key
		<span class="field-help-inline">— stored in your browser only, sent only to Gemini</span>
	</label>
	<div class="key-row">
		<input
			id="api-key"
			class="input"
			type={revealed ? 'text' : 'password'}
			placeholder="AIza…"
			autocomplete="off"
			spellcheck="false"
			bind:value
		/>
		<button
			type="button"
			class="btn btn-ghost icon-btn"
			onclick={() => (revealed = !revealed)}
			aria-label={revealed ? 'Hide key' : 'Show key'}
		>
			<iconify-icon icon={revealed ? 'lucide:eye-off' : 'lucide:eye'}></iconify-icon>
		</button>
		<a
			class="btn btn-ghost"
			href="https://aistudio.google.com/apikey"
			target="_blank"
			rel="noopener"
		>
			Get one
			<iconify-icon icon="lucide:external-link"></iconify-icon>
		</a>
	</div>
</div>

<style>
	.key-row {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}
	.key-row .input {
		flex: 1;
	}
	.field-help-inline {
		font-weight: var(--font-weight-normal);
		color: var(--color-text-dimmed);
		font-size: var(--font-size-xs);
		margin-left: var(--space-1);
	}
	.icon-btn {
		padding: 0.5rem 0.625rem;
	}
	.icon-btn :global(iconify-icon),
	.btn :global(iconify-icon) {
		font-size: 1.05em;
		line-height: 0;
	}
</style>
