/**
 * A rug, woven knot by knot.
 *
 * Rules taken from the reference rugs and prints:
 *   - a rug is a field bounded by borders, never a scatter of shapes
 *   - borders repeat: an edge line, stepped triangles, a chain of diamonds
 *   - the field is one continuous pattern, chosen per rug: meandering worms,
 *     broken bars, a warped checkerboard, or the banded edge of a fractal
 *   - everything sits on a coarse knot grid, so curves step and edges fray,
 *     and the odd tuft is missing
 *
 * weave() returns one code per knot: 0 bare, 1 blue, 2 pink, 3 both inks.
 */

/** @param {number} seed */
function rng(seed) {
	let a = seed >>> 0 || 1;
	return () => {
		a ^= a << 13;
		a >>>= 0;
		a ^= a >> 17;
		a ^= a << 5;
		a >>>= 0;
		return a / 4294967296;
	};
}

/** Smooth value noise, roughly 0..1. @param {() => number} rand */
function noise(rand) {
	const perm = Array.from({ length: 256 }, (_, i) => i).sort(() => rand() - 0.5);
	const vals = Float32Array.from({ length: 256 }, () => rand());
	const at = (/** @type {number} */ i, /** @type {number} */ j) =>
		vals[perm[(perm[i & 255] + j) & 255]];
	const n = (/** @type {number} */ x, /** @type {number} */ y) => {
		const xi = Math.floor(x);
		const yi = Math.floor(y);
		const xf = x - xi;
		const yf = y - yi;
		const u = xf * xf * (3 - 2 * xf);
		const v = yf * yf * (3 - 2 * yf);
		const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * u;
		const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * u;
		return a + (b - a) * v;
	};
	return (/** @type {number} */ x, /** @type {number} */ y) =>
		(n(x, y) * 0.5 + n(x * 2.03, y * 2.03) * 0.25 + n(x * 4.11, y * 4.11) * 0.125) / 0.875;
}

const frac = (/** @type {number} */ v) => v - Math.floor(v);

/**
 * Each field maps a knot to an ink code. x and y are in knots.
 * @typedef {(x: number, y: number) => number} Field
 */

/** Meandering worms, like a jacquard: contour lines of a warped noise field. */
function meander(/** @type {() => number} */ rand) {
	const a = noise(rand);
	const b = noise(rand);
	const scale = 0.03 + rand() * 0.015;
	const bands = 5 + rand() * 2;
	return (/** @type {number} */ x, /** @type {number} */ y) => {
		const wx = x + 14 * a(x * 0.03, y * 0.03);
		const wy = y + 14 * a(x * 0.03 + 7, y * 0.03 + 3);
		const blue = Math.abs(frac(a(wx * scale, wy * scale) * bands) - 0.5) < 0.15;
		// a second, sparser set of worms in pink, crossing the first
		const pink = Math.abs(frac(b(wx * scale * 0.8, wy * scale * 0.8) * bands * 0.8) - 0.5) < 0.09;
		return (blue ? 1 : 0) | (pink ? 2 : 0);
	};
}

/** Broken bars, like a flatweave: columns of dashes that slip against each other. */
function bars(/** @type {() => number} */ rand, /** @type {number} */ rows) {
	const n = noise(rand);
	const width = 1 + Math.floor(rand() * 2);
	const gap = 1;
	/** @type {Map<number, number[]>} */
	const cuts = new Map();
	const column = (/** @type {number} */ c) => {
		let col = cuts.get(c);
		if (!col) {
			// where each dash in this column ends
			col = [];
			let y = -Math.floor(rand() * 6);
			while (y < rows + 8) {
				y += 1 + Math.floor(rand() * 4);
				col.push(y);
				y += 1;
				col.push(y);
			}
			cuts.set(c, col);
		}
		return col;
	};
	return (/** @type {number} */ x, /** @type {number} */ y) => {
		const c = Math.floor(x / (width + gap));
		if (x - c * (width + gap) >= width) return 0;
		const col = column(c);
		let i = 0;
		while (i < col.length && col[i] <= y) i += 1;
		if (i % 2 === 1) return 0; // inside a gap between dashes
		// broad patches of the field go pink, the way a weaver changes yarn
		return n(c * 0.15, y * 0.08) > 0.62 ? 2 : 1;
	};
}

