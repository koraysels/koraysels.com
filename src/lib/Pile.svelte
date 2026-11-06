<script lang="ts">
	import { pile } from './pile';

	function host(href: string) {
		return href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
	}
</script>

<div class="grid">
	{#each pile as item, i (i)}
		<div class="item" data-rise style="--delay:{(i % 3) * 70}ms">
			{#if item.kind === 'image'}
				<figure>
					{#if item.href}
						<a href={item.href} class="media">
							<img
								src={item.src}
								alt={item.alt}
								width="1200"
								height="900"
								loading="lazy"
								decoding="async"
							/>
						</a>
					{:else}
						<span class="media">
							<img
								src={item.src}
								alt={item.alt}
								width="1200"
								height="900"
								loading="lazy"
								decoding="async"
							/>
						</span>
					{/if}
					<figcaption>{item.caption}</figcaption>
				</figure>
			{:else if item.kind === 'video'}
				<figure>
					<span class="media">
						<video
							src={item.src}
							poster={item.poster}
							muted
							loop
							playsinline
							autoplay
							aria-label={item.caption}
						></video>
					</span>
					<figcaption>{item.caption}</figcaption>
				</figure>
			{:else}
				<a class="card" href={item.href}>
					<span class="card-title">{item.title}</span>
					<span class="card-note">{item.note}</span>
					<span class="card-host">{host(item.href)}</span>
				</a>
			{/if}
		</div>
	{/each}
</div>

<style>
	.grid {
		columns: 3;
		column-gap: clamp(1rem, 1.6vw, 2rem);
	}

	.item {
		break-inside: avoid;
		margin-bottom: clamp(1rem, 1.6vw, 2rem);
	}

	figure {
		display: grid;
		gap: 0.6rem;
	}

	.media {
		display: block;
		overflow: hidden;
		background: var(--field-2);
	}

	.media img,
	.media video {
		width: 100%;
		height: auto;
		transition: transform 600ms var(--ease);
	}

	a.media:hover img {
		transform: scale(1.03);
	}

	figcaption {
		font-size: var(--step-small);
		color: var(--muted);
	}

	.card {
		display: grid;
		gap: 0.75rem;
		padding: clamp(1.25rem, 1.8vw, 2rem);
		background: var(--field-2);
		color: var(--field-2-ink);
		text-decoration: none;
		transition:
			background 220ms var(--ease),
			color 220ms var(--ease),
			transform 220ms var(--ease);
	}

	.card:hover,
	.card:focus-visible {
		background: var(--ink);
		color: #ffffff;
		transform: translateY(-3px);
	}

	.card-title {
		font-size: var(--step-lead);
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	.card-note {
		font-size: var(--step-body);
	}

	.card-host {
		font-size: var(--step-small);
		opacity: 0.7;
	}

	@media (max-width: 999px) {
		.grid {
			columns: 2;
		}
	}

	@media (max-width: 620px) {
		.grid {
			columns: 1;
		}
	}
</style>
