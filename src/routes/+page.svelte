<script lang="ts">
	import { profile, work } from '#lib/data';
	import { pile } from '#lib/pile';

</script>

<svelte:head>
	<title>Koray Sels, cursor: pointer;</title>
	<meta name="description" content="{profile.name}. {profile.line} {profile.city}." />
</svelte:head>

<div class="frame">
	<main class="sheet">
	<p class="mark">{profile.company}</p>

	<header>
		<h1>{profile.name}</h1>
		<p class="line">{profile.line}</p>
		<p class="role">{profile.role}</p>
	</header>

	<section>
		<h2>Earlier work</h2>
		<p class="names">
			{#each work as item, i (item.name)}{#if item.href}<a href={item.href}>{item.name}</a
					>{:else}{item.name}{/if}{#if i < work.length - 1}{', '}{/if}{/each}.
		</p>
	</section>

	{#if pile.length}
		<section>
			<h2>The pile</h2>
			<div class="pile">
				{#each pile as item, i (i)}
					{#if item.kind === 'image'}
						<figure>
							<img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
							<figcaption>{item.caption}</figcaption>
						</figure>
					{:else if item.kind === 'video'}
						<figure>
							<video
								src={item.src}
								poster={item.poster}
								muted
								loop
								playsinline
								autoplay
								aria-label={item.caption}
							></video>
							<figcaption>{item.caption}</figcaption>
						</figure>
					{:else}
						<p><a href={item.href}>{item.title}</a></p>
					{/if}
				{/each}
			</div>
		</section>
	{/if}

	<section>
		<details class="contact">
			<summary>Get in touch</summary>
			<form
			name="contact"
			method="POST"
			action="/thanks"
			data-netlify="true"
			netlify-honeypot="bot-field"
		>
			<input type="hidden" name="form-name" value="contact" />
			<p class="hp">
				<label>Leave this empty <input name="bot-field" tabindex="-1" /></label>
			</p>

			<label for="name">Name</label>
			<input id="name" name="name" type="text" required autocomplete="name" />

			<label for="email">Email</label>
			<input id="email" name="email" type="email" required autocomplete="email" />

			<label for="message">Message</label>
			<textarea id="message" name="message" rows="5" required></textarea>

				<button type="submit">Send</button>
			</form>
		</details>
	</section>

	<footer>
		<p>
			{profile.company}<br />
			{profile.city}<br />
			VAT {profile.vat}<br />
			<a href="mailto:{profile.email}">{profile.email}</a>
		</p>
		<p>
			{#each profile.socials as social, i (social.href)}<a href={social.href} rel="me"
					>{social.label}</a
				>{#if i < profile.socials.length - 1}{', '}{/if}{/each}
		</p>
	</footer>
	</main>
</div>

<style>
	.sheet {
		/* The blocks the edge would have been anti-aliased with, left visible. */
		background:
			var(--crumbs) var(--bg);
		background-position: var(--crumbs-at);
		background-size: var(--crumbs-size);
		background-repeat: no-repeat;
		padding: clamp(1.1rem, 2.4vw, 1.6rem) clamp(1.75rem, 5vw, 4rem) clamp(1.75rem, 5vw, 4rem);
		display: grid;
		gap: clamp(2.5rem, 5vw, 4rem);
	}

	.mark {
		font-size: var(--step-small);
		color: var(--muted);
		margin-bottom: calc(-1 * clamp(1.6rem, 3.4vw, 2.8rem));
	}

	h1 {
		font-size: var(--title);
		letter-spacing: 0;
		line-height: 1.25;
		color: var(--ink-display);
		-webkit-text-stroke: var(--title-stroke) var(--ink-outline);
		paint-order: stroke fill;
		margin-bottom: 1.1rem;
	}

	.line {
		max-width: 34ch;
	}

	.role {
		margin-top: 0.5rem;
		max-width: 34ch;
		color: var(--muted);
	}

	h2 {
		font-size: var(--step-small);
		font-weight: 600;
		letter-spacing: 0;
		line-height: 1.5;
		color: var(--accent);
		margin-bottom: 0.9rem;
	}

	.names {
		line-height: 1.6;
	}

	.names a {
		text-decoration-color: #b9bdc9;
	}

	.pile {
		columns: 2;
		column-gap: 1.25rem;
	}

	.pile > * {
		break-inside: avoid;
		margin-bottom: 1.25rem;
	}

	figcaption {
		font-size: var(--step-small);
		color: var(--muted);
		margin-top: 0.4rem;
	}

	.contact summary {
		list-style: none;
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		font-size: var(--step-body);
		font-weight: 600;
		width: fit-content;
	}

	.contact summary::-webkit-details-marker {
		display: none;
	}

	.contact summary::before {
		content: '+';
		display: inline-block;
		width: 1ch;
		color: var(--muted);
		font-weight: 400;
	}

	.contact[open] summary::before {
		content: '\2013';
	}

	.contact summary:hover {
		color: var(--accent);
	}

	form {
		display: grid;
		gap: 0.35rem;
		max-width: 30rem;
		margin-top: 1.5rem;
	}

	.hp {
		position: absolute;
		left: -9999px;
	}

	label {
		font-size: var(--step-small);
		color: var(--muted);
	}

	label + input,
	label + textarea {
		margin-bottom: 1rem;
	}

	input,
	textarea {
		font: inherit;
		font-size: var(--step-body);
		color: var(--ink);
		background: var(--field);
		border: 0;
		padding: 0.7rem 0.8rem;
		width: 100%;
	}

	textarea {
		resize: vertical;
	}

	input:focus,
	textarea:focus {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}

	button {
		justify-self: start;
		margin-top: 0.5rem;
		font: inherit;
		font-weight: 600;
		border: 0;
		background: var(--ink);
		color: #ffffff;
		padding: 0.75rem 1.5rem;
		transition: background 160ms var(--ease);
	}

	button:hover {
		background: var(--accent);
		color: var(--accent-ink);
	}

	footer {
		display: grid;
		gap: 1.25rem;
		font-size: var(--step-small);
		color: var(--muted);
	}

	footer a {
		color: var(--muted);
	}

	footer a:hover {
		color: var(--ink);
	}

	@media (max-width: 620px) {
		.pile {
			columns: 1;
		}
	}
</style>
