/**
 * Computer carpet: the confetti of shapes on cinema, bowling-alley and arcade
 * floors, laid out by a program rather than drawn.
 *
 * Rules:
 *   - a 14 x 10 grid of cells on a tile that repeats without a seam
 *   - each cell holds one primitive or nothing: zigzag, ring, disc, triangle,
 *     squiggle, dot grid, cross, half-disc, diamond, bar
 *   - rotations snap to 15 degrees; strokes are one weight, cut square
 *   - printed as two riso passes, one per ink, so the pink pass carries a
 *     halftone ground and the odd shape lands in both inks to overprint
 *
 * The pink pass comes back with its own misregistration, the few pixels a
 * real riso drum drifts between passes.
 */

const CELL = 60;
const COLS = 14;
const ROWS = 10;
const TW = CELL * COLS; // tile width, wider than most screens see at once
const TH = CELL * ROWS;
const W = 7; // stroke weight

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
	ring: (/** @type {number} */ h) =>
		`<circle r="${h * 0.62}" fill="none" stroke-width="${W}"/>`,
	disc: (/** @type {number} */ h) => `<circle r="${h * 0.42}"/>`,
	tri: (/** @type {number} */ h) =>
		`<polygon points="${pts([0, -h, h * 0.87, h * 0.5, -h * 0.87, h * 0.5])}"/>`,
	squig: (/** @type {number} */ h) =>
		`<path fill="none" stroke-width="${W}" d="M${-h},0q${h / 4},${-h * 0.7} ${h / 2},0t${h / 2},0t${h / 2},0t${h / 2},0"/>`,
	dots: (/** @type {number} */ h) => {
		const g = [-h * 0.6, 0, h * 0.6];
		return g.flatMap((x) => g.map((y) => `<circle cx="${x}" cy="${y}" r="3.6"/>`)).join('');
	},
	cross: (/** @type {number} */ h) =>
		`<path fill="none" stroke-width="${W}" d="M${-h * 0.8},0H${h * 0.8}M0,${-h * 0.8}V${h * 0.8}"/>`,
	half: (/** @type {number} */ h) => `<path d="M${-h},${h * 0.3}A${h},${h} 0 0 1 ${h},${h * 0.3}Z"/>`,
	diamond: (/** @type {number} */ h) =>
		`<rect x="${-h * 0.5}" y="${-h * 0.5}" width="${h}" height="${h}" fill="none" stroke-width="${W}" transform="rotate(45)"/>`,
	bar: (/** @type {number} */ h) =>
		`<rect x="${-h}" y="${-W * 0.8}" width="${h * 2}" height="${W * 1.6}"/>`
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

	// A carpet repeats a handful of shapes, not all of them.
	const palette = NAMES.slice()
		.sort(() => rand() - 0.5)
		.slice(0, 5 + Math.floor(rand() * 3));

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
			const turn = Math.floor(rand() * 24) * 15;

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