/** A checkerboard pulled out of true by a swirl and a slow warp. */
function checker(/** @type {() => number} */ rand, /** @type {number} */ cols, /** @type {number} */ rows) {
	const n = noise(rand);
	const size = 2 + Math.floor(rand() * 2);
	const cx = cols * (0.25 + rand() * 0.5);
	const cy = rows * (0.3 + rand() * 0.4);
	const twist = (rand() < 0.5 ? -1 : 1) * (1.2 + rand() * 1.4);
	const reach = Math.max(cols, rows) * 0.45;
	return (/** @type {number} */ x, /** @type {number} */ y) => {
		const dx = x - cx;
		const dy = y - cy;
		const d = Math.hypot(dx, dy);
		const turn = twist * Math.exp(-(d * d) / (reach * reach));
		const c = Math.cos(turn);
		const s = Math.sin(turn);
		const u = (cx + dx * c - dy * s + 5 * n(x * 0.05, y * 0.05)) / size;
		const v = (cy + dx * s + dy * c + 5 * n(x * 0.05 + 5, y * 0.05 + 9)) / size;
		const iu = Math.floor(u);
		const iv = Math.floor(v);
		if ((iu + iv) & 1) return 0;
		return [1, 2, 3][(((iu - iv) % 3) + 3) % 3];
	};
}

/** The banded edge of the Mandelbrot set, posterised to the two inks. */
function fractal(/** @type {() => number} */ rand, /** @type {number} */ cols, /** @type {number} */ rows) {
	const spots = [
		[-0.745, 0.11, 0.06],
		[-0.16, 1.035, 0.08],
		[-1.25, 0.02, 0.1],
		[0.285, 0.012, 0.06],
		[-0.75, 0.0, 0.35],
		[-0.1, 0.65, 0.2],
		[0.36, 0.1, 0.12]
	];
	const LIMIT = 90;
	const shift = Math.floor(rand() * 4);

	const escape = (/** @type {number} */ cr, /** @type {number} */ ci) => {
		let zr = 0;
		let zi = 0;
		let i = 0;
		while (i < LIMIT && zr * zr + zi * zi < 4) {
			const t = zr * zr - zi * zi + cr;
			zi = 2 * zr * zi + ci;
			zr = t;
			i += 1;
		}
		return i;
	};
	// inside the set is bare, so the bands frame a hole; far outside escapes
	// at once and stays bare; the bands crowd in toward the edge
	const ink = (/** @type {number} */ i) =>
		i === LIMIT || i < 5 ? 0 : [1, 0, 2, 0, 3, 0][(Math.floor(Math.sqrt(i) * 2.2) + shift) % 6];

	// Try views until one puts a fair amount of ink on the rug: a view that
	// lands deep inside or far outside the set would weave an empty field.
	let view = { re: -0.745, im: 0.11, step: 0.06 / cols };
	for (let attempt = 0; attempt < 16; attempt += 1) {
		const [re, im, span] = spots[Math.floor(rand() * spots.length)];
		const step = (span * (0.6 + rand() * 0.8)) / cols;
		const cre = re + (rand() - 0.5) * span * 0.5;
		const cim = im + (rand() - 0.5) * span * 0.5;
		let inked = 0;
		for (let sy = 0; sy < 12; sy += 1) {
			for (let sx = 0; sx < 24; sx += 1) {
				const x = (sx + 0.5) * (cols / 24);
				const y = (sy + 0.5) * (rows / 12);
				if (ink(escape(cre + (x - cols / 2) * step, cim + (y - rows / 2) * step))) inked += 1;
			}
		}
		view = { re: cre, im: cim, step };
		const share = inked / 288;
		if (share > 0.28 && share < 0.6) break;
	}

	return (/** @type {number} */ x, /** @type {number} */ y) =>
		ink(escape(view.re + (x - cols / 2) * view.step, view.im + (y - rows / 2) * view.step));
}

