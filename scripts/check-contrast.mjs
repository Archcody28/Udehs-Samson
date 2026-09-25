// Contrast guard (F32a.15 — Render-inspired visual system).
//
// Verifies that the semantic palette in src/index.css keeps readable
// foreground/background pairs in both themes (WCAG 2.1 relative luminance).
//   - normal text needs >= 4.5:1 (AA)
//   - large / bold text and non-text UI need >= 3:1 (AA, 1.4.11)
//
// Usage: node scripts/check-contrast.mjs   (exit 1 if any pair regresses)
import fs from 'node:fs';

const css = fs.readFileSync('src/index.css', 'utf8');

/** Reads a custom property out of a `selector { ... }` block. */
function readBlock(selector) {
  const i = css.indexOf(selector);
  if (i < 0) throw new Error(`selector not found: ${selector}`);
  const block = css.slice(i, css.indexOf('}', i));
  const vars = {};
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) vars[name] = value.trim();
  return vars;
}

const light = readBlock(':root {');
const dark = readBlock('.dark {');

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

/** `#rrggbb` or `rgba(r, g, b, a)` flattened over a background. */
function toRgb(color, over = '#ffffff') {
  if (color.startsWith('#')) return hexToRgb(color);
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`unsupported color: ${color}`);
  const [r, g, b, a = '1'] = m[1].split(',').map((v) => v.trim());
  const bgRgb = hexToRgb(over);
  const alpha = Number(a);
  return [r, g, b].map((v, i) => Number(v) * alpha + bgRgb[i] * (1 - alpha));
}

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (fg, bg) => {
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
};

const round = (n) => Math.round(n * 100) / 100;

// [label, foreground var, background var, minimum ratio]
const pairs = (t) => [
  ['body text on background', t.ink, t.background, 4.5],
  ['body text on surface', t.ink, t.surface, 4.5],
  ['body text on elevated', t.ink, t.elevated, 4.5],
  ['secondary text on background', t['ink-muted'], t.background, 4.5],
  ['secondary text on surface', t['ink-muted'], t.surface, 4.5],
  ['muted text on background', t['ink-subtle'], t.background, 4.5],
  ['muted text on surface', t['ink-subtle'], t.surface, 4.5],
  ['accent ink on background', t['accent-ink'], t.background, 4.5],
  ['accent ink on elevated', t['accent-ink'], t.elevated, 4.5],
  ['accent ink inside accent-soft', t['accent-ink'], t['accent-soft'], 4.5],
  ['success ink on background', t['success-ink'], t.background, 4.5],
  ['warning ink on background', t['warning-ink'], t.background, 4.5],
  ['danger ink on background', t['danger-ink'], t.background, 4.5],
  ['primary button label (white on accent)', '#ffffff', t.accent, 4.5],
  ['primary button label on hover fill', '#ffffff', t['accent-hover'], 4.5],
  ['accent fill vs background (1.4.11)', t.accent, t.background, 3],
  ['accent hover fill vs background (1.4.11)', t['accent-hover'], t.background, 3],
  ['accent hover vs elevated', t['accent-hover'], t.elevated, 3],
  ['control boundary (line-strong) vs background', t['line-strong'], t.background, 3],
  ['control boundary (line-strong) vs surface', t['line-strong'], t.surface, 3],
  // Decorative hairlines only separate content (WCAG 1.4.11 does not require a
  // ratio for them); keep them visibly above "invisible" at 1.2:1.
  ['decorative hairline (line) vs background', t['line'], t.background, 1.2],
];

let failures = 0;
for (const [themeName, theme, surfaceForAlpha] of [
  ['light', light, light.background],
  ['dark', dark, dark.background],
]) {
  console.log(`\n${themeName} theme`);
  for (const [label, fg, bg, min] of pairs(theme)) {
    const r = ratio(toRgb(fg, surfaceForAlpha), toRgb(bg, surfaceForAlpha));
    const ok = r >= min;
    if (!ok) failures += 1;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${round(r).toFixed(2)}:1  (min ${min})  ${label}`);
  }
}

console.log(
  failures
    ? `\n${failures} contrast pair(s) below the WCAG AA target.`
    : '\nOK — all semantic palette pairs meet the WCAG AA targets used here.'
);
process.exit(failures ? 1 : 0);
