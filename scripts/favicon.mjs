/**
 * Writes static/favicon.svg: the pixel hand from src/lib/cursor.js.
 *
 *   node scripts/favicon.mjs
 */

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { favicon } from '../src/lib/cursor.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../static/favicon.svg');
writeFileSync(out, favicon({ blue: '#3255a4', pink: '#ff48b0', paper: '#ffffff' }) + '\n');
console.log(out);
