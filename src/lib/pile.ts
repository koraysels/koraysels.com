/**
 * THE PILE: the portfolio dump.
 *
 * Add things here and they appear in the grid. Nothing else to touch.
 *
 *   image : drop the file in  static/pile/  and point `src` at  /pile/<file>
 *   video : drop an .mp4 and a poster frame in  static/pile/
 *           (it plays muted, looped, no sound, no controls)
 *   link  : anything that lives somewhere else
 *
 * Order is the order you see. Newest first reads best. The grid flows in
 * columns, so items keep their own height, so tall and short can sit together.
 */

export type PileItem =
	| {
			kind: 'image';
			src: string;
			alt: string;
			caption: string;
			href?: string;
	  }
	| {
			kind: 'video';
			src: string;
			poster: string;
			caption: string;
			href?: string;
	  }
	| {
			kind: 'link';
			href: string;
			title: string;
			note: string;
	  };

export const pile: PileItem[] = [
	{
		kind: 'image',
		src: '/work/metropolis.jpg',
		alt: 'Metropolis Festival home page with a violet illustrated face.',
		caption: 'Metropolis Festival, 2025',
		href: 'https://www.metropolisfestival.eu'
	},
	{
		kind: 'link',
		href: 'https://github.com/koraysels/rekordbox-library-fixer',
		title: 'Rekordbox Library Fixer',
		note: 'Finds duplicates, brings back the "!" tracks and clears out entries pointing at nothing, written straight into rekordbox’s own database, with a backup first.'
	},
	{
		kind: 'image',
		src: '/work/slechtvalk.jpg',
		alt: 'Radio Slechtvalk page with a live video player and a green chat panel.',
		caption: 'Radio Slechtvalk, Borgerhout',
		href: 'https://radioslechtvalk.be'
	},
	{
		kind: 'link',
		href: 'https://github.com/onder-stroom',
		title: 'COMING SOON',
		note: 'A radio station in code: the website, the programme scheduler, the 24/7 Liquidsoap chain, the recording agent, the apps, the till behind the bar.'
	},
	{
		kind: 'image',
		src: '/work/warmtenet.jpg',
		alt: 'Warmtenet Borgerhout page, red with a cream sun.',
		caption: 'Warmtenet Borgerhout, winter',
		href: 'https://warmtenetborgerhout.be'
	},
	{
		kind: 'link',
		href: 'https://github.com/koraysels/bancontact-pro',
		title: 'bancontact-pro',
		note: 'An unofficial Node SDK for the Bancontact Pro merchant API: payments and webhook verification, because nobody else had written one.'
	},
	{
		kind: 'image',
		src: '/work/rekordbox.jpg',
		alt: 'Download page for Rekordbox Library Fixer.',
		caption: 'Rekordbox Library Fixer, 71 stars and counting',
		href: 'https://koraysels.github.io/rekordbox-library-fixer-website/'
	},
	{
		kind: 'link',
		href: 'https://github.com/koraysels/sms2discord',
		title: 'sms2discord',
		note: 'A two-way SMS bridge into Discord that runs on a GL.iNet router. For when the venue has no internet but it does have a SIM card.'
	},
	{
		kind: 'link',
		href: 'https://github.com/koraysels/spotify-rekordbox-sync',
		title: 'spotify-rekordbox-sync',
		note: 'Pulls Spotify playlists into a rekordbox collection, matches what you already own and hands you a wantlist of the rest.'
	},
	{
		kind: 'link',
		href: 'https://github.com/koraysels',
		title: 'The rest of it',
		note: 'Fifty-odd public repositories: Home Assistant add-ons, Art-Net toys, an M5Stick tally listener, a plotter driver, a McDonald’s route planner I am not proud of.'
	}
];
