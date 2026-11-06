<script lang="ts">
	import { onMount } from 'svelte';
	import { shots } from './data';
	import { stage } from './pointer.svelte';

	let tick = $state(0);

	const active = $derived(
		shots.find((s) => s.id === stage.activeId) ?? shots[tick % shots.length]
	);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const id = setInterval(() => {
			if (!document.hidden && stage.activeId === null) tick += 1;
		}, 5500);
		return () => clearInterval(id);
	});
</script>

<aside class="stage">
	<div class="inner">
		<p class="wordmark">cursor: pointer;</p>

		<div class="frame">
			{#each shots as shot (shot.id)}
				<img
					src={shot.src}
					alt={shot.alt}
					width="1200"
					height="900"
					class:on={shot.id === active.id}
					loading="eager"
					decoding="async"
				/>
			{/each}
		</div>

		<p class="caption">{active.caption}</p>

		<p class="readout">
			<span class="prop">cursor:</span>
			<span class="value">{stage.cursor}</span><span class="prop">;</span>
			<span class="place">Antwerp</span>
		</p>
	</div>
</aside>

<style>
	.stage {
		position: sticky;
		top: 0;
		height: 100svh;
		background: var(--field-1);
		color: var(--field-1-ink);
		overflow: hidden;
	}

	.inner {
		height: 100%;
		display: grid;
		grid-template-rows: auto 1fr auto auto;
		gap: clamp(1rem, 1.6vw, 1.75rem);
		padding: clamp(1.25rem, 2vw, 2.25rem);
	}

	.wordmark {
		font-size: var(--step-body);
		letter-spacing: -0.01em;
	}

	.frame {
		position: relative;
		min-height: 0;
		background: #11141a;
	}

	.frame img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		opacity: 0;
		transition: opacity 1600ms var(--ease);
	}

	.frame img.on {
		opacity: 1;
	}

	.caption {
		font-size: var(--step-small);
		color: #a9afbd;
	}

	.readout {
		display: flex;
		align-items: baseline;
		gap: 0.4ch;
		min-height: 3.5rem;
		padding: 0 clamp(0.75rem, 1.2vw, 1.25rem);
		background: var(--bg);
		color: var(--ink);
		font-size: var(--step-small);
		align-content: center;
		flex-wrap: wrap;
	}

	.readout .prop {
		color: var(--muted);
	}

	.readout .value {
		color: var(--ink);
		font-weight: 600;
		min-width: 7ch;
	}

	.readout .place {
		margin-left: auto;
		color: var(--muted);
	}

	@media (max-width: 999px) {
		.stage {
			height: 46svh;
		}

		.inner {
			padding: var(--gutter);
		}
	}
</style>
