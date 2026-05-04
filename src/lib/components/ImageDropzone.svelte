<script>
	let { file = $bindable(null), previewUrl = $bindable('') } = $props();

	let dragOver = $state(false);
	/** @type {HTMLInputElement | null} */
	let inputEl = $state(null);

	/** @param {File | null | undefined} f */
	function setFile(f) {
		if (!f) return;
		if (!f.type.startsWith('image/')) return;
		file = f;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = URL.createObjectURL(f);
	}

	function clear() {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		file = null;
		previewUrl = '';
		if (inputEl) inputEl.value = '';
	}

	/** @param {DragEvent} e */
	function onDrop(e) {
		e.preventDefault();
		dragOver = false;
		setFile(e.dataTransfer?.files?.[0]);
	}
</script>

<div
	class="dropzone"
	class:has-image={!!previewUrl}
	class:drag-over={dragOver}
	role="button"
	tabindex="0"
	ondragover={(e) => {
		e.preventDefault();
		dragOver = true;
	}}
	ondragleave={() => (dragOver = false)}
	ondrop={onDrop}
	onclick={() => inputEl?.click()}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			inputEl?.click();
		}
	}}
>
	{#if previewUrl}
		<img src={previewUrl} alt="Tattoo preview" />
		<button
			type="button"
			class="btn btn-ghost remove"
			onclick={(e) => {
				e.stopPropagation();
				clear();
			}}
			aria-label="Remove image"
		>
			<iconify-icon icon="lucide:x"></iconify-icon>
		</button>
	{:else}
		<div class="placeholder">
			<iconify-icon class="placeholder-icon" icon="lucide:upload-cloud" aria-hidden="true"
			></iconify-icon>
			<div class="placeholder-title">Drop your tattoo design here</div>
			<div class="placeholder-sub">or click to browse — PNG, JPG, WebP</div>
		</div>
	{/if}

	<input
		bind:this={inputEl}
		type="file"
		accept="image/*"
		hidden
		onchange={(e) => setFile(/** @type {HTMLInputElement} */ (e.currentTarget).files?.[0])}
	/>
</div>

<style>
	.dropzone {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 240px;
		background: var(--color-surface-2);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
		overflow: hidden;
	}
	.dropzone:hover,
	.dropzone:focus-visible {
		border-color: var(--color-accent);
		outline: none;
	}
	.dropzone.drag-over {
		border-color: var(--color-accent);
		background: var(--color-accent-light);
	}
	.dropzone.has-image {
		min-height: 320px;
		background: var(--color-neutral-100);
	}
	.dropzone img {
		max-width: 100%;
		max-height: 420px;
		object-fit: contain;
	}
	.placeholder {
		text-align: center;
		color: var(--color-text-secondary);
		padding: var(--space-6);
	}
	.placeholder-icon {
		font-size: 2.5rem;
		color: var(--color-text-dimmed);
		display: block;
		margin-bottom: var(--space-2);
	}
	.placeholder-title {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		margin-bottom: var(--space-1);
	}
	.placeholder-sub {
		font-size: var(--font-size-sm);
	}
	.remove {
		position: absolute;
		top: var(--space-2);
		right: var(--space-2);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
	}
</style>
