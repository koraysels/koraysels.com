/**
 * The mouse pointer, printed like the rest of the page: a pixel bitmap in two
 * passes, pink set a knot off the blue, with its inside in a dotted dither.
 *
 * Bitmaps: X is outline. The inside is whatever the outside cannot reach,
 * or, in a traced glyph, the cells marked o.
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

/*
 * "Koray Sels" typed in Wingdings, traced from the system font one glyph at a
 * time: X is outline, o is the glyph's solid inside, . is paper. Shown in
 * order while the mouse rests, each with its hotspot in the middle.
 */
const IDLE = /** @type {[string[], [number, number]][]} */ ([
	[
		// K: neutral face
		[
			'....................',
			'.......XXXXXX.......',
			'.....XXXXXXXXXX.....',
			'....XX........XXX...',
			'...XX..........XX...',
			'..XX............XX..',
			'..X...XXX...XX...XX.',
			'.XX...XoX..XooX..XX.',
			'.XX...XX....XX....X.',
			'.X................X.',
			'.X................X.',
			'.XX...............X.',
			'.XX..XXXXXXXXXX..XX.',
			'.XX..............XX.',
			'..XX............XX..',
			'...XX...........XX..',
			'...XXX........XXX...',
			'.....XXX....XXXX....',
			'......XXXXXXXX......',
			'....................'
		],
		[10, 10]
	],
	[
		// o: hollow square
		[
			'....................',
			'.XXXXXXXXXXXXXXXXX..',
			'.XooooooooooooooooX.',
			'.XooXXXXXXXXXXXXooX.',
			'.XoX............XoX.',
			'.XoX............XoX.',
			'.XoX............XoX.',
			'.XoX............XoX.',
			'.XoX............XoX.',
			'.XoX............XoX.',
			'.XoX............XoX.',
			'.XoX............XoX.',
			'.XoX............XoX.',
			'.XoX............XoX.',
			'.XoX............XoX.',
			'.XoX............XoX.',
			'.XooXXXXXXXXXXXXooX.',
			'.XooooooooooooooooX.',
			'.XXXXXXXXXXXXXXXXXX.',
			'....................'
		],
		[10, 10]
	],
	[
		// r: shadowed square
		[
			'....................',
			'...XXXXXXXXXXXXXXX..',
			'..XoooooooooooooooX.',
			'.XooooooooooooooooX.',
			'.XoXXXXXXXXXXXXoooX.',
			'.XX............XooX.',
			'.XX............XooX.',
			'.XX............XooX.',
			'.XX............XooX.',
			'.XX............XooX.',
			'.XX............XooX.',
			'.XX............XooX.',
			'.XX............XooX.',
			'.XX............XooX.',
			'.XX............XooX.',
			'.XX............XooX.',
			'.XX............XooX.',
			'.XX............XoX..',
			'.XXXXXXXXXXXXXXXX...',
			'....................'
		],
		[10, 10]
	],
	[
		// a: cancer
		[
			'........................',
			'............XXX.........',
			'.......XXXXXXooXXXXX....',
			'....XXXoXXXX.XXXXXXoXXX.',
			'...XXXXX...........XXXX.',
			'..XX...XX.............X.',
			'.XX.....XX..............',
			'.XX.....XX..............',
			'.X......XX......XXXXX...',
			'.XX.....XX.....XX...XX..',
			'.XoX...XX.....XX.....XX.',
			'..XXXXXXX.....XX......X.',
			'....XXX.......XX......X.',
			'..............XX.....XX.',
			'...............XX....XX.',
			'.XXX............XXXXXX..',
			'.XXoXXXX.......XoooXX...',
			'...XXXooXXXXXXXoXXX.....',
			'......XXXXXXXXXX........',
			'........................'
		],
		[12, 10]
	],
	[
		// y: boxed star
		[
			'........................',
			'.XXXXXXXXXXXXXXXXXXXXXX.',
			'.XooXXXXXXXXXXXXXXXXooX.',
			'.XoX................XoX.',
			'.XX..................XX.',
			'.XX........XX........XX.',
			'.XX.......XooX.......XX.',
			'.XX......XoXXoX......XX.',
			'.XX.....XoX..XoX.....XX.',
			'.XX....XoX....XoX....XX.',
			'.XX...XoX......XoX...XX.',
			'.XX..XoX........XoX..XX.',
			'.XX.XoX..........XoX.XX.',
			'.XX..X............X..XX.',
			'.XX..................XX.',
			'.XX..................XX.',
			'.XX..................XX.',
			'.XoXXXXXXXXXXXXXXXXXXoX.',
			'.XXXXXXXXXXXXXXXXXXXXXX.',
			'........................'
		],
		[12, 10]
	],
	[
		// S: droplet
		[
			'..............',
			'.......X......',
			'......XX......',
			'......XX......',
			'.....XooX.....',
			'.....XooX.....',
			'....XooooX....',
			'...XooooooX...',
			'..XooooooooX..',
			'..XooooooooX..',
			'.XooooooooooX.',
			'.XooooooooooX.',
			'.XooooooooooX.',
			'.XooooooooooX.',
			'..XoooooooooX.',
			'..XooooooooX..',
			'...XXoooooX...',
			'.....XXXXX....',
			'..............'
		],
		[7, 9]
	],
	[
		// e: virgo
		[
			'......................',
			'.XX...XX...XX.........',
			'.XX..XooX.XooX........',
			'..XX.XXoX.XXoX........',
			'..XoXX.XoXX.XX........',
			'..XoX..XoX..XoX.......',
			'..XoX..XoX..XoX.......',
			'..XX...XoX..XoX.......',
			'..XX...XX...XoX.......',
			'..XX...XX...XoX.......',
			'..XX...XX...XoX.......',
			'..XX...XX...XoX.......',
			'..XX...XX...XoX.......',
			'..XX...XX...XoX.......',
			'..XX...XX...XoX.......',
			'..XX...XX...XoX.......',
			'..XX...XX...XoX.......',
			'..XX...XX....XX.......',
			'..XX...XX....XX.......',
			'.............XX...XX..',
			'.............XoXXXooX.',
			'..............XXXXooX.',
			'..................XX..',
			'......................'
		],
		[11, 12]
	],
	[
		// l: circle
		[
			'................',
			'......XXXX......',
			'....XXooooXX....',
			'...XooooooooX...',
			'..XooooooooooX..',
			'.XooooooooooooX.',
			'.XooooooooooooX.',
			'.XooooooooooooX.',
			'.XooooooooooooX.',
			'.XooooooooooooX.',
			'.XooooooooooooX.',
			'..XooooooooooX..',
			'..XooooooooooX..',
			'...XXooooooXX...',
			'.....XXXXXX.....',
			'................'
		],
		[8, 8]
	],
	[
		// s: diamond
		[
			'........',
			'...XX...',
			'..XooX..',
			'.XooooX.',
			'.XooooX.',
			'.XooooX.',
			'.XooooX.',
			'..XooX..',
			'...XX...',
			'...XX...',
			'........'
		],
		[4, 5]
	]
]);

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
	// a traced glyph marks its own inside; a drawn bitmap is filled where the
	// outside cannot reach
	const fill = rows.some((row) => row.includes('o'))
		? (/** @type {number} */ x, /** @type {number} */ y) => rows[y][x] === 'o'
		: inside(rows);
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

/**
 * The idle set, in spelling order, as cursor values in the same two passes as the arrow.
 * @param {{ blue: string, pink: string }} inks
 */
export function idles(inks) {
	return IDLE.map(([rows, hotspot]) => cursor(rows, hotspot, { blue: inks.blue, pink: inks.pink }));
}
