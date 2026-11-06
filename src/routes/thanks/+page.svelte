<script lang="ts">
	import { profile } from '#lib/data';
</script>

<svelte:head>
	<title>Thanks, Koray Sels</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="frame">
	<main class="sheet">
	<p class="mark">{profile.company}</p>
	<h1>Thanks.</h1>
	<p>Your message arrived. I read everything and answer within a few days.</p>
	<p><a href="/">Back</a></p>
	</main>
</div>

<style>
	.sheet {
		background: var(--bg);
		padding: clamp(1.75rem, 5vw, 4rem);
		display: grid;
		gap: 1.25rem;
	}

	.mark {
		font-size: var(--step-small);
		color: var(--muted);
		margin-bottom: 1.5rem;
	}

	h1 {
		font-size: var(--step-head);
	}
</style>
