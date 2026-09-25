// Post-build guard (F32a.15 — Render-inspired visual system).
//
// Every semantic token class used in src/ must actually be emitted by the
// production Tailwind build. Catches typos like `text-inkmuted` that
// typecheck cannot see and that would silently fall back to inherited color.
//
// Usage: npm run build && node scripts/check-build-css.mjs
import fs from 'node:fs';
import path from 'node:path';

const assetsDir = 'dist/assets';
if (!fs.existsSync(assetsDir)) {
  console.error(`missing ${assetsDir} — run \`npm run build\` first.`);
  process.exit(1);
}

const css = fs
  .readdirSync(assetsDir)
  .filter((f) => f.endsWith('.css'))
  .map((f) => fs.readFileSync(path.join(assetsDir, f), 'utf8'))
  .join('\n');

const SEMANTIC =
  /(?<![\w:[-])(?:[a-z-]+:)*(?:bg|text|border|ring|ring-offset|divide|from|to|via|fill|stroke|outline|placeholder|decoration|accent|caret)-(?:background|surface|elevated|line|line-strong|ink|muted|subtle|accent|accent-hover|accent-ink|accent-soft|success|success-ink|success-soft|warning|warning-ink|warning-soft|danger|danger-ink|danger-soft)(?:\/\d{1,3})?(?![\w./-])/g;

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(entry.name)) files.push(p);
  }
})('src');

const used = new Set();
for (const file of files) for (const m of fs.readFileSync(file, 'utf8').matchAll(SEMANTIC)) used.add(m[0]);

const missing = [...used].filter((cls) => {
  // Tailwind escapes `/` and `.` in selectors; check the base utility name.
  const base = cls.split('/')[0];
  const escaped = base.replace(/[.:[\]/]/g, (c) => `\\${c}`);
  return !css.includes(escaped) && !css.includes(`.${base}`);
});

console.log(`semantic utilities used in src: ${used.size}`);
console.log(missing.length ? `MISSING from dist CSS:\n  ${missing.join('\n  ')}` : 'OK — all emitted by the production build.');
process.exit(missing.length ? 1 : 0);
