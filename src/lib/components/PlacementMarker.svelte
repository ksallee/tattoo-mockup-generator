<script>
	import { applyMove, applyResize, applyRotate, clampRect, DEFAULT_RECT } from '$lib/placement.js';

	/**
	 * @typedef {{cx: number, cy: number, w: number, h: number, angle: number}} Rect
	 */

	let {
		image = /** @type {{mimeType:string,data:string} | null} */ (null),
		rect = $bindable(/** @type {Rect} */ ({ ...DEFAULT_RECT }))
	} = $props();

	/** @type {HTMLDivElement | null} */
	let containerEl = $state(null);

	/** @type {{mode: string, startX: number, startY: number, startRect: Rect, pointerId: number} | null} */
	let drag = $state(null);

	const previewUrl = $derived(image ? `data:${image.mimeType};base64,${image.data}` : '');

	/** @param {PointerEvent} e */
	function pointerFraction(e) {
		if (!containerEl) return { x: 0, y: 0 };
		const r = containerEl.getBoundingClientRect();
		return {
			x: (e.clientX - r.left) / r.width,
			y: (e.clientY - r.top) / r.height
		};
	}

	/** @param {PointerEvent} e @param {string} mode */
	function start(e, mode) {
		if (!containerEl) return;
		e.preventDefault();
		e.stopPropagation();
		const p = pointerFraction(e);
		drag = { mode, startX: p.x, startY: p.y, startRect: { ...rect }, pointerId: e.pointerId };
		try {
			containerEl.setPointerCapture(e.pointerId);
		} catch {
			/* iOS Safari sometimes throws */
		}
	}

	/** @param {PointerEvent} e */
	function move(e) {
		if (!drag) return;
		const p = pointerFraction(e);
		const sr = drag.startRect;

		if (drag.mode === 'move') {
			rect = applyMove(sr, { x: p.x - drag.startX, y: p.y - drag.startY });
		} else if (drag.mode === 'rotate') {
			rect = applyRotate(sr, p);
		} else if (drag.mode.startsWith('resize-')) {
			const corner = /** @type {'nw'|'ne'|'sw'|'se'} */ (drag.mode.slice(7));
			rect = applyResize(sr, corner, p);
		}
	}

	/** @param {PointerEvent} e */
	function end(e) {
		if (drag && containerEl) {
			try {
				containerEl.releasePointerCapture(e.pointerId);
			} catch {
				/* ignore */
			}
		}
		drag = null;
	}

	function reset() {
		rect = clampRect({ ...DEFAULT_RECT });
	}
</script>

{#if image}
	<div class="wrap">
		<div
			class="canvas"
			role="application"
			aria-label="Tattoo placement marker"
			bind:this={containerEl}
			onpointermove={move}
			onpointerup={end}
			onpointercancel={end}
		>
			<img class="bg" src={previewUrl} alt="" draggable="false" />

			<div
				class="rect"
				class:dragging={drag !== null}
				role="button"
				tabindex="0"
				aria-label="Drag to move tattoo placement"
				style:left="{rect.cx * 100}%"
				style:top="{rect.cy * 100}%"
				style:width="{rect.w * 100}%"
				style:height="{rect.h * 100}%"
				style:transform="translate(-50%, -50%) rotate({rect.angle}deg)"
				onpointerdown={(e) => start(e, 'move')}
			>
				<button
					type="button"
					class="rot-anchor"
					onpointerdown={(e) => start(e, 'rotate')}
					aria-label="Rotate"
					title="Drag to rotate"
				>
					<span class="rot-stem"></span>
					<span class="rot-knob">
						<iconify-icon icon="lucide:rotate-cw" aria-hidden="true"></iconify-icon>
					</span>
				</button>
				<button
					type="button"
					class="handle nw"
					onpointerdown={(e) => start(e, 'resize-nw')}
					aria-label="Resize from top-left"
				></button>
				<button
					type="button"
					class="handle ne"
					onpointerdown={(e) => start(e, 'resize-ne')}
					aria-label="Resize from top-right"
				></button>
				<button
					type="button"
					class="handle sw"
					onpointerdown={(e) => start(e, 'resize-sw')}
					aria-label="Resize from bottom-left"
				></button>
				<button
					type="button"
					class="handle se"
					onpointerdown={(e) => start(e, 'resize-se')}
					aria-label="Resize from bottom-right"
				></button>
			</div>
		</div>

		<div class="controls">
			<div class="hint">Drag the box to move · corners to resize · top knob to rotate</div>
			<button type="button" class="btn btn-ghost btn-sm" onclick={reset}>
				<iconify-icon icon="lucide:rotate-ccw" aria-hidden="true"></iconify-icon>
				Reset placement
			</button>
		</div>
	</div>
{/if}

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.canvas {
		position: relative;
		width: 100%;
		max-height: 70vh;
		background: var(--color-neutral-100);
		border-radius: var(--radius-md);
		overflow: hidden;
		touch-action: none;
		user-select: none;
	}
	.bg {
		display: block;
		width: 100%;
		height: auto;
		max-height: 70vh;
		object-fit: contain;
		pointer-events: none;
	}
	.rect {
		position: absolute;
		background: rgba(34, 211, 238, 0.18);
		border: 2px solid rgb(6, 182, 212);
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4) inset;
		cursor: grab;
		touch-action: none;
	}
	.rect.dragging {
		cursor: grabbing;
	}

	.handle {
		position: absolute;
		width: 18px;
		height: 18px;
		background: var(--color-surface);
		border: 2px solid rgb(6, 182, 212);
		border-radius: 50%;
		padding: 0;
		cursor: nwse-resize;
		touch-action: none;
	}
	.handle.nw {
		top: 0;
		left: 0;
		transform: translate(-50%, -50%);
		cursor: nwse-resize;
	}
	.handle.ne {
		top: 0;
		right: 0;
		transform: translate(50%, -50%);
		cursor: nesw-resize;
	}
	.handle.sw {
		bottom: 0;
		left: 0;
		transform: translate(-50%, 50%);
		cursor: nesw-resize;
	}
	.handle.se {
		bottom: 0;
		right: 0;
		transform: translate(50%, 50%);
		cursor: nwse-resize;
	}

	.rot-anchor {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translate(-50%, -100%);
		width: 24px;
		height: 32px;
		background: transparent;
		border: none;
		padding: 0;
		cursor: grab;
		touch-action: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
	}
	.rot-stem {
		width: 2px;
		flex: 1;
		background: rgb(6, 182, 212);
	}
	.rot-knob {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--color-surface);
		border: 2px solid rgb(6, 182, 212);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: rgb(6, 182, 212);
	}
	.rot-knob :global(iconify-icon) {
		font-size: 12px;
		line-height: 0;
	}

	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}
	.hint {
		font-size: var(--font-size-sm);
		color: var(--color-text-dimmed);
	}
</style>
