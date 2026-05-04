<script>
	import { toDataUrl, downloadImage } from '$lib/file.js';

	let {
		images = /** @type {{mimeType:string,data:string}[]} */ ([]),
		loading = false,
		count = 2
	} = $props();

	/** @type {{mimeType:string,data:string} | null} */
	let lightbox = $state(null);
</script>

<div class="grid" style:--cols={Math.min(count, 2)}>
	{#if loading}
		{#each Array(count) as _, i (i)}
			<div class="tile skeleton" aria-busy="true"></div>
		{/each}
	{:else}
		{#each images as img, i (i)}
			<div class="tile">
				<button
					type="button"
					class="img-btn"
					onclick={() => (lightbox = img)}
					aria-label="View full size"
				>
					<img src={toDataUrl(img)} alt="Tattoo mockup variation {i + 1}" />
				</button>
				<button
					type="button"
					class="btn btn-ghost dl"
					onclick={() => downloadImage(img, `tattoo-mockup-${Date.now()}-${i + 1}`)}
					aria-label="Download image"
				>
					<iconify-icon icon="lucide:download"></iconify-icon>
					Download
				</button>
			</div>
		{/each}
	{/if}
</div>

{#if lightbox}
	<button
		type="button"
		class="lightbox"
		onclick={() => (lightbox = null)}
		aria-label="Close preview"
	>
		<img src={toDataUrl(lightbox)} alt="Full-size mockup" />
	</button>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(var(--cols, 2), 1fr);
		gap: var(--space-4);
	}
	.tile {
		position: relative;
		background: var(--color-neutral-100);
		border-radius: var(--radius-lg);
		overflow: hidden;
		aspect-ratio: 1;
		box-shadow: var(--shadow-sm);
	}
	.img-btn {
		all: unset;
		display: block;
		width: 100%;
		height: 100%;
		cursor: zoom-in;
	}
	.img-btn img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.dl {
		position: absolute;
		bottom: var(--space-2);
		right: var(--space-2);
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(4px);
		gap: 0.375rem;
	}
	.dl :global(iconify-icon) {
		font-size: 1em;
		line-height: 0;
	}
	.skeleton {
		background: linear-gradient(
			90deg,
			var(--color-neutral-100) 0%,
			var(--color-neutral-200) 50%,
			var(--color-neutral-100) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.4s ease-in-out infinite;
	}
	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
	.lightbox {
		all: unset;
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.85);
		cursor: zoom-out;
		z-index: 100;
		padding: var(--space-6);
	}
	.lightbox img {
		max-width: 95vw;
		max-height: 95vh;
		object-fit: contain;
		box-shadow: var(--shadow-lg);
	}
	@media (max-width: 600px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
