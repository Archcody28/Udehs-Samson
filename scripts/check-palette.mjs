// Palette guard (F32a.15 — Render-inspired visual system).
//
// The product renders from one semantic palette defined in src/index.css
// (background / surface / elevated / line / ink / muted / subtle / accent /
// success / warning / danger). Raw Tailwind palette shades (slate-500,
// blue-600, purple-500, emerald-400, ...) are therefore treated as regressions
// and this script fails when it finds them.
//
// Usage:  node scripts/check-palette.mjs
// Exit:   0 when the codebase only uses semantic tokens (+ the allow-list),
//         1 when stray palette shades or decorative gradients are found.
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['src', 'public'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.html', '.js', '.json']);

// Intentional, documented exceptions — each one is a deliberate contrast pairing.
const ALLOWED_PREFIXES = [
  'text-white', // off-white ink on accent buttons / dark scrims
  'bg-white', // light-theme content surface
  'border-white', // timeline dot halo on the near-black foundation
  'bg-black', // modal scrim base
  'dark:bg-white', // inverted (light) button inside dark surfaces
  'dark:text-black',
];

const PALETTE_SHADES =
  /(?<![\w:[-])(?:[a-z-]+:)*(?:bg|text|border|ring|divide|from|to|via|fill|stroke|shadow|outline|placeholder|decoration|accent|caret)-(?:slate|gray|zinc|neutral|stone|blue|purple|indigo|violet|sky|cyan|teal|emerald|green|lime|amber|yellow|orange|red|rose|pink|fuchsia|brand)(?:-\d{2,3})?(?:\/\d{1,3})?(?![\w./-])/g;
const DECORATION =
  /(?<![\w:-])(?:bg-gradient-to-(?:r|l|t|b|tr|tl|br|bl)|gradient-text|backdrop-blur(?:-\w+)?|animate-(?:ping|bounce))(?![-\w])/g;

const files = [];
for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (EXTENSIONS.has(path.extname(entry.name))) files.push(p);
    }
  })(root);
}

let offenders = 0;
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const hits = [
    ...(src.match(PALETTE_SHADES) ?? []),
    ...(src.match(DECORATION) ?? []),
  ].filter((token) => !ALLOWED_PREFIXES.some((allowed) => token.startsWith(allowed)));

  if (!hits.length) continue;
  offenders += hits.length;
  const counts = new Map();
  for (const h of hits) counts.set(h, (counts.get(h) ?? 0) + 1);
  console.log(`\n${path.relative('.', file)}`);
  for (const [token, n] of [...counts].sort()) console.log(`  ${n}  ${token}`);
}

console.log(
  offenders
    ? `\n${offenders} stray palette / decorative classes across ${files.length} scanned files.`
    : `\nOK — ${files.length} files use only semantic palette tokens.`
);
process.exit(offenders ? 1 : 0);
