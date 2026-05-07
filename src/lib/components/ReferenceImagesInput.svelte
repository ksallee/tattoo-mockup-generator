<script>
	import { downscaleImage, toDataUrl } from '$lib/file.js';

	/**
	 * @typedef {{id: string, roles: string[], mimeType: string, data: string, width?: number, height?: number}} RefImage
	 */

	function newId() {
		return `ref-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	}

	let {
		refImages = $bindable(/** @type {RefImage[]} */ ([])),
		maxRefs = 3
	} = $props();

	const ROLES = [
		{ value: 'pose', label: 'Pose', icon: 'lucide:user' },
		{ value: 'composition', label: 'Composition', icon: 'lucide:frame' },
		{ value: 'photography-style', label: 'Photo style', icon: 'lucide:camera' },
		{ value: 'body-skin', label: 'Body / skin', icon: 'lucide:person-standing' },
		{ value: 'vibe-mood', label: 'Vibe', icon: 'lucide:sparkle' }
	];

	let busyIndex = $state(/** @type {number | null} */ (null));
	let error = $state('');

	/** @param {File | null | undefined} file @param {number} idx -1 to append */
	async function setFile(file, idx) {
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			error = 'Please select an image file (PNG, JPG, WebP).';
			return;
		}
		error = '';
		busyIndex = idx === -1 ? refImages.length : idx;
		try {
			const img = await downscaleImage(file);
			const existingRef = idx >= 0 ? refImages[idx] : undefined;
			const roles =
				existingRef?.roles && existingRef.roles.length > 0 ? existingRef.roles : ['pose'];
			const id = existingRef?.id || newId();
			const next = {
				id,
				roles,
				mimeType: img.mimeType,
				data: img.data,
				width: img.width,
				height: img.height
			};
			if (idx === -1) {
				refImages = [...refImages, next];
			} else {
				const copy = refImages.slice();
				copy[idx] = next;
				refImages = copy;
			}
		} catch (/** @type {any} */ e) {
			error = `Could not read this image: ${e?.message || e}.`;
		} finally {
			busyIndex = null;
		}
	}

	/** @param {number} idx */
	function removeRef(idx) {
		refImages = refImages.filter((/** @type {RefImage} */ _r, /** @type {number} */ i) => i !== idx);
	}

	/** @param {number} idx @param {string} role */
	function toggleRole(idx, role) {
		const copy = refImages.slice();
		const current = Array.isArray(copy[idx].roles) ? copy[idx].roles : [];
		copy[idx] = {
			...copy[idx],
			roles: current.includes(role)
				? current.filter((/** @type {string} */ r) => r !== role)
				: [...current, role]
		};
		refImages = copy;
	}
</script>

<div class="ref-input">
	<div class="header">
		<div class="title">Reference images <span class="hint-inline">(optional, up to {maxRefs})</span></div>
		<div class="hint">
			Add up to {maxRefs} extra images. For each one, pick any number of roles — the model will use it for those aspects only.
		</div>
	</div>

	<div class="ref-list">
		{#each refImages as ref, i (ref.id ?? i)}
			<div class="ref-slot">
				<div class="thumb-wrap">
					<img class="thumb" src={toDataUrl({ mimeType: ref.mimeType, data: ref.data })} alt="Reference {i + 1}" />
					{#if busyIndex === i}
						<div class="busy">Reading…</div>
					{/if}
					<button
						type="button"
						class="remove"
						aria-label="Remove reference"
						title="Remove"
						onclick={() => removeRef(i)}
					>
						<iconify-icon icon="lucide:x" aria-hidden="true"></iconify-icon>
					</button>
				</div>
				<div class="role-chips">
					{#each ROLES as role (role.value)}
						<button
							type="button"
							class="role-chip"
							class:active={Array.isArray(ref.roles) && ref.roles.includes(role.value)}
							onclick={() => toggleRole(i, role.value)}
							title={role.label}
						>
							<iconify-icon icon={role.icon} aria-hidden="true"></iconify-icon>
							<span>{role.label}</span>
						</button>
					{/each}
				</div>
			</div>
		{/each}

		{#if refImages.length < maxRefs}
			<label class="add-slot">
				<input
					type="file"
					accept="image/png,image/jpeg,image/webp,image/*"
					hidden
					onchange={(e) =>
						setFile(/** @type {HTMLInputElement} */ (e.currentTarget).files?.[0], -1)}
				/>
				{#if busyIndex === refImages.length}
					<div class="busy add-busy">Reading…</div>
				{:else}
					<iconify-icon icon="lucide:plus" aria-hidden="true"></iconify-icon>
					<span>Add reference</span>
				{/if}
			</label>
		{/if}
	</div>

	{#if error}
		<div class="error">{error}</div>
	{/if}
</div>

<style>
	.ref-input {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.header {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}
	.title {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
	}
	.hint-inline {
		font-family: var(--font-body, inherit);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-regular);
		color: var(--color-text-secondary);
	}
	.hint {
		font-size: var(--font-size-sm);
		color: var(--color-text-dimmed);
	}

	.ref-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: var(--space-3);
	}
	.ref-slot {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-2);
	}
	.thumb-wrap {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		background: var(--color-neutral-100);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}
	.thumb {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.busy {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.7);
		color: var(--color-text);
		font-size: var(--font-size-sm);
	}
	.remove {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--color-surface);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		padding: 0;
	}
	.remove:hover {
		color: var(--color-error);
		border-color: var(--color-error);
	}

	.role-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}
	.role-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		border-radius: 999px;
		padding: 0.2rem 0.5rem;
		font-size: var(--font-size-xs);
		cursor: pointer;
		transition: background 0.12s, border-color 0.12s, color 0.12s;
	}
	.role-chip:hover:not(.active) {
		border-color: var(--color-text-secondary);
		color: var(--color-text);
	}
	.role-chip.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-surface);
	}
	.role-chip :global(iconify-icon) {
		font-size: 0.85em;
		line-height: 0;
	}

	.add-slot {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 220px;
		background: var(--color-surface-2);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-dimmed);
		cursor: pointer;
		font-size: var(--font-size-sm);
		transition: border-color 0.12s, color 0.12s;
	}
	.add-slot:hover {
		border-color: var(--color-accent);
		color: var(--color-text);
	}
	.add-slot :global(iconify-icon) {
		font-size: 1.5rem;
	}
	.add-busy {
		background: transparent;
		color: var(--color-text);
	}
	.error {
		background: color-mix(in srgb, var(--color-error) 8%, transparent);
		color: var(--color-error);
		border: 1px solid color-mix(in srgb, var(--color-error) 25%, transparent);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
	}
</style>
