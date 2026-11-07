/**
 * Writes the first-paint pair: static/pattern.svg and src/lib/generated.css,
 * the field and the card edge a visitor sees before the page's script runs,
 * and the only ones a visitor without JavaScript sees.
 *
 *   node scripts/pattern.mjs [seed]
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makePattern, makeEdge, makeCrumbs } from '../src/lib/pattern.js';

const seed = Number(process.argv[2] ?? 20261106);
const here = dirname(fileURLToPath(import.meta.url));

const { svg, width, height } = makePattern(seed);
const svgPath = resolve(here, '../static/pattern.svg');
mkdirSync(dirname(svgPath), { recursive: true });
writeFileSync(svgPath, svg + '\n');

const crumbs = makeCrumbs(seed);
const cssPath = resolve(here, '../src/lib/generated.css');
writeFileSync(
	cssPath,
	`/* Written by scripts/pattern.mjs. Do not edit: run the script instead. */\n` +
		`:root {\n\t--tile: ${width}px ${height}px;\n\t--torn: ${makeEdge(seed)};\n` +
		`\t--crumbs: ${crumbs.image};\n\t--crumbs-at: ${crumbs.position};\n` +
		`\t--crumbs-size: ${crumbs.size};\n}\n`
);

console.log(`seed ${seed} · tile ${width}x${height} · ${svgPath} · ${cssPath}`);
