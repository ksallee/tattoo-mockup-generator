<script>
	// Phase B stub — full implementation lands in Phase E.
	// eslint-disable-next-line no-unused-vars
	let { apiKey, model } = $props();
</script>

<section class="card row stub">
	<iconify-icon icon="lucide:wrench" aria-hidden="true"></iconify-icon>
	<div class="text">
		<h2>Client mockup — coming soon</h2>
		<p>Place a design on your client's actual body photo with optional placement marker.</p>
	</div>
</section>

<style>
	.row {
		width: 100%;
	}
	.card.row {
		padding: var(--space-5) var(--space-6);
	}
	.stub {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		color: var(--color-text-secondary);
	}
	.stub :global(iconify-icon) {
		font-size: 2rem;
		color: var(--color-text-dimmed);
	}
	.stub h2 {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		margin: 0 0 var(--space-1);
		color: var(--color-text);
	}
	.stub p {
		margin: 0;
		font-size: var(--font-size-sm);
	}
</style>
