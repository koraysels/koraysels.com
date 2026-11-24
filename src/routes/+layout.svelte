<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { cursors, idles } from '#lib/cursor.js';
	import { THEMES, ORDER, current } from '#lib/theme.js';

	let { children } = $props();

	// Built once at prerender, so the inks and the pointer are printed from the
	// first frame, whichever set the visitor last chose.
	const style =
		'<style>' +
		ORDER.map((name) => {
			const inks = THEMES[name];
			const { arrow, hand } = cursors(inks);
			const sel = name === 'riso' ? ':root' : `:root[data-theme="${name}"]`;
			return `${sel}{--blue:${inks.blue};--pink:${inks.pink};--cursor-arrow:${arrow};--cursor-hand:${hand}}`;
		}).join('') +
		'</style>';

	// Leave the mouse alone for a few seconds and the pointer spells the name
	// in Wingdings, a glyph a beat, with a beat of the plain arrow between
	// rounds, until it moves again.
	onMount(() => {
		if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let set = idles(THEMES[current()]);
		const root = document.documentElement;
		let step = -1;
		let wait = 0;
		let beat = 0;
		const next = () => {
			step = (step + 1) % (set.length + 1);
			if (step === set.length) {
				delete root.dataset.idle;
				return;
			}
			root.style.setProperty('--cursor-idle', set[step]);
			root.dataset.idle = '';
		};
		const wake = () => {
			clearTimeout(wait);
			clearInterval(beat);
			delete root.dataset.idle;
			step = -1;
			wait = window.setTimeout(() => {
				next();
				beat = window.setInterval(next, 900);
			}, 4000);
		};
		const reprint = () => {
			set = idles(THEMES[current()]);
		};
		addEventListener('pointermove', wake, { passive: true });
		addEventListener('pointerdown', wake, { passive: true });
		addEventListener('themechange', reprint);
		wake();
		return () => {
			removeEventListener('themechange', reprint);
			clearTimeout(wait);
			clearInterval(beat);
			removeEventListener('pointermove', wake);
			removeEventListener('pointerdown', wake);
		};
	});
</script>

<svelte:head>
	{@html style}
</svelte:head>

{@render children()}
