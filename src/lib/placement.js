/**
 * Placement-marker math + canvas composite.
 *
 * The marker rect is stored in *fractional* image coordinates so it stays
 * meaningful regardless of how the photo is sized on screen:
 *
 *   - cx, cy in [0..1]   : center, fractions of image width/height
 *   - w, h  in (0..1.5]  : dimensions, fractions of image width/height
 *   - angle in degrees   : rotation around the rect's own center
 *
 * @typedef {{cx: number, cy: number, w: number, h: number, angle: number}} Rect
 */

/** @type {Rect} */
export const DEFAULT_RECT = {
	cx: 0.5,
	cy: 0.5,
	w: 0.25,
	h: 0.25,
	angle: 0
};

/**
 * @param {Rect} rect
 * @returns {Rect}
 */
export function clampRect(rect) {
	return {
		cx: Math.max(0, Math.min(1, rect.cx)),
		cy: Math.max(0, Math.min(1, rect.cy)),
		w: Math.max(0.04, Math.min(1.5, rect.w)),
		h: Math.max(0.04, Math.min(1.5, rect.h)),
		angle: rect.angle
	};
}

/**
 * Map a point in the rect's local frame (centered, unrotated) to fractional
 * image coords (post-rotation, post-translation).
 *
 * @param {number} lx
 * @param {number} ly
 * @param {Rect} rect
 * @returns {{x: number, y: number}}
 */
export function localToImage(lx, ly, rect) {
	const rad = (rect.angle * Math.PI) / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);
	return {
		x: rect.cx + lx * cos - ly * sin,
		y: rect.cy + lx * sin + ly * cos
	};
}

/**
 * Inverse of localToImage — fractional image coords → rect's local frame.
 *
 * @param {number} ix
 * @param {number} iy
 * @param {Rect} rect
 * @returns {{x: number, y: number}}
 */
export function imageToLocal(ix, iy, rect) {
	const rad = (-rect.angle * Math.PI) / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);
	const dx = ix - rect.cx;
	const dy = iy - rect.cy;
	return {
		x: dx * cos - dy * sin,
		y: dx * sin + dy * cos
	};
}

/** @type {Record<string, {dx: 1|-1, dy: 1|-1}>} */
const CORNER_SIGN = {
	nw: { dx: -1, dy: -1 },
	ne: { dx: 1, dy: -1 },
	sw: { dx: -1, dy: 1 },
	se: { dx: 1, dy: 1 }
};

/**
 * Resize the rect by dragging one corner. The opposite corner stays anchored
 * in image space (so the rest of the rect rotates around it correctly even
 * when angle ≠ 0).
 *
 * @param {Rect} startRect          rect at drag start
 * @param {'nw'|'ne'|'sw'|'se'} corner  which corner is being dragged
 * @param {{x: number, y: number}} pointer  current pointer in fractional image coords
 * @returns {Rect}
 */
export function applyResize(startRect, corner, pointer) {
	const drag = CORNER_SIGN[corner];
	const opp = { dx: -drag.dx, dy: -drag.dy };

	// Opposite corner in image coords (anchor — does not move during drag).
	const anchorLocal = { x: (opp.dx * startRect.w) / 2, y: (opp.dy * startRect.h) / 2 };
	const anchorImg = localToImage(anchorLocal.x, anchorLocal.y, startRect);

	// New center is the midpoint of anchor and pointer.
	const newCx = (anchorImg.x + pointer.x) / 2;
	const newCy = (anchorImg.y + pointer.y) / 2;

	// Half-extents of the new rect, in local (rotated-back) coords.
	const halfLocal = imageToLocal(pointer.x, pointer.y, {
		cx: newCx,
		cy: newCy,
		w: 0,
		h: 0,
		angle: startRect.angle
	});

	return clampRect({
		cx: newCx,
		cy: newCy,
		w: Math.abs(halfLocal.x) * 2,
		h: Math.abs(halfLocal.y) * 2,
		angle: startRect.angle
	});
}

