<script lang="ts">
	import { onMount } from 'svelte';
	import { profile, work } from '#lib/data';
	import { pile } from '#lib/pile';
	import { FIELDS, weave } from '#lib/rug.js';

	const inks = {
		blue: [0x32, 0x55, 0xa4],
		pink: [0xff, 0x48, 0xb0]
	};

	// The few pixels the pink pass lands off the blue one. Prerendered with
	// one value; every visit then gets its own.
	let shift = $state({ x: 3, y: -2, turn: 0.12 });

	let carpet: HTMLDivElement;
	let blueInk: HTMLDivElement;
	let pinkInk: HTMLDivElement;
	let field = $state('');

	/** One ink pass as an image: a pixel per knot, inked where the code has its bit. */
	function inkImage(codes: Uint8Array, cols: number, rows: number, bit: number, rgb: number[]) {
		const canvas = document.createElement('canvas');
		canvas.width = cols;
		canvas.height = rows;
		const ctx = canvas.getContext('2d')!;
		const img = ctx.createImageData(cols, rows);
		for (let i = 0; i < codes.length; i += 1) {
			if (!(codes[i] & bit)) continue;
			img.data[i * 4] = rgb[0];
			img.data[i * 4 + 1] = rgb[1];
			img.data[i * 4 + 2] = rgb[2];
			img.data[i * 4 + 3] = 255;
		}
		ctx.putImageData(img, 0, 0);
		return `url(${canvas.toDataURL()})`;
	}

	onMount(() => {
		const seed = (Math.random() * 2 ** 32) >>> 0;
		const sign = () => (Math.random() < 0.5 ? -1 : 1);
		shift = {
			x: +(sign() * (2 + Math.random() * 3)).toFixed(1),
			y: +(sign() * (1.5 + Math.random() * 3)).toFixed(1),
			turn: +((Math.random() - 0.5) * 0.5).toFixed(2)
		};

		// Weave a rug to the band's size, a knot every few pixels, and weave it
		// again if the band changes width. Same seed, so the same rug.
		// ?field=meander (or bars, checker, fractal) weaves that field every time
		const asked = new URLSearchParams(location.search).get('field') ?? '';
		const only = FIELDS.includes(asked) ? asked : undefined;
		let woven = 0;
		const knot = () => (innerWidth < 700 ? 3 : 4);
		const lay = () => {
			const { width, height } = carpet.getBoundingClientRect();
			if (Math.abs(width - woven) < 2) return;
			woven = width;
			const cols = Math.ceil(width / knot());
			const rows = Math.ceil(height / knot());
			const rug = weave(seed, cols, rows, only);
			field = rug.field;
			blueInk.style.backgroundImage = inkImage(rug.codes, cols, rows, 1, inks.blue);
			pinkInk.style.backgroundImage = inkImage(rug.codes, cols, rows, 2, inks.pink);
		};
		let resize = 0;
		const watch = new ResizeObserver(() => {
			clearTimeout(resize);
			resize = window.setTimeout(lay, woven ? 150 : 0);
		});
		watch.observe(carpet);

		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => watch.disconnect();

		// Scrolling drifts the two passes apart and lifts the name. The page
		// eases toward the scroll position rather than following it, and only
		// over the first screen or so, where the carpet is.
		const root = document.documentElement;
		let target = 0;
		let current = 0;
		let frame = 0;

		const tick = () => {
			current += (target - current) * 0.09;
			if (Math.abs(target - current) < 0.05) current = target;
			root.style.setProperty('--s', current.toFixed(2));
			frame = current === target ? 0 : requestAnimationFrame(tick);
		};

		const onScroll = () => {
			target = Math.min(window.scrollY, 900);
			if (!frame) frame = requestAnimationFrame(tick);
		};

		addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		return () => {
			watch.disconnect();
			removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frame);
		};
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

<!-- Ink that does not quite cover: the drum leaves specks of paper. -->
<svg class="defs" width="0" height="0" aria-hidden="true">
	<filter id="speckle" x="0" y="0" width="100%" height="100%">
		<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" />
		<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.4 0 0 0 2.1" />
		<feComposite in="SourceGraphic" operator="in" />
	</filter>
</svg>

<div
	class="page"
	style="--mx: {shift.x}px; --my: {shift.y}px; --mr: {shift.turn}deg"
>
	<header class="top">
		<p>{profile.company}</p>
		<p><a href="mailto:{profile.email}">{profile.email}</a></p>
	</header>

	<section class="hero">
		<div class="carpet" aria-hidden="true" bind:this={carpet} data-field={field}>
			<div class="ink blue" bind:this={blueInk}></div>
			<div class="ink pink" bind:this={pinkInk}></div>
		</div>
		<h1 aria-label={profile.name}>{@render pass('blue')}{@render pass('pink')}</h1>
		<p class="line">{profile.line}</p>
		<p class="role">{profile.role}</p>
	</section>

	<main>
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
		padding: 8px 0;
	}

	/* hero: the carpet, and the name printed half over it */

	.hero {
		position: relative;
	}

	/* edge to edge: out of the page's margins to the full width of the body.
	   cqw, not vw, which would count the scrollbar and overhang it. */
	.carpet {
		position: relative;
		width: 100cqw;
		margin-left: calc(50% - 50cqw);
		height: clamp(240px, 40vh, 440px);
		overflow: hidden;
	}

	/* --s is the eased scroll position, set by the script; 0 without it.
	   Each layer is one image, a pixel per knot, stretched to the band. */
	.ink {
		position: absolute;
		inset: 0;
		background-size: 100% 100%;
		background-repeat: no-repeat;
		image-rendering: pixelated;
		mix-blend-mode: multiply;
		filter: url(#speckle);
		will-change: transform;
		transform: translateY(calc(var(--s, 0) * 0.05px));
	}

	/* the pink pass sinks a little faster and slides a little sideways, so the
	   misregistration opens as you scroll */
	.ink.pink {
		transform: translate(
				calc(var(--mx) - var(--s, 0) * 0.012px),
				calc(var(--my) + var(--s, 0) * 0.075px)
			)
			rotate(var(--mr));
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
		filter: url(#speckle);
	}

	.pass.blue {
		color: var(--blue);
	}

	.pass.pink {
		color: var(--pink);
		/* the blue pass stays put; the pink pass alone lifts off on scroll */
		will-change: transform;
		transform: translate(
				calc(var(--mx) * 2.2 + var(--s, 0) * 0.01px),
				calc(var(--my) * 2.2 - var(--s, 0) * 0.12px)
			)
			rotate(var(--mr));
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
		max-width: 38ch; /* two lines on desktop */
		margin-top: 24px;
	}

	.role {
		margin: 16px 0 96px;
	}

	/* rows: a label, then the thing */

	.row {
		display: grid;
		grid-template-columns: minmax(160px, 1fr) 3fr;
		gap: 16px var(--gutter);
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

		.role {
			margin-bottom: 64px;
		}

		.pile {
			columns: 1;
		}
	}
</style>
