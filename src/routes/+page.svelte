<script lang="ts">
	import { onMount } from 'svelte';
	import Stage from '#lib/Stage.svelte';
	import Pile from '#lib/Pile.svelte';
	import { capabilities, profile, work } from '#lib/data';
	import { stage } from '#lib/pointer.svelte';

	let brief = $state('');

	const mailto = $derived(
		`mailto:${profile.email}` +
			`?subject=${encodeURIComponent('Project via koraysels.com')}` +
			`&body=${encodeURIComponent(brief)}`
	);

	function send(event: SubmitEvent) {
		event.preventDefault();
		window.location.href = mailto;
	}

	onMount(() => {
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-in');
						io.unobserve(entry.target);
					}
				}
			},
			{ rootMargin: '0px 0px -10% 0px' }
		);
		for (const node of document.querySelectorAll('[data-rise]')) io.observe(node);

		if (!window.matchMedia('(pointer: fine)').matches) return () => io.disconnect();

		let frame = 0;
		const onMove = (event: PointerEvent) => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				const el = document.elementFromPoint(event.clientX, event.clientY);
				if (!el) return;
				const value = getComputedStyle(el).cursor.split(',').pop();
				if (value) stage.cursor = value.trim();
			});
		};
		window.addEventListener('pointermove', onMove, { passive: true });

		return () => {
			io.disconnect();
			window.removeEventListener('pointermove', onMove);
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

<svelte:head>
	<title>Koray Sels, cursor: pointer;</title>
	<meta
		name="description"
		content="Koray Sels builds websites, apps, streaming infrastructure and installations for radio stations, festivals and cultural houses. Antwerp, Belgium."
	/>
</svelte:head>

<a class="skip" href="#work">Skip to the work</a>

<div class="split">
	<Stage />

	<div class="column">
		<header class="hero">
			<h1>I build what culture runs on.</h1>
			<p class="lead">
				Koray Sels, from Antwerp. Websites, apps, streaming infrastructure and installations
				for radio stations, festivals and cultural houses.
			</p>
			<a class="action" href={mailto}>Start a project</a>
		</header>

		<section class="letter" id="about" data-rise>
			<h2>One person, the whole stack</h2>
			<p>
				I am Koray Sels. I have been building things for the web since people still shipped
				jQuery plugins, and I never stopped at the browser.
			</p>
			<p>
				My company is called <strong>cursor: pointer;</strong>, the one line of CSS that turns
				a thing on a screen into a thing you can press. That is close enough to a job
				description.
			</p>
			<p>
				Most of the work sits behind culture. A radio station that has to stay on air at four
				in the morning. A youth festival that needs its programme online in two languages
				before the tickets go out. A district that wants to show people which rooms are warm
				this winter.
			</p>
			<p>
				When a project needs all of it, I do all of it: the site, the CMS, the app, the
				streaming chain, the card terminal behind the bar, the sensor glued behind a panel.
				When it needs one piece, I do that piece and leave.
			</p>
			<p>I also lecture. Having to explain it keeps me honest.</p>
			<p class="sign">Koray Sels<span>cursor: pointer; · Antwerp</span></p>
		</section>

		<section class="ledger" id="work" data-rise>
			<h2>Selected work</h2>
			<ul
				onmouseleave={() => (stage.activeId = null)}
				onfocusout={() => (stage.activeId = null)}
			>
				{#each work as row (row.name)}
					<li
						class:dim={stage.activeId !== null && stage.activeId !== row.shot?.id}
						onmouseenter={() => (stage.activeId = row.shot?.id ?? null)}
						onfocusin={() => (stage.activeId = row.shot?.id ?? null)}
					>
						{#if row.href}
							<a href={row.href}>{row.name}</a>
						{:else}
							<span>{row.name}</span>
						{/if}
						<span class="what">{row.what}</span>
						<span class="tag">{row.tag}</span>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</div>

<section class="field" id="make">
	<div class="field-grid">
		<h2 data-rise>What I make</h2>

		<div class="blocks">
			{#each capabilities as cap, i (cap.title)}
				<article class="block" class:flip={i % 2 === 1} data-rise>
					<h3>{cap.title}</h3>
					<div class="block-body">
						{#if cap.shot}
							<img
								class="block-shot"
								src={cap.shot.src}
								alt={cap.shot.alt}
								width="1200"
								height="900"
								loading="lazy"
								decoding="async"
							/>
						{/if}
						<ul>
							{#each cap.lines as line (line)}
								<li>{line}</li>
							{/each}
						</ul>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<section class="pile-section" id="pile">
	<div class="pile-head" data-rise>
		<h2>The pile</h2>
		<p>Pictures, clips and links, in no particular order. It grows.</p>
	</div>
	<Pile />
</section>

<section class="contact" id="contact">
	<div class="contact-inner" data-rise>
		<h2>
			<span class="soft">You have something that has to work.</span>
			<span>Tell me what it is.</span>
		</h2>

		<form onsubmit={send}>
			<label class="visually-hidden" for="brief">In one line: what do you need?</label>
			<input
				id="brief"
				name="brief"
				type="text"
				bind:value={brief}
				placeholder="A radio station that never drops out, for instance"
				autocomplete="off"
			/>
			<button type="submit" aria-label="Write me about this">→</button>
		</form>
		<p class="after">This opens your mail app with the line already in it. No form, no tracker.</p>

		<dl>
			<div>
				<dt>Mail</dt>
				<dd><a href="mailto:{profile.email}">{profile.email}</a></dd>
			</div>
			<div>
				<dt>Company</dt>
				<dd>{profile.company} · VAT {profile.vat}</dd>
			</div>
			<div>
				<dt>Elsewhere</dt>
				<dd>
					{#each profile.socials as social, i (social.href)}
						<a href={social.href} rel="me">{social.label}</a>{#if i < profile.socials.length - 1}<span
								class="sep"
							>·</span
							>{/if}
					{/each}
				</dd>
			</div>
		</dl>
	</div>
</section>

<footer class="footer">
	<img
		class="bed"
		src="/img/antwerp-crane.jpg"
		alt="A container crane standing against a clear sky in the port of Antwerp."
		width="1350"
		height="1800"
		loading="lazy"
		decoding="async"
	/>
	<div class="footer-top">
		<ul class="footer-links">
			<li><a href="#about">About</a></li>
			<li><a href="#work">Work</a></li>
			<li><a href="#make">What I make</a></li>
			<li><a href="#pile">The pile</a></li>
		</ul>
		<ul class="footer-contact">
			<li><a href="mailto:{profile.email}">{profile.email}</a></li>
			{#each profile.socials as social (social.href)}
				<li><a href={social.href} rel="me">{social.label}</a></li>
			{/each}
		</ul>
	</div>
	<div class="footer-bottom">
		<h2 class="footer-mark">cursor: pointer;</h2>
		<p class="legal">
			{profile.name} · {profile.city} · VAT {profile.vat} · Photograph: “Container crane at
			Antwerp harbour” by Alf van Beem, CC0, via Wikimedia Commons.
		</p>
	</div>
</footer>

<style>
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	/* ── the split ───────────────────────────────────────────── */
	.split {
		display: grid;
		grid-template-columns: 46fr 54fr;
		align-items: start;
	}

	.column {
		padding: clamp(2rem, 5vw, 5.5rem) clamp(1.5rem, 4vw, 4.5rem);
		display: grid;
		gap: var(--gap-section);
		justify-items: start;
	}

	.hero {
		display: grid;
		gap: 2rem;
		width: 100%;
		padding-block: clamp(1.5rem, 7vh, 6rem) 0;
	}

	.lead {
		font-size: var(--step-lead);
		line-height: 1.35;
		max-width: 34ch;
		color: var(--ink);
	}

	.action {
		justify-self: start;
		background: var(--accent);
		color: var(--accent-ink);
		font-weight: 600;
		font-size: var(--step-body);
		padding: 0.9rem 1.6rem;
		text-decoration: none;
		transition: transform 180ms var(--ease);
	}

	.action:hover,
	.action:focus-visible {
		color: var(--accent-ink);
		transform: translateY(-2px);
	}

	/* ── the letter ──────────────────────────────────────────── */
	.letter {
		display: grid;
		gap: 1.1rem;
		max-width: var(--measure);
	}

	.letter h2 {
		font-size: var(--step-head);
		margin-bottom: 0.8rem;
		max-width: 14ch;
	}

	.letter p {
		line-height: 1.55;
	}

	.letter strong {
		font-weight: 600;
		background: var(--accent);
		box-decoration-break: clone;
		padding: 0.05em 0.2em;
	}

	.sign {
		margin-top: 1.4rem;
		font-size: var(--step-lead);
		line-height: 1.2;
	}

	.sign span {
		display: block;
		font-size: var(--step-small);
		color: var(--muted);
		margin-top: 0.35rem;
	}

	/* ── the ledger ──────────────────────────────────────────── */
	.ledger {
		width: 100%;
		max-width: 38rem;
	}

	.ledger h2 {
		font-size: var(--step-lead);
		font-weight: 600;
		letter-spacing: 0;
		margin-bottom: 2rem;
	}

	.ledger li {
		display: grid;
		grid-template-columns: 11rem 1fr auto;
		gap: 1rem;
		align-items: baseline;
		padding: 0.7rem 0;
		font-size: var(--step-small);
		transition: opacity 200ms var(--ease);
	}

	.ledger li.dim {
		opacity: 0.38;
	}

	.ledger li > a,
	.ledger li > span:first-child {
		font-size: var(--step-body);
		text-decoration: none;
	}

	.ledger li > a:hover {
		color: var(--accent);
	}

	.ledger .what {
		color: var(--muted);
	}

	.ledger .tag {
		color: var(--muted);
		text-align: right;
	}

	/* ── the field ───────────────────────────────────────────── */
	.field {
		background: var(--field-1);
		color: var(--field-1-ink);
		padding: clamp(4rem, 9vw, 9rem) var(--gutter);
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: clamp(2rem, 4vw, 4rem);
	}

	.field h2 {
		grid-column: 1 / 6;
		align-self: start;
		position: sticky;
		top: 2rem;
		font-size: clamp(3rem, 6.6vw, 6.5rem);
		line-height: 0.92;
		max-width: 8ch;
	}

	.blocks {
		grid-column: 7 / 13;
		display: grid;
		gap: clamp(3rem, 4.5vw, 4.75rem);
	}

	.block h3 {
		font-weight: 600;
		letter-spacing: -0.02em;
		margin-bottom: 1.4rem;
		font-size: clamp(1.5rem, 2vw, 1.85rem);
	}

	.block-body {
		display: flex;
		gap: clamp(1.5rem, 2.5vw, 2.5rem);
		align-items: flex-start;
	}

	.block.flip .block-body {
		flex-direction: row-reverse;
	}

	.block-shot {
		width: 16rem;
		max-width: 42%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		object-position: top left;
		flex: none;
	}

	.block ul {
		display: grid;
		gap: 0.85rem;
		font-size: var(--step-body);
		color: #cfd3dc;
	}

	/* ── the pile ────────────────────────────────────────────── */
	.pile-section {
		background: var(--surface);
		padding: clamp(4rem, 9vw, 9rem) var(--gutter);
	}

	.pile-head {
		display: grid;
		gap: 0.8rem;
		margin-bottom: clamp(2.5rem, 4vw, 4rem);
		max-width: 34ch;
	}

	.pile-head p {
		color: var(--muted);
	}

	/* ── contact ─────────────────────────────────────────────── */
	.contact {
		padding: clamp(5rem, 11vw, 11rem) var(--gutter);
	}

	.contact-inner {
		max-width: 34rem;
		margin-inline: auto;
	}

	.contact h2 {
		font-size: var(--step-lead);
		font-weight: 600;
		letter-spacing: 0;
		line-height: 1.3;
		display: grid;
		gap: 0.1rem;
		margin-bottom: 1.75rem;
	}

	.contact .soft {
		color: var(--muted);
	}

	form {
		display: flex;
		align-items: stretch;
		background: var(--surface);
		height: 4rem;
	}

	input {
		flex: 1;
		min-width: 0;
		border: 0;
		background: transparent;
		font: inherit;
		font-size: var(--step-body);
		color: var(--ink);
		padding: 0 1.1rem;
	}

	input::placeholder {
		color: var(--muted);
	}

	input:focus {
		outline: 0;
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}

	button {
		flex: none;
		width: 4rem;
		border: 0;
		background: var(--accent);
		color: var(--accent-ink);
		font: inherit;
		font-size: 1.4rem;
		cursor: pointer;
		transition: filter 180ms var(--ease);
	}

	button:hover {
		filter: brightness(1.08);
	}

	.after {
		font-size: var(--step-small);
		color: var(--muted);
		margin-top: 0.9rem;
	}

	dl {
		margin: clamp(3rem, 6vw, 4.5rem) 0 0;
		display: grid;
		gap: 1.1rem;
	}

	dl > div {
		display: grid;
		grid-template-columns: 7rem 1fr;
		gap: 1rem;
		font-size: var(--step-small);
	}

	dt {
		color: var(--muted);
	}

	.sep {
		color: var(--muted);
		padding: 0 0.45em;
	}

	/* ── footer ──────────────────────────────────────────────── */
	.footer {
		position: relative;
		min-height: 100svh;
		display: grid;
		grid-template-rows: auto 1fr auto;
		padding: clamp(1.5rem, 3vw, 2rem) var(--gutter);
		color: #ffffff;
		isolation: isolate;
		overflow: hidden;
	}

	.bed {
		position: absolute;
		inset: 0;
		z-index: -1;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center 38%;
		filter: brightness(0.52);
	}

	.footer-top {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
		flex-wrap: wrap;
		font-size: var(--step-body);
	}

	.footer-contact {
		text-align: right;
	}

	.footer-top li + li {
		margin-top: 0.35rem;
	}

	.footer-top a {
		text-decoration: none;
	}

	.footer-bottom {
		align-self: end;
	}

	.footer-mark {
		font-size: clamp(2.2rem, 11.2vw, 13rem);
		line-height: 0.9;
		letter-spacing: -0.035em;
		white-space: nowrap;
	}

	.legal {
		font-size: var(--step-small);
		margin-top: 0.9rem;
		max-width: 70ch;
	}

	/* ── narrow ──────────────────────────────────────────────── */
	@media (max-width: 999px) {
		.split {
			grid-template-columns: 1fr;
		}

		.column {
			gap: clamp(4rem, 12vw, 7rem);
			padding: clamp(1.5rem, 4vw, 2.5rem) var(--gutter) clamp(2.5rem, 7vw, 4rem);
		}

		.hero {
			gap: 1.5rem;
			padding-block: 0;
		}

		.field-grid {
			grid-template-columns: 1fr;
		}

		.field h2,
		.blocks {
			grid-column: 1 / -1;
		}

		.field h2 {
			position: static;
			max-width: none;
		}

		.block-body,
		.block.flip .block-body {
			flex-direction: column;
		}

		.block-shot {
			width: 100%;
			max-width: none;
		}
	}

	@media (max-width: 620px) {
		.ledger li {
			grid-template-columns: 1fr auto;
		}

		.ledger .what {
			grid-column: 1 / -1;
		}

		dl > div {
			grid-template-columns: 1fr;
			gap: 0.2rem;
		}
	}
</style>
