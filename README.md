# koraysels.com

One sheet. SvelteKit 3 + Svelte 5, prerendered to static files, deployed on Netlify.

```bash
npm install
npm run dev
npm run build      # -> build/
npm run preview
```

## Content

- `src/lib/data.ts` — name, one line, company details, socials, and the "Earlier work" list
  (names only; add `href` to make one a link).
- `src/lib/pile.ts` — the portfolio dump. Empty, so the section does not render. Add items
  (`image`, `video` or `link`) and it appears. Files go in `static/pile/`.

## Contact form

Netlify Forms, named `contact`. No backend, no JS: Netlify picks the form up from the prerendered
HTML at deploy time, stores submissions and posts to `/thanks`. A honeypot field catches most bots.

After the first deploy, in Netlify: **Forms → contact → Settings → Form notifications → Email
notification**, send to `me@koraysels.com`. Until that is set, submissions only sit in the dashboard.

## Deploy

`netlify.toml` sets build `npm run build`, publish `build`, Node 22. Nothing else to configure.
