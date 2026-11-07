/**
 * A tiling field of pixelated tangled strands.
 *
 * Rules taken from the reference posters:
 *   - everything sits on a cell grid, axis-aligned only; a curve is a staircase
 *   - rows are an even height, columns are not: the horizontal rhythm varies
 *   - a strand is exactly one cell wide, always
 *   - strands drift diagonally in short steps, hook back, and now and then coil
 *   - strands never touch, so the ground stays visible between them
 *   - ends are blunt, with the odd short barb branching off
 *
 * scripts/pattern.mjs writes one out as static/pattern.svg, the field shown
 * before the page's script runs. The page then draws a different one per visit.
 */

const ROW = 10; // row height in px
const COLW = [6, 8, 10, 10, 12, 14, 18]; // column widths: an uneven rhythm
const COLS = 120;
const ROWS = 120;
const STRANDS = 13;
const MIN_LEN = 110;
const MAX_LEN = 260;
const INK = '#ccff00';

const DIRS = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1]
];

/** @param {number} seed */
export function makePattern(seed) {
	let a = seed >>> 0 || 1;
	const rand = () => {
		a ^= a << 13;
		a >>>= 0;
		a ^= a >> 17;
		a ^= a << 5;
		a >>>= 0;
		return a / 4294967296;
	};
	const pick = (/** @type {any[]} */ arr) => arr[Math.floor(rand() * arr.length)];
	const between = (/** @type {number} */ lo, /** @type {number} */ hi) =>
		lo + Math.floor(rand() * (hi - lo + 1));

	const widths = Array.from({ length: COLS }, () => pick(COLW));
	const xs = widths.reduce((acc, w) => [...acc, acc[acc.length - 1] + w], [0]);
	const WIDTH = xs[COLS];

	const grid = new Uint8Array(COLS * ROWS);
	const idx = (/** @type {number} */ x, /** @type {number} */ y) =>
		((((y % ROWS) + ROWS) % ROWS) * COLS + (((x % COLS) + COLS) % COLS));
	const at = (/** @type {number} */ x, /** @type {number} */ y) => grid[idx(x, y)];
	const set = (/** @type {number} */ x, /** @type {number} */ y) => {
		grid[idx(x, y)] = 1;
	};

	/** A cell is free only if its neighbours are too, so strands never touch. */
	const free = (/** @type {number} */ x, /** @type {number} */ y, /** @type {any} */ from) => {
		if (at(x, y)) return false;
		for (const [dx, dy] of DIRS) {
			const nx = x + dx;
			const ny = y + dy;
			if (from && nx === from[0] && ny === from[1]) continue;
			if (at(nx, ny)) return false;
		}
		return true;
	};

	/**
	 * A strand drifts in a diagonal heading, laid down as a staircase of short
	 * steps, hooks back on itself, and now and then coils inward.
	 */
	function walk(
		/** @type {number} */ x,
		/** @type {number} */ y,
		/** @type {number[]} */ heading,
		/** @type {number} */ length,
		barbs = true
	) {
		let [hx, hy] = heading;
		let axis = rand() < 0.5 ? 0 : 1;
		let laid = 0;
		/** @type {number[] | null} */
		let prev = null;
		let sinceHook = 0;
		let coil = 0;
		let spin = 1;

		while (laid < length) {
			const run = coil
				? Math.max(1, Math.round(coil / 2))
				: rand() < 0.07
					? between(4, 7)
					: between(1, 3);
			const dx = axis === 0 ? hx : 0;
			const dy = axis === 0 ? 0 : hy;

			for (let i = 0; i < run; i += 1) {
				if (!free(x, y, prev)) return;
				set(x, y);
				prev = [x, y];
				laid += 1;

				if (barbs && rand() < 0.012) {
					walk(x + dy * 2 - dx, y + dx * 2 - dy, [-hx, -hy], between(4, 9), false);
				}

				if (!free(x + dx, y + dy, prev)) break;
				x += dx;
				y += dy;
			}

			axis = 1 - axis;

			if (coil) {
				[hx, hy] = spin > 0 ? [hy, -hx] : [-hy, hx];
				coil -= 1;
				continue;
			}

			sinceHook += 1;
			if (sinceHook > between(3, 8)) {
				if (rand() < 0.16) {
					coil = between(7, 13);
					spin = rand() < 0.5 ? 1 : -1;
				} else if (rand() < 0.5) hx = -hx;
				else hy = -hy;
				sinceHook = 0;
			}
		}
	}

	// Cluster the starts rather than spreading them evenly.
	for (let i = 0; i < STRANDS; i += 1) {
		const cx = between(0, COLS - 1);
		const cy = between(0, ROWS - 1);
		walk(
			cx + between(-10, 10),
			cy + between(-10, 10),
			[rand() < 0.5 ? 1 : -1, rand() < 0.5 ? 1 : -1],
			between(MIN_LEN, MAX_LEN)
		);
	}

	// Merge horizontal runs so the file stays small.
	const rects = [];
	for (let y = 0; y < ROWS; y += 1) {
		let x = 0;
		while (x < COLS) {
			if (!grid[y * COLS + x]) {
				x += 1;
				continue;
			}
			let w = 1;
			while (x + w < COLS && grid[y * COLS + x + w]) w += 1;
			rects.push(
				`<rect x="${xs[x]}" y="${y * ROW}" width="${xs[x + w] - xs[x]}" height="${ROW}"/>`
			);
			x += w;
		}
	}

	const height = ROWS * ROW;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" shape-rendering="crispEdges"><g fill="${INK}">${rects.join('')}</g></svg>`;

	return { svg, width: WIDTH, height };
}

