# koraysels.com

One-page site for Koray Sels / `cursor: pointer;`. SvelteKit 3 + Svelte 5, prerendered to static
files, deployed on Netlify.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # -> build/
npm run preview
```

## Deploy (Netlify)

`netlify.toml` is already set: build command `npm run build`, publish directory `build`, Node 22.
Connect the repository in Netlify and it needs nothing else. No functions, no env vars.

## Where the content lives

| What | File |
| --- | --- |
| Name, company, VAT, email, social links | `src/lib/data.ts` → `profile` |
| The four screenshots that cycle on the black stage | `src/lib/data.ts` → `shots` |
| The capability blocks on the black field | `src/lib/data.ts` → `capabilities` |
| The "Selected work" ledger | `src/lib/data.ts` → `work` |
| **The pile** (the portfolio dump) | `src/lib/pile.ts` |

### Adding to the pile

`src/lib/pile.ts` is a plain array. Three kinds of item:

```ts
{ kind: 'image', src: '/pile/soundcheck.jpg', alt: '…', caption: '…', href: '…' }
{ kind: 'video', src: '/pile/plotter.mp4', poster: '/pile/plotter.jpg', caption: '…' }
{ kind: 'link',  href: 'https://…', title: '…', note: '…' }
```

Put the files in `static/pile/` and reference them as `/pile/<file>`. Videos play muted, looped and
without controls, so keep them short and silent-by-design. The grid flows in columns, so items keep
their own height; order in the array is the order on the page.

## The idea, so later edits don't break it

The fixed black half of the screen is the company name made live: the bar at its foot prints the
real CSS `cursor` value for whatever is under the pointer. That only stays true because `app.css`
sets honest cursors (`default` on the page, `text` on text, `pointer` on controls). If you add a
component, give it a cursor that tells the truth.

Hovering a row of "Selected work" pins that project's screenshot on the stage; otherwise the four
screenshots cross-fade slowly. Both pause under `prefers-reduced-motion`.

## Things to swap before this is really yours

- **Email.** `profile.email` is the gmail address. Put a business address there if you have one.
- **Years.** The ledger deliberately has no years, only what each project is. Add a year column if
  you want one, but then it needs real dates.
- **Footer photograph.** "Container crane at Antwerp harbour" by Alf van Beem, CC0, via Wikimedia
  Commons — credited in the footer. Replace it with one of your own and update the credit line in
  `src/routes/+page.svelte`.
- **Screenshots.** `static/work/*.jpg` were captured from the live sites on 6 November 2026. They go
  stale; re-shoot when a client redesigns.
