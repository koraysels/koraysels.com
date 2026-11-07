<script lang="ts">
	import { onMount } from 'svelte';
	import { profile, work } from '#lib/data';
	import { pile } from '#lib/pile';
	import { makeCarpet } from '#lib/carpet.js';

	const inks = { blue: '#3255a4', pink: '#ff48b0' };

	// The prerendered page prints this carpet; every visit then prints its own.
	let seed = $state(19960612);
	let live = $state(false);
	const carpet = $derived(makeCarpet(seed, inks));

	function reprint() {
		seed = (Math.random() * 2 ** 32) >>> 0;
	}

	onMount(() => {
		reprint();
		live = true;
	});

	// Satu Suro has no alternates: its lowercase is a copy of its caps, so the two
	// S's in the name come out identical. Nudge every letter a little instead.
	function wobble(char: string, i: number) {
		const seed = char.charCodeAt(0) * 31 + i * 17;
		const pick = (n: number, span: number) => (((seed * (n + 3)) % 997) / 997) * span - span / 2;
		const rotate = pick(1, 11).toFixed(2);
		const shift = pick(2, 9).toFixed(2);
		const scale = (1 + pick(3, 0.16)).toFixed(3);
		return `rotate(${rotate}deg) translateY(${shift}px) scale(${scale})`;
	}

	const letters = profile.name.split('');

	// Per-pair kerning, since inline-block spans ignore the font's own pairs.
	// Key is the letter's index in the name, value is the gap after it.
	const kern: Record<number, string> = {
		0: '-0.06em', // K | o
		1: '0.05em', // o | r
		6: '0.05em' // S | e
	};
</script>

<svelte:head>
	<title>Koray Sels, cursor: pointer;</title>
	<meta name="description" content="{profile.name}. {profile.line} {profile.city}." />
</svelte:head>

