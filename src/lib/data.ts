export const profile = {
	name: 'Koray Sels',
	company: 'cursor: pointer;',
	city: 'Antwerp, Belgium',
	vat: 'BE 0502.806.428',
	email: 'koray.sels@gmail.com',
	socials: [
		{ label: 'Instagram', href: 'https://www.instagram.com/_krocky' },
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/koraysels/' },
		{ label: 'GitHub', href: 'https://github.com/koraysels' }
	]
};

/** The pictures on the stage. Every one is a real screenshot of work that is online. */
export type Shot = { id: string; src: string; alt: string; caption: string };

export const shots: Shot[] = [
	{
		id: 'metropolis',
		src: '/work/metropolis.jpg',
		alt: 'The Metropolis Festival home page: a violet illustrated face beside the festival programme.',
		caption: 'Metropolis Festival · metropolisfestival.eu'
	},
	{
		id: 'slechtvalk',
		src: '/work/slechtvalk.jpg',
		alt: 'Radio Slechtvalk: a green and cream page with a live video player and a chat panel.',
		caption: 'Radio Slechtvalk · radioslechtvalk.be'
	},
	{
		id: 'warmtenet',
		src: '/work/warmtenet.jpg',
		alt: 'Warmtenet Borgerhout: a red page with a cream sun and the line "Voor al wie warmte nodig heeft".',
		caption: 'Warmtenet Borgerhout · warmtenetborgerhout.be'
	},
	{
		id: 'rekordbox',
		src: '/work/rekordbox.jpg',
		alt: 'Rekordbox Library Fixer: a cream download page for the DJ library tool.',
		caption: 'Rekordbox Library Fixer · an open-source tool of my own'
	}
];

export type Capability = {
	title: string;
	lines: string[];
	shot?: Shot;
};

export const capabilities: Capability[] = [
	{
		title: 'Websites and platforms',
		shot: shots[0],
		lines: [
			'SvelteKit, Next.js, Astro',
			'Payload CMS, headless WordPress, Decap',
			'Two and three language sites',
			'Ticketing and shop front-ends',
			'Netlify and Vercel, or your own box'
		]
	},
	{
		title: 'Streaming and broadcast',
		shot: shots[1],
		lines: [
			'24/7 Liquidsoap into Icecast, with a fallback chain',
			'Recording agents that keep going through an outage',
			'Automatic uploads to YouTube and Mixcloud',
			'Owncast and OBS, tuned and left running',
			'Tally systems for multicam rooms'
		]
	},
	{
		title: 'Apps and tools',
		shot: shots[3],
		lines: [
			'Kotlin Multiplatform for Android and iOS',
			'Electron for the desktop, with update feeds',
			'Capacitor when the web app is the app',
			'Small command line tools that do one job'
		]
	},
	{
		title: 'Money and the back office',
		lines: [
			'Bancontact Pro (Payconiq): I wrote the Node SDK',
			'Stripe subscriptions and one-off payments',
			'A point of sale that works behind a bar',
			'Schedulers, rosters, invoicing glue'
		]
	},
	{
		title: 'Installations and hardware',
		lines: [
			'ESP8266 and ESP32 sensors on a roof or behind a panel',
			'Art-Net and DMX for light',
			'Pen plotters, MIDI, physical interfaces',
			'Home Assistant for the rest'
		]
	}
];

export type WorkRow = {
	name: string;
	what: string;
	tag: string;
	href?: string;
	shot?: Shot;
};

export const work: WorkRow[] = [
	{
		name: 'COMING SOON',
		what: 'radio station: site, scheduler, 24/7 stream, apps, bar POS',
		tag: 'everything',
		href: 'https://github.com/onder-stroom',
		shot: shots[1]
	},
	{
		name: 'Metropolis Festival',
		what: 'festival site for a youth tech and art week',
		tag: 'web',
		href: 'https://www.metropolisfestival.eu',
		shot: shots[0]
	},
	{
		name: 'Warmtenet Borgerhout',
		what: 'district map of warm rooms for the winter',
		tag: 'web',
		href: 'https://warmtenetborgerhout.be',
		shot: shots[2]
	},
	{
		name: 'Radio Slechtvalk',
		what: 'station site with a live player and chat',
		tag: 'web · stream',
		href: 'https://radioslechtvalk.be',
		shot: shots[1]
	},
	{
		name: 'Rekordbox Library Fixer',
		what: 'my own tool for broken DJ libraries',
		tag: 'app',
		href: 'https://github.com/koraysels/rekordbox-library-fixer',
		shot: shots[3]
	},
	{
		name: 'Bancontact Pro SDK',
		what: 'open-source Node SDK for the Belgian payment API',
		tag: 'open source',
		href: 'https://github.com/koraysels/bancontact-pro'
	},
	{
		name: 'CC Mortsel',
		what: 'front-end for a cultural centre ticket shop',
		tag: 'web'
	},
	{
		name: 'Vrijplaatsen',
		what: 'site for the To/t\\hem archipelago',
		tag: 'web'
	},
	{
		name: 'Quba Maatwerkstudio',
		what: 'site for a joinery studio',
		tag: 'web'
	},
	{
		name: 'Rrrrrumba',
		what: 'band site',
		tag: 'web'
	},
	{
		name: 'NMBS realtime arrivals',
		what: 'a train board for the wall',
		tag: 'side project'
	},
	{
		name: 'Spotify → rekordbox sync',
		what: 'playlists matched against a local DJ collection',
		tag: 'side project',
		href: 'https://github.com/koraysels/spotify-rekordbox-sync'
	}
];
