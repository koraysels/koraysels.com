/**
 * Generates static/pattern.svg: a tileable field of pixelated tangled strands.
 *
 *   node scripts/pattern.mjs [seed]
 *
 * Rules taken from the reference posters:
 *   - everything sits on a square-cell grid, axis-aligned only; a curve is a staircase
 *   - a strand is exactly one cell wide, always
 *   - strands meander: short straight runs, then a right-angle turn, hooking back on
 *     themselves without crossing
 *   - ends are blunt, with the odd short barb branching off
 *   - two flat colours, sparse coverage, clustered rather than even
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CELL = 10; // px per cell
const COLS = 120;
const ROWS = 120;
const STRANDS = 13;
const MIN_LEN = 110;
const MAX_LEN = 260;
const INK = '#ccff00';

const seed = Number(process.argv[2] ?? 20261106);

function rng(s) {
	let a = s >>> 0;
	return () => {
		a ^= a << 13;
		a >>>= 0;
		a ^= a >> 17;
		a ^= a << 5;
		a >>>= 0;
		return a / 4294967296;
	};
}

const rand = rng(seed);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

const grid = new Uint8Array(COLS * ROWS);
const at = (x, y) => grid[((y % ROWS) + ROWS) % ROWS * COLS + (((x % COLS) + COLS) % COLS)];
const set = (x, y) => {
	grid[((y % ROWS) + ROWS) % ROWS * COLS + (((x % COLS) + COLS) % COLS)] = 1;
};

const DIRS = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1]
];

/** A cell is free only if its neighbours are too, so strands never touch or cross. */
function free(x, y, from) {
	if (at(x, y)) return false;
	for (const [dx, dy] of DIRS) {
		const nx = x + dx;
		const ny = y + dy;
		if (from && nx === from[0] && ny === from[1]) continue;
		if (at(nx, ny)) return false;
	}
	return true;
}

/**
 * A strand drifts in a diagonal heading, laid down as a staircase of short
 * axis-aligned steps, and hooks back on itself now and then. That staircase
 * drift, not the right angle, is what the reference is made of.
 */
function walk(x, y, heading, length, barbs = true) {
	let [hx, hy] = heading;
	let axis = rand() < 0.5 ? 0 : 1;
	let laid = 0;
	let prev = null;
	let sinceHook = 0;
	let coil = 0; // segments left of coiling inward
	let spin = 1; // which way the coil turns

	while (laid < length) {
		// mostly one to three cells, with the odd longer sweep
		// one to three cells is the staircase; a longer sweep is the exception
		const run = coil ? Math.max(1, Math.round(coil / 2)) : rand() < 0.07 ? between(4, 7) : between(1, 3);
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
			// keep turning the same way, with a shorter run each time: a coil
			[hx, hy] = spin > 0 ? [hy, -hx] : [-hy, hx];
			coil -= 1;
			continue;
		}

		sinceHook += 1;

		// hook: flip one component so the strand turns back towards itself
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
	const count = between(1, 2);
	for (let k = 0; k < count; k += 1) {
		walk(
			cx + between(-10, 10),
			cy + between(-10, 10),
			[rand() < 0.5 ? 1 : -1, rand() < 0.5 ? 1 : -1],
			between(MIN_LEN, MAX_LEN)
		);
	}
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
		rects.push(`<rect x="${x * CELL}" y="${y * CELL}" width="${w * CELL}" height="${CELL}"/>`);
		x += w;
	}
}

const filled = grid.reduce((n, v) => n + v, 0);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * CELL}" height="${ROWS * CELL}" viewBox="0 0 ${COLS * CELL} ${ROWS * CELL}" shape-rendering="crispEdges">
<g fill="${INK}">
${rects.join('\n')}
</g>
</svg>
`;

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../static/pattern.svg');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, svg);
console.log(
	`seed ${seed} · ${rects.length} rects · ${filled} cells · ${((filled / (COLS * ROWS)) * 100).toFixed(1)}% coverage · ${out}`
);
