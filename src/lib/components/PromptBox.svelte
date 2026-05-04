<script>
	let {
		value = $bindable(''),
		autoValue = '',
		dirty = $bindable(false)
	} = $props();

	/** @type {HTMLTextAreaElement | null} */
	let el = $state(null);

	function adjustHeight() {
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = el.scrollHeight + 'px';
	}

	$effect(() => {
		// Re-measure whenever value changes (incl. programmatic updates from autoValue).
		void value;
		setTimeout(adjustHeight, 0);
	});

	/** @param {Event & { currentTarget: HTMLTextAreaElement }} e */
	function onInput(e) {
		value = e.currentTarget.value;
		dirty = value !== autoValue;
	}

	function reset() {
		value = autoValue;
		dirty = false;
	}
</script>

<div class="field">
	<div class="prompt-header">
		<label class="field-label" for="prompt-textarea">Prompt</label>
		{#if dirty}
			<button type="button" class="btn btn-ghost reset-btn" onclick={reset}>
				<iconify-icon icon="lucide:rotate-ccw"></iconify-icon>
				Reset to auto
			</button>
		{:else}
			<span class="field-help-inline">auto-generated from settings — edit to override</span>
		{/if}
	</div>
	<textarea
		bind:this={el}
		id="prompt-textarea"
		class="textarea prompt-textarea"
		rows="3"
		{value}
		oninput={onInput}
	></textarea>
</div>

<style>
	.prompt-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.field-help-inline {
		font-weight: var(--font-weight-normal);
		color: var(--color-text-dimmed);
		font-size: var(--font-size-xs);
	}
	.prompt-textarea {
		resize: none;
		overflow: hidden;
		font-family: var(--font-sans);
		min-height: 5rem;
		line-height: 1.45;
	}
	.reset-btn {
		font-size: var(--font-size-xs);
		padding: 0.125rem 0.5rem;
		gap: 0.25rem;
	}
	.reset-btn :global(iconify-icon) {
		font-size: 0.95em;
		line-height: 0;
	}
</style>