{#snippet pass(ink: string)}
	<span class="pass {ink}" aria-hidden="true"
		>{#each letters as char, i (i)}<span
				class="letter"
				class:space={char === ' '}
				style="transform: {wobble(char, i)}; margin-right: {kern[i] ?? '0'}"
				>{char === ' ' ? ' ' : char}</span
			>{/each}</span
	>
{/snippet}

<!-- Ink that does not quite cover: a riso drum leaves specks of paper. -->
<svg class="defs" width="0" height="0" aria-hidden="true">
	<filter id="riso" x="0" y="0" width="100%" height="100%">
		<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" />
		<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.4 0 0 0 2.1" />
		<feComposite in="SourceGraphic" operator="in" />
	</filter>
</svg>

<div
	class="page"
	style="--mx: {carpet.shift.x}px; --my: {carpet.shift.y}px; --mr: {carpet.shift
		.turn}deg; --carpet-blue: {carpet.blue}; --carpet-pink: {carpet.pink}; --carpet-size: {carpet.size}"
>
	<header class="top">
		<p>{profile.company}</p>
		<p><a href="mailto:{profile.email}">{profile.email}</a></p>
	</header>

	<section class="hero">
		<div class="carpet" aria-hidden="true">
			<div class="ink blue"></div>
			<div class="ink pink"></div>
		</div>
		{#if live}
			<button class="reprint" type="button" onclick={reprint}>Reprint</button>
		{/if}
		<h1 aria-label={profile.name}>{@render pass('blue')}{@render pass('pink')}</h1>
		<p class="line">{profile.line}</p>
	</section>

	<main>
		<section class="row">
			<h2>Also</h2>
			<p>{profile.role}</p>
		</section>

		<section class="row">
			<h2>Earlier work</h2>
			<p class="names">
				{#each work as item, i (item.name)}{#if item.href}<a href={item.href}>{item.name}</a
						>{:else}{item.name}{/if}{#if i < work.length - 1}{', '}{/if}{/each}.
			</p>
		</section>

		{#if pile.length}
			<section class="row">
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

		<section class="row">
			<h2>Contact</h2>
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

		<section class="row">
			<h2>Elsewhere</h2>
			<p>
				{#each profile.socials as social, i (social.href)}<a href={social.href} rel="me"
						>{social.label}</a
					>{#if i < profile.socials.length - 1}{', '}{/if}{/each}
			</p>
		</section>
	</main>

	<footer class="row">
		<h2>Company</h2>
		<p>
			{profile.company}<br />
			{profile.city}<br />
			VAT {profile.vat}
		</p>
	</footer>
</div>

<style>
	.defs {
		position: absolute;
	}

	.page {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 var(--gutter) var(--gutter);
	}

	.top {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		padding: 16px 0;
		border-bottom: var(--rule) solid var(--ink);
	}

	/* hero: the carpet, and the name printed half over it */

	.hero {
		position: relative;
		padding-top: var(--gutter);
	}

	.carpet {
		position: relative;
		height: clamp(240px, 44vh, 480px);
		overflow: hidden;
	}

	.ink {
		position: absolute;
		inset: -12px;
		background-image: var(--carpet-blue);
		background-size: var(--carpet-size);
		mix-blend-mode: multiply;
		filter: url(#riso);
	}

	.ink.pink {
		background-image: var(--carpet-pink);
		transform: translate(var(--mx), var(--my)) rotate(var(--mr));
	}

	.reprint {
		position: absolute;
		top: calc(var(--gutter) + 16px);
		right: 16px;
		font: inherit;
		color: var(--ink);
		background: var(--paper);
		border: var(--rule) solid var(--ink);
		padding: 4px 12px;
	}

	.reprint:hover {
		background: var(--pink);
	}

	h1 {
		display: grid;
		font-family: 'Satu Suro', 'Pixel Operator', monospace;
		-webkit-font-smoothing: antialiased;
		font-weight: 400;
		font-size: clamp(64px, 15.5vw, 224px);
		line-height: 1;
		letter-spacing: -0.09em;
		/* only the cap line crosses the carpet: enough to overprint, not to drown */
		margin-top: -0.2em;
		position: relative;
	}

	/* the name, in two passes that never quite line up */
	.pass {
		grid-area: 1 / 1;
		mix-blend-mode: multiply;
		filter: url(#riso);
	}

	.pass.blue {
		color: var(--blue);
	}

	.pass.pink {
		color: var(--pink);
		transform: translate(calc(var(--mx) * 2.2), calc(var(--my) * 2.2)) rotate(var(--mr));
	}

	.letter {
		display: inline-block;
		transform-origin: 50% 75%;
	}

	.letter.space {
		width: 0.26em;
	}

	.line {
		font-size: var(--step-lead);
		line-height: 40px;
		max-width: 28ch;
		margin: 24px 0 96px;
	}

	/* rows: a label, a rule, the thing */

	.row {
		display: grid;
		grid-template-columns: minmax(160px, 1fr) 3fr;
		gap: 16px var(--gutter);
		border-top: var(--rule) solid var(--ink);
		padding: 16px 0 64px;
	}

	h2 {
		font-size: var(--step-small);
	}

	.names {
		font-size: var(--step-lead);
		line-height: 40px;
	}

	.pile {
		columns: 2;
		column-gap: var(--gutter);
	}

	.pile > * {
		break-inside: avoid;
		margin-bottom: var(--gutter);
	}

	figcaption {
		margin-top: 8px;
	}

	.contact summary {
		list-style: none;
		display: flex;
		align-items: baseline;
		gap: 16px;
		font-size: var(--step-lead);
		line-height: 40px;
		width: fit-content;
	}

	.contact summary::-webkit-details-marker {
		display: none;
	}

	.contact summary::before {
		content: '+';
		width: 1ch;
	}

	.contact[open] summary::before {
		content: '\2013';
	}

	.contact summary:hover {
		background: var(--pink);
	}

	form {
		display: grid;
		gap: 8px;
		max-width: 32rem;
		margin-top: 24px;
	}

	.hp {
		position: absolute;
		left: -9999px;
	}

	label + input,
	label + textarea {
		margin-bottom: 16px;
	}

	input,
	textarea {
		font: inherit;
		color: var(--ink);
		background: var(--paper);
		border: var(--rule) solid var(--ink);
		border-radius: 0;
		padding: 10px 12px;
		width: 100%;
	}

	textarea {
		resize: vertical;
	}

	input:focus,
	textarea:focus {
		outline: var(--rule) solid var(--pink);
		outline-offset: 0;
	}

	button[type='submit'] {
		justify-self: start;
		font: inherit;
		border: var(--rule) solid var(--ink);
		background: var(--ink);
		color: var(--paper);
		padding: 10px 32px;
	}

	button[type='submit']:hover {
		background: var(--pink);
		color: var(--ink);
	}

	footer.row {
		padding-bottom: 0;
	}

	@media (max-width: 760px) {
		.row {
			grid-template-columns: 1fr;
			padding-bottom: 48px;
		}

		.names {
			font-size: var(--step-body);
			line-height: 24px;
		}

		.line {
			margin-bottom: 64px;
		}

		.pile {
			columns: 1;
		}
	}
</style>
