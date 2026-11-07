/**
 * Computer carpet: the confetti of shapes on cinema, bowling-alley and arcade
 * floors, laid out by a program rather than drawn.
 *
 * Rules:
 *   - a 14 x 10 grid of cells on a tile that repeats without a seam
 *   - each cell holds one primitive or nothing. Zigzag and dot grid are
 *     always in; the rest come from plotter and print-shop graphics:
 *     hatching, registration marks, rules, staircases, nested arcs,
 *     wireframe grids, barcodes, slashes
 *   - rotations snap to 45 degrees; strokes come in two weights, cut square
 *   - printed as two passes, one per ink, so the pink pass carries a
 *     halftone ground and the odd shape lands in both inks to overprint
 *
 * The pink pass comes back with its own misregistration, the few pixels a
 * print drum drifts between passes.
 */

const CELL = 60;
const COLS = 14;
const ROWS = 10;
const TW = CELL * COLS; // tile width, wider than most screens see at once
const TH = CELL * ROWS;
const W = 7; // heavy stroke
const T = 2.5; // hairline, for the technical marks

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

const pts = (/** @type {number[]} */ xs) => {
	const out = [];
	for (let i = 0; i < xs.length; i += 2) out.push(`${xs[i]},${xs[i + 1]}`);
	return out.join(' ');
};

/** Each primitive is drawn around 0,0 with half-size h. */
const MOTIFS = {
	zig: (/** @type {number} */ h) =>
		`<polyline fill="none" stroke-width="${W}" points="${pts([-h, -h / 3, -h / 2, h / 3, 0, -h / 3, h / 2, h / 3, h, -h / 3])}"/>`,
	dots: (/** @type {number} */ h) => {
		const g = [-h * 0.6, 0, h * 0.6];
		return g.flatMap((x) => g.map((y) => `<circle cx="${x}" cy="${y}" r="3.6"/>`)).join('');
	},
	// a square of diagonal hatching, as a plotter fills an area
	hatch: (/** @type {number} */ h) => {
		let d = '';
		for (let c = -2 * h + h / 3; c < 2 * h; c += h / 3) {
			const x1 = Math.max(-h, c - h);
			const x2 = Math.min(h, c + h);
			d += `M${x1.toFixed(1)},${(c - x1).toFixed(1)}L${x2.toFixed(1)},${(c - x2).toFixed(1)}`;
		}
		return `<path fill="none" stroke-width="${T}" d="${d}"/>`;
	},
	// the crosshair printers trim and register by
	register: (/** @type {number} */ h) =>
		`<circle r="${h * 0.5}" fill="none" stroke-width="${T}"/>` +
		`<path fill="none" stroke-width="${T}" d="M${-h},0H${h}M0,${-h}V${h}"/>`,
	rules: (/** @type {number} */ h) =>
		[-0.6, -0.2, 0.2, 0.6]
			.map((k) => `<rect x="${-h}" y="${(h * k - T / 2).toFixed(1)}" width="${h * 2}" height="${T}"/>`)
			.join(''),
	stairs: (/** @type {number} */ h) => {
		const s = h / 2;
		return `<polyline fill="none" stroke-width="${W}" points="${pts([-h, h, -h, h - s, -h + s, h - s, -h + s, 0, 0, 0, 0, -s, s, -s, s, -h, h, -h])}"/>`;
	},
	// quarter circles nested in a corner
	arcs: (/** @type {number} */ h) =>
		[0.5, 1.1, 1.7]
			.map((k) => {
				const r = h * k;
				return `<path fill="none" stroke-width="${T}" d="M${(-h + r).toFixed(1)},${h}A${r.toFixed(1)},${r.toFixed(1)} 0 0 0 ${-h},${(h - r).toFixed(1)}"/>`;
			})
			.join(''),
	// a 3 x 3 wireframe grid
	wire: (/** @type {number} */ h) => {
		const g = [-h, -h / 3, h / 3, h];
		const d = g.map((k) => `M${k.toFixed(1)},${-h}V${h}M${-h},${k.toFixed(1)}H${h}`).join('');
		return `<path fill="none" stroke-width="${T}" d="${d}"/>`;
	},
	barcode: (/** @type {number} */ h) => {
		const bars = [2, 6, 2, 3, 8, 2, 4, 2];
		const total = bars.reduce((a, b) => a + b * 1.6, 0);
		let x = -total / 2;
		let out = '';
		bars.forEach((w, i) => {
			if (i % 2 === 0) out += `<rect x="${x.toFixed(1)}" y="${-h * 0.7}" width="${w}" height="${h * 1.4}"/>`;
			x += w * 1.6;
		});
		return out;
	},
	slashes: (/** @type {number} */ h) =>
		[-0.6, -0.2, 0.2, 0.6]
			.map((k) => `<path fill="none" stroke-width="${W * 0.7}" d="M${(h * k - h * 0.25).toFixed(1)},${h * 0.5}L${(h * k + h * 0.25).toFixed(1)},${-h * 0.5}"/>`)
			.join('')
};

