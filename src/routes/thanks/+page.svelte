<script lang="ts">
	import { profile } from '#lib/data';
</script>

<svelte:head>
	<title>Thanks, Koray Sels</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<header class="top">
		<p>{profile.company}</p>
		<p><a href="/">Back</a></p>
	</header>
	<main>
		<h1>Thanks.</h1>
		<p>Your message arrived. I read everything and answer within a few days.</p>
	</main>
</div>

<style>
	.page {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 var(--gutter) var(--gutter);
	}

	.top {
		display: flex;
		justify-content: space-between;
		padding: 16px 0;
		border-bottom: var(--rule) solid var(--ink);
	}

	main {
		display: grid;
		gap: 24px;
		padding-top: 64px;
	}

	h1 {
		font-size: var(--step-lead);
		line-height: 40px;
	}
</style>
