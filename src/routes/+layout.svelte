<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { cursors, idles } from '#lib/cursor.js';

	let { children } = $props();

	// Built once at prerender, so the pointer is printed from the first frame.
	const { arrow, hand } = cursors({ blue: '#3255a4', pink: '#ff48b0', paper: '#ffffff' });
	const style = `<style>:root{--cursor-arrow:${arrow};--cursor-hand:${hand}}</style>`;

	// Leave the mouse alone for a few seconds and the pointer spells the name
	// in Wingdings, a glyph a beat, with a beat of the plain arrow between
	// rounds, until it moves again.
	onMount(() => {
		if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const set = idles({ blue: '#3255a4', pink: '#ff48b0' });
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
		addEventListener('pointermove', wake, { passive: true });
		addEventListener('pointerdown', wake, { passive: true });
		wake();
		return () => {
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
