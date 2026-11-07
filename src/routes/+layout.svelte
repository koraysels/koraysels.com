<script lang="ts">
	import { onMount } from 'svelte';
	import { makeCrumbs, makeEdge, makePattern } from '#lib/pattern.js';
	import '../app.css';

	let { children } = $props();

	// A different field, and a card edge drawn by the same hand, on every visit.
	// Until this runs the page shows the pair written by scripts/pattern.mjs.
	onMount(() => {
		const seed = (Math.random() * 2 ** 32) >>> 0;
		const { svg, width, height } = makePattern(seed);
		const root = document.documentElement;
		root.style.setProperty(
			'--field-image',
			`url("data:image/svg+xml,${encodeURIComponent(svg)}")`
		);
		root.style.setProperty('--tile', `${width}px ${height}px`);
		root.style.setProperty('--torn', makeEdge(seed));

		const crumbs = makeCrumbs(seed);
		root.style.setProperty('--crumbs', crumbs.image);
		root.style.setProperty('--crumbs-at', crumbs.position);
		root.style.setProperty('--crumbs-size', crumbs.size);
	});
</script>

{@render children()}