const NAMES = /** @type {(keyof typeof MOTIFS)[]} */ (Object.keys(MOTIFS));

/**
 * @param {string} ink
 * @param {string} body
 */
const layer = (ink, body) =>
	`url("data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${TH}" viewBox="0 0 ${TW} ${TH}">` +
			`<g fill="${ink}" stroke="${ink}" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter">${body}</g></svg>`
	)}")`;

/**
 * @param {number} seed
 * @param {{ blue: string, pink: string }} inks
 */
export function makeCarpet(seed, inks) {
	const rand = rng(seed);
	const pick = (/** @type {any[]} */ arr) => arr[Math.floor(rand() * arr.length)];

	// A carpet repeats a handful of shapes, not all of them. Zigzag and dot
	// grid are always among them.
	const palette = [
		'zig',
		'dots',
		...NAMES.filter((n) => n !== 'zig' && n !== 'dots')
			.sort(() => rand() - 0.5)
			.slice(0, 3 + Math.floor(rand() * 3))
	];

	let blue = '';
	// The pink pass carries a light halftone screen as its ground.
	let pink =
		`<defs><pattern id="screen" width="10" height="10" patternUnits="userSpaceOnUse">` +
		`<circle cx="5" cy="5" r="1.2"/></pattern></defs>` +
		`<rect width="${TW}" height="${TH}" fill="url(#screen)" opacity="0.45"/>`;

	for (let row = 0; row < ROWS; row += 1) {
		for (let col = 0; col < COLS; col += 1) {
			if (rand() < 0.22) continue;

			const motif = MOTIFS[pick(palette)];
			const h = CELL * (0.3 + rand() * 0.14);
			const x = col * CELL + CELL / 2 + (rand() - 0.5) * CELL * 0.25;
			const y = row * CELL + CELL / 2 + (rand() - 0.5) * CELL * 0.25;
			const turn = Math.floor(rand() * 8) * 45;

			// Shapes near an edge are drawn again on the far side, so the tile
			// repeats without a seam.
			const xs = [0];
			const ys = [0];
			if (x < CELL) xs.push(TW);
			if (x > TW - CELL) xs.push(-TW);
			if (y < CELL) ys.push(TH);
			if (y > TH - CELL) ys.push(-TH);

			let shape = '';
			for (const dx of xs) {
				for (const dy of ys) {
					shape += `<g transform="translate(${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}) rotate(${turn})">${motif(h)}</g>`;
				}
			}

			const ink = rand();
			if (ink < 0.46) blue += shape;
			else if (ink < 0.86) pink += shape;
			else {
				// In both inks: the misregistration splits it into an overprint.
				blue += shape;
				pink += shape;
			}
		}
	}

	const sign = () => (rand() < 0.5 ? -1 : 1);
	return {
		blue: layer(inks.blue, blue),
		pink: layer(inks.pink, pink),
		size: `${TW}px ${TH}px`,
		shift: {
			x: (sign() * (2 + rand() * 3)).toFixed(1),
			y: (sign() * (1.5 + rand() * 3)).toFixed(1),
			turn: ((rand() - 0.5) * 0.5).toFixed(2)
		}
	};
}
