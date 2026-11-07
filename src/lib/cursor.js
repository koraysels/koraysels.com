/**
 * The mouse pointer, printed like the rest of the page: a pixel bitmap in two
 * passes, pink set a knot off the blue, with its inside in a dotted dither.
 *
 * Bitmaps: X is outline. The inside is whatever the outside cannot reach.
 */

const ARROW = [
	'X...........',
	'XX..........',
	'X.X.........',
	'X..X........',
	'X...X.......',
	'X....X......',
	'X.....X.....',
	'X......X....',
	'X.......X...',
	'X........X..',
	'X.........X.',
	'X......XXXXX',
	'X...X..X....',
	'X..XX..X....',
	'X.X..X..X...',
	'XX...X..X...',
	'X.....X..X..',
	'......X..X..',
	'.......XX...'
];

const HAND = [
	'.....XX..........',
	'....X..X.........',
	'....X..X.........',
	'....X..X.........',
	'....X..XXX.......',
	'....X..X..XXX....',
	'.XX.X..X..X..XX..',
	'X..XX..X..X..X.X.',
	'X...X........X..X',
	'.X..X...........X',
	'..X.............X',
	'..X............X.',
	'...X...........X.',
	'...X..........X..',
	'....X.........X..',
	'....X........X...',
	'.....XXXXXXXXX...'
];

const CELL = 2; // px per bitmap pixel

/** Cells inside the outline: not outline, and not reachable from outside. */
function inside(/** @type {string[]} */ rows) {
	const h = rows.length;
	const w = rows[0].length;
	const out = Array.from({ length: h }, () => Array(w).fill(false));
	const stack = [];
	for (let x = 0; x < w; x += 1) stack.push([x, 0], [x, h - 1]);
	for (let y = 0; y < h; y += 1) stack.push([0, y], [w - 1, y]);
	while (stack.length) {
		const [x, y] = /** @type {number[]} */ (stack.pop());
		if (x < 0 || y < 0 || x >= w || y >= h || out[y][x] || rows[y][x] === 'X') continue;
		out[y][x] = true;
		stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
	}
	return (/** @type {number} */ x, /** @type {number} */ y) => rows[y][x] !== 'X' && !out[y][x];
}

/**
 * The bitmap as an SVG in the two passes, CELL px per bitmap pixel.
 * @param {string[]} rows
 * @param {{ blue: string, pink: string, paper?: string }} inks
 * @param {number} [size] square canvas side, in bitmap pixels; centres the bitmap
 */
function print(rows, inks, size) {
	const fill = inside(rows);
	const h = rows.length;
	const w = rows[0].length;
	const ox = size ? Math.floor((size - w - 1) / 2) : 0;
	const oy = size ? Math.floor((size - h - 1) / 2) : 0;
	let pink = '';
	let paper = '';
	let blue = '';
	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			const edge = rows[y][x] === 'X';
			const within = fill(x, y);
			if (!edge && !within) continue;
			const r = (/** @type {number} */ dx) =>
				`<rect x="${(x + ox + dx) * CELL}" y="${(y + oy + dx) * CELL}" width="${CELL}" height="${CELL}"/>`;
			// the pink pass, one pixel off: solid on the favicon, outline only on
			// the cursors
			if (edge || inks.paper) pink += r(1);
			// paper under the inside, for the favicon; the cursors leave it out
			// so the page shows through between the dots
			if (within && inks.paper) paper += r(0);
			// the blue pass: solid outline, dotted inside
			if (edge || (x + y) % 2 === 0) blue += r(0);
		}
	}
	const W = (size ?? w + 1) * CELL;
	const H = (size ?? h + 1) * CELL;
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">` +
		`<g fill="${inks.pink}">${pink}</g><g fill="${inks.paper}">${paper}</g><g fill="${inks.blue}">${blue}</g></svg>`
	);
}

/**
 * @param {string[]} rows
 * @param {[number, number]} hotspot in bitmap pixels
 * @param {{ blue: string, pink: string, paper?: string }} inks
 */
function cursor(rows, hotspot, inks) {
	return `url("data:image/svg+xml,${encodeURIComponent(print(rows, inks))}") ${hotspot[0] * CELL} ${hotspot[1] * CELL}`;
}

/**
 * The favicon: the hand, which is to say cursor: pointer.
 * @param {{ blue: string, pink: string, paper: string }} inks
 */
export function favicon(inks) {
	return print(HAND, inks, 18);
}

/** @param {{ blue: string, pink: string, paper: string }} inks */
export function cursors(inks) {
	return {
		arrow: cursor(ARROW, [0, 0], { blue: inks.blue, pink: inks.pink }),
		hand: cursor(HAND, [5, 0], { blue: inks.blue, pink: inks.pink })
	};
}