export const FIELDS = ['meander', 'bars', 'checker', 'fractal'];

/**
 * The border band, read from its outer edge inward. d is the knot's depth
 * into the band, along is its position along the rug. Two styles: stepped
 * triangles, or a chain of diamonds on a thread.
 */
function border(
	/** @type {number} */ d,
	/** @type {number} */ along,
	/** @type {number} */ period,
	/** @type {number} */ style
) {
	const p = ((along % period) + period) % period;
	const mid = period / 2;
	if (d === 1 || d === BAND - 2) return 1; // edge lines
	if (d < 3 || d > BAND - 4) return 0;
	const depth = d - 3; // 0..4 inside the band
	if (style === 0) {
		// stepped triangles pointing inward, one knot narrower per row
		return Math.abs(p - mid) <= mid - 1 - depth * 1.5 ? 2 : 0;
	}
	const r = Math.abs(p - mid) + Math.abs(depth - 2);
	if (r <= 2) return Math.floor(along / period) % 2 ? 2 : 3;
	return depth === 2 ? 1 : 0;
}

const BAND = 9; // knots of border at top and at bottom

/**
 * @param {number} seed
 * @param {number} cols knots across
 * @param {number} rows knots down
 * @param {string} [only] force one field, for checking them
 * @returns {{ codes: Uint8Array, field: string }}
 */
export function weave(seed, cols, rows, only) {
	const rand = rng(seed);
	const name = only ?? FIELDS[Math.floor(rand() * FIELDS.length)];
	const period = 8 + 2 * Math.floor(rand() * 3);
	const style = rand() < 0.5 ? 0 : 1;
	const codes = new Uint8Array(cols * rows);

	// Scale play: the field is woven coarser than the borders, and its grain
	// swells across the rug, so fine and heavy knots meet in one piece.
	const grain = 1 + Math.floor(rand() * 2);
	const swell = 1 + rand() * 1.6;
	const flip = rand() < 0.5;
	const scaleAt = (/** @type {number} */ x) => {
		const t = flip ? 1 - x / cols : x / cols;
		return grain * (1 + swell * t * t);
	};
	// Field position across the rug: the running sum of 1 / scale, so the
	// pattern stretches smoothly as the grain swells instead of folding back.
	const across = new Float32Array(cols);
	for (let x = 1; x < cols; x += 1) across[x] = across[x - 1] + 1 / scaleAt(x);

	// the field's own size, in field knots
	const fw = Math.ceil(across[cols - 1]) + 1;
	const fh = Math.ceil((rows - 2 * BAND) / grain);
	/** @type {Field} */
	const field =
		name === 'meander'
			? meander(rand)
			: name === 'bars'
				? bars(rand, fh)
				: name === 'checker'
					? checker(rand, fw, fh)
					: fractal(rand, fw, fh);

	for (let y = 0; y < rows; y += 1) {
		for (let x = 0; x < cols; x += 1) {
			let code;
			if (y < BAND) code = border(y, x, period, style);
			else if (y >= rows - BAND) code = border(rows - 1 - y, x, period, style);
			else {
				// one field knot spans k rug knots here, so the field reads blockier
				// and bigger the further the grain has swelled
				const k = scaleAt(x);
				code = field(Math.floor(across[x]), Math.floor((y - BAND) / k));
			}

			// a hand-knotted rug drops the odd tuft, and frays a little
			const r = rand();
			if (r < 0.035) code = 0;
			else if (r > 0.995 && !code) code = rand() < 0.5 ? 1 : 2;

			codes[y * cols + x] = code;
		}
	}
	return { codes, field: name };
}
