/**
 * The page's ink sets. Each is two spot inks on white stock: the first (the
 * blue pass, from the first set) carries every word, so it holds 4.5:1 on
 * white; the second (the pink pass) only overprints.
 */
export const THEMES = /** @type {const} */ ({
	riso: { blue: '#3255a4', pink: '#ff48b0' },
	// cobalt and vermilion, after the Seibu Theater posters
	seibu: { blue: '#2450b4', pink: '#e2342b' },
	// green and hot pink, after the PP Mori specimen
	mori: { blue: '#147a39', pink: '#ff3c74' }
});

/** @typedef {keyof typeof THEMES} Theme */

export const ORDER = /** @type {Theme[]} */ (Object.keys(THEMES));

/** @returns {Theme} */
export function current() {
	const t = document.documentElement.dataset.theme;
	return t && t in THEMES ? /** @type {Theme} */ (t) : 'riso';
}

/** Switch inks, remember the choice, and tell the page so it can reprint. */
export function setTheme(/** @type {Theme} */ theme) {
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem('theme', theme);
	} catch {}
	dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

/** Hex to [r, g, b]. */
export function rgb(/** @type {string} */ hex) {
	return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}