/**
 * The card's edge, built from the same grid as the strands: rows ten pixels
 * high, columns six to eighteen wide, and the same staircase step of one cell
 * at a time. It stays a rectangle; only the last cell or two of each edge
 * moves, so the border reads as drawn with the same hand as the background.
 *
 * Positions run in px from each corner, where they land on the grid whatever
 * the card measures, and in percentages across the middle.
 *
 * @param {number} seed
 * @returns {string} a CSS polygon() for clip-path
 */
export function makeEdge(seed) {
	let a = seed >>> 0 || 1;
	const rand = () => {
		a ^= a << 13;
		a >>>= 0;
		a ^= a >> 17;
		a ^= a << 5;
		a >>>= 0;
		return a / 4294967296;
	};
	const pick = (/** @type {any[]} */ arr) => arr[Math.floor(rand() * arr.length)];

	/**
	 * One edge, as offsets along it paired with the inset at that offset.
	 * Every run is axis-aligned: a long run at one inset, a vertical hop of one
	 * cell, another long run. It starts and ends at the baseline inset, so the
	 * straight middle of the edge and the next corner both meet it flat.
	 */
	const stair = (/** @type {number} */ limit, /** @type {number[]} */ cells) => {
		/** @type {[number, number][]} */
		const out = [];
		let at = 0;
		let depth = 1;
		const run = (/** @type {number} */ w, /** @type {number} */ d) => {
			out.push([at, d * ROW]);
			at += w;
			out.push([at, d * ROW]);
		};
		while (at < limit) {
			// Long runs between the steps: a few wide teeth, not a comb.
			run(pick(cells) * pick([2, 3, 3, 4, 5, 7]), depth);
			// One cell at a time, never two: the edge is nibbled, not castellated.
			depth = Math.min(2, Math.max(0, depth + pick([-1, 0, 0, 1])));
		}
		out.push([at, ROW]);
		return out;
	};

	const H = 280; // px of staircase at each end of the horizontal edges
	const V = 300; // and of the vertical ones
	const h = () => stair(H, COLW);
	const v = () => stair(V, [ROW, ROW * 2]);

	// Every edge is laid from its corner inward, and every corner sits at the
	// baseline inset on both axes, so no two points are joined by a diagonal.
	const pts = [];
	for (const [x, d] of h()) pts.push(`${ROW + x}px ${d}px`);
	pts.push(`50% ${ROW}px`);
	for (const [x, d] of h().reverse()) pts.push(`calc(100% - ${ROW + x}px) ${d}px`);

	for (const [y, d] of v()) pts.push(`calc(100% - ${d}px) ${ROW + y}px`);
	pts.push(`calc(100% - ${ROW}px) 50%`);
	for (const [y, d] of v().reverse())
		pts.push(`calc(100% - ${d}px) calc(100% - ${ROW + y}px)`);

	for (const [x, d] of h()) pts.push(`calc(100% - ${ROW + x}px) calc(100% - ${d}px)`);
	pts.push(`50% calc(100% - ${ROW}px)`);
	for (const [x, d] of h().reverse()) pts.push(`${ROW + x}px calc(100% - ${d}px)`);

	for (const [y, d] of v()) pts.push(`${d}px calc(100% - ${ROW + y}px)`);
	pts.push(`${ROW}px 50%`);
	for (const [y, d] of v().reverse()) pts.push(`${d}px ${ROW + y}px`);

	return `polygon(${pts.join(',')})`;
}

const CRUMB_W = 240; // the corner patch the crumbs are drawn in
const CRUMB_H = 170;

/**
 * The blocks a pixel edge would have been anti-aliased with, left visible:
 * loose cells of the border's ink scattered just inside a corner of the sheet,
 * thinning out as they go inward.
 *
 * Returns the four corner patches as a ready background shorthand, since each
 * corner is the same patch mirrored.
 *
 * @param {number} seed
 * @param {string} ink
 */
export function makeCrumbs(seed, ink = '#0b1412') {
	let a = seed >>> 0 || 1;
	const rand = () => {
		a ^= a << 13;
		a >>>= 0;
		a ^= a >> 17;
		a ^= a << 5;
		a >>>= 0;
		return a / 4294967296;
	};
	const pick = (/** @type {any[]} */ arr) => arr[Math.floor(rand() * arr.length)];

	const REACH = 3; // cells: how far from the edge a crumb can land
	const rects = [];
	for (let y = 0; y < CRUMB_H; y += ROW) {
		let x = 0;
		while (x < CRUMB_W) {
			const w = pick(COLW);
			// Only along the two edges of the corner, thinning out as they go in.
			const cells = Math.min(x / ROW, y / ROW);
			if (cells < REACH && rand() < 0.3 * (1 - cells / REACH)) {
				rects.push(`<rect x="${x}" y="${y}" width="${w}" height="${ROW}"/>`);
			}
			x += w;
		}
	}

	/** The same patch, mirrored into each corner. */
	const corner = (/** @type {string} */ flip) => {
		const svg =
			`<svg xmlns="http://www.w3.org/2000/svg" width="${CRUMB_W}" height="${CRUMB_H}" ` +
			`viewBox="0 0 ${CRUMB_W} ${CRUMB_H}" shape-rendering="crispEdges">` +
			`<g fill="${ink}" transform="${flip}">${rects.join('')}</g></svg>`;
		return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
	};

	return {
		image: [
			corner('translate(0,0)'),
			corner(`translate(${CRUMB_W},0) scale(-1,1)`),
			corner(`translate(0,${CRUMB_H}) scale(1,-1)`),
			corner(`translate(${CRUMB_W},${CRUMB_H}) scale(-1,-1)`)
		].join(','),
		position: '0 0,100% 0,0 100%,100% 100%',
		size: `${CRUMB_W}px ${CRUMB_H}px`
	};
}