/**
 * Move the rect by a fractional delta.
 *
 * @param {Rect} startRect
 * @param {{x: number, y: number}} delta  fractional image-coord delta
 * @returns {Rect}
 */
export function applyMove(startRect, delta) {
	return clampRect({ ...startRect, cx: startRect.cx + delta.x, cy: startRect.cy + delta.y });
}

/**
 * Rotate the rect to point its top edge toward the pointer.
 *
 * @param {Rect} startRect
 * @param {{x: number, y: number}} pointer  fractional image coords
 * @returns {Rect}
 */
export function applyRotate(startRect, pointer) {
	const dx = pointer.x - startRect.cx;
	const dy = pointer.y - startRect.cy;
	if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return startRect;
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
	return { ...startRect, angle };
}

/**
 * Composite a body photo with the placement-marker rectangle drawn on top.
 * Returns a base64-encoded JPEG of the same dimensions as the input photo.
 *
 * @param {{mimeType: string, data: string}} photo
 * @param {Rect} rect
 * @returns {Promise<{mimeType: string, data: string}>}
 */
export async function compositeMarker(photo, rect) {
	const img = await loadImageFromBase64(photo);
	const canvas = document.createElement('canvas');
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas 2D not available');

	ctx.drawImage(img, 0, 0);

	const cx = rect.cx * canvas.width;
	const cy = rect.cy * canvas.height;
	const w = rect.w * canvas.width;
	const h = rect.h * canvas.height;
	const angle = (rect.angle * Math.PI) / 180;

	ctx.save();
	ctx.translate(cx, cy);
	ctx.rotate(angle);

	// Corner brackets (camera-focus style) instead of a full rectangle —
	// less visually rectangle-like, so Gemini is less inclined to draw it
	// back into the output. Hot pink reads as an annotation, not a design.
	const lineWidth = Math.max(4, Math.min(canvas.width, canvas.height) * 0.006);
	const arm = Math.min(w, h) * 0.18;
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = '#ec4899';
	ctx.lineCap = 'square';

	ctx.beginPath();
	// Top-left
	ctx.moveTo(-w / 2, -h / 2 + arm);
	ctx.lineTo(-w / 2, -h / 2);
	ctx.lineTo(-w / 2 + arm, -h / 2);
	// Top-right
	ctx.moveTo(w / 2 - arm, -h / 2);
	ctx.lineTo(w / 2, -h / 2);
	ctx.lineTo(w / 2, -h / 2 + arm);
	// Bottom-right
	ctx.moveTo(w / 2, h / 2 - arm);
	ctx.lineTo(w / 2, h / 2);
	ctx.lineTo(w / 2 - arm, h / 2);
	// Bottom-left
	ctx.moveTo(-w / 2 + arm, h / 2);
	ctx.lineTo(-w / 2, h / 2);
	ctx.lineTo(-w / 2, h / 2 - arm);
	ctx.stroke();

	// Top-edge tick to disambiguate orientation.
	ctx.beginPath();
	ctx.moveTo(0, -h / 2);
	ctx.lineTo(0, -h / 2 - arm * 0.6);
	ctx.stroke();

	ctx.restore();

	const blob = await /** @type {Promise<Blob | null>} */ (
		new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
	);
	if (!blob) throw new Error('Composite failed');
	const data = await blobToBase64(blob);
	return { mimeType: 'image/jpeg', data };
}

/**
 * @param {{mimeType: string, data: string}} photo
 * @returns {Promise<HTMLImageElement>}
 */
function loadImageFromBase64(photo) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = (err) => reject(err);
		img.src = `data:${photo.mimeType};base64,${photo.data}`;
	});
}

/**
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
function blobToBase64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(reader.error);
		reader.onload = () => {
			const result = String(reader.result || '');
			const comma = result.indexOf(',');
			resolve(comma >= 0 ? result.slice(comma + 1) : result);
		};
		reader.readAsDataURL(blob);
	});
}
