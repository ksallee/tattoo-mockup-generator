<script>
	import { readFileAsBase64 } from '$lib/file.js';

	let {
		image = $bindable(/** @type {{mimeType:string,data:string} | null} */ (null)),
		previewUrl = $bindable('')
	} = $props();

	let dragOver = $state(false);
	let reading = $state(false);
	let error = $state('');
	/** @type {HTMLInputElement | null} */
	let inputEl = $state(null);

	/**
	 * Read the file into base64 immediately on selection. iOS Safari invalidates
	 * file handles after a delay between <input> pick and FileReader.read, so we
	 * can't safely defer this until the user clicks Generate.
	 *
	 * @param {File | null | undefined} f
	 */
	async function setFile(f) {
		if (!f) return;
		if (!f.type.startsWith('image/')) {
			error = 'Please select an image file (PNG, JPG, WebP).';
			return;
		}
		error = '';
		reading = true;

		// Refresh preview URL synchronously while the file ref is still valid.
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = URL.createObjectURL(f);

		try {
			image = await readFileAsBase64(f);
		} catch (/** @type {any} */ e) {
			error = `Could not read this image: ${e?.message || e}. Try picking it again or choose a different file.`;
			image = null;
		} finally {
			reading = false;
		}
	}

	function clear() {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		image = null;
		previewUrl = '';
		error = '';
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
		{#if reading}
			<div class="reading">Reading…</div>
		{/if}
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
		accept="image/png,image/jpeg,image/webp,image/*"
		hidden
		onchange={(e) => setFile(/** @type {HTMLInputElement} */ (e.currentTarget).files?.[0])}
	/>
</div>

{#if error}
	<div class="dropzone-error">{error}</div>
{/if}

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
	.reading {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.7);
		color: var(--color-text);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
	}
	.dropzone-error {
		margin-top: var(--space-2);
		background: color-mix(in srgb, var(--color-error) 8%, transparent);
		color: var(--color-error);
		border: 1px solid color-mix(in srgb, var(--color-error) 25%, transparent);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
	}
</style>
