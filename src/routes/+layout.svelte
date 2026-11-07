<script lang="ts">
	import '../app.css';
	import { cursors } from '#lib/cursor.js';

	let { children } = $props();

	// Built once at prerender, so the pointer is printed from the first frame.
	const { arrow, hand } = cursors({ blue: '#3255a4', pink: '#ff48b0', paper: '#ffffff' });
	const style = `<style>:root{--cursor-arrow:${arrow};--cursor-hand:${hand}}</style>`;
</script>

<svelte:head>
	{@html style}
</svelte:head>

{@render children()}
