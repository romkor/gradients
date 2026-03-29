export type GradientType = 'linear' | 'radial' | 'conic';

export interface ColorStop {
  id: string;
  color: string;
  position: number; // 0-100
}

export interface Gradient {
  id: string;
  name: string;
  type: GradientType;
  angle: number; // for linear gradients
  stops: ColorStop[];
  createdAt: number;
  updatedAt: number;
}

import { v7 as uuidv7 } from 'uuid';

export function generateId(): string {
  return uuidv7();
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

// --- Vocabulary ---

// Three-tier hue names (dark / mid / light) across fine-grained hue ranges
const HUE_TIERS: Array<{ max: number; dark: string; mid: string; light: string }> = [
  { max: 10, dark: 'Crimson', mid: 'Ruby', light: 'Blush' },
  { max: 20, dark: 'Scarlet', mid: 'Coral', light: 'Salmon' },
  { max: 35, dark: 'Amber', mid: 'Tangerine', light: 'Peach' },
  { max: 50, dark: 'Goldenrod', mid: 'Saffron', light: 'Honey' },
  { max: 65, dark: 'Olive', mid: 'Citrus', light: 'Lemon' },
  { max: 100, dark: 'Forest', mid: 'Emerald', light: 'Sage' },
  { max: 145, dark: 'Jade', mid: 'Fern', light: 'Mint' },
  { max: 170, dark: 'Teal', mid: 'Seafoam', light: 'Aqua' },
  { max: 200, dark: 'Ocean', mid: 'Cerulean', light: 'Sky' },
  { max: 230, dark: 'Cobalt', mid: 'Azure', light: 'Cornflower' },
  { max: 260, dark: 'Indigo', mid: 'Sapphire', light: 'Periwinkle' },
  { max: 290, dark: 'Violet', mid: 'Amethyst', light: 'Lavender' },
  { max: 320, dark: 'Magenta', mid: 'Orchid', light: 'Lilac' },
  { max: 345, dark: 'Burgundy', mid: 'Fuchsia', light: 'Pink' },
  { max: 360, dark: 'Crimson', mid: 'Ruby', light: 'Blush' },
];

// Achromatic names (low saturation)
const ACHROMATIC: Array<{ maxL: number; name: string }> = [
  { maxL: 12, name: 'Noir' },
  { maxL: 28, name: 'Charcoal' },
  { maxL: 50, name: 'Slate' },
  { maxL: 70, name: 'Silver' },
  { maxL: 88, name: 'Mist' },
  { maxL: 100, name: 'Pearl' },
];

// Modifiers chosen by perceptual properties (not arbitrary hue math)
const MODIFIERS_DARK = ['Abyss', 'Eclipse', 'Nightfall', 'Obsidian', 'Shadow', 'Void'];
const MODIFIERS_DIM = ['Dusk', 'Solstice', 'Twilight', 'Depth', 'Ember'];
const MODIFIERS_MID = ['Bloom', 'Drift', 'Haze', 'Reverie', 'Veil'];
const MODIFIERS_BRIGHT = ['Dawn', 'Glow', 'Radiance', 'Shimmer', 'Soleil'];
const MODIFIERS_PALE = ['Frost', 'Whisper', 'Opal', 'Vapor', 'Cloud'];
const MODIFIERS_VIVID = ['Blaze', 'Flare', 'Prism', 'Surge', 'Vivid'];
const MODIFIERS_MUTED = ['Ash', 'Dust', 'Fade', 'Smoke', 'Stone'];

// Adjectives that precede a color name for variety ("Deep Ocean", "Wild Rose", …)
const ADJECTIVES = ['Deep', 'Gentle', 'Hidden', 'Infinite', 'Soft', 'Vivid', 'Wild'];

// Poetic suffixes (always follow a color name) — single-color templates
const POETIC_SUFFIXES = ['Dream', 'Eden', 'Horizon', 'Mirage', 'Reverie', 'Serenity', 'Solace'];

// Templates for warm-dominant gradients
const WARM_NAMES = ['Autumn Ember', 'Desert Heat', 'Golden Hour', 'Harvest Flame', 'Solar Flare', 'Sunburst', 'Wildfire'];
// Templates for cool-dominant gradients
const COOL_NAMES = ['Arctic Pulse', 'Cosmic Drift', 'Glacial Haze', 'Midnight Ocean', 'Northern Lights', 'Starlight', 'Stellar Void'];
// Templates for rainbow / high-variety gradients
const RAINBOW_NAMES = ['Aurora', 'Kaleidoscope', 'Opal Dream', 'Prism Bloom', 'Spectrum', 'Stained Glass', 'Sunrise Prism'];

// --- Helpers ---

/** Deterministic integer hash of all stop colors — same stops → same number. */
function colorHash(stops: ColorStop[]): number {
  const str = stops.map(s => s.color.toLowerCase()).join('');
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0); // unsigned 32-bit
}

/** Pick a deterministic item from an array using the hash plus an optional extra seed. */
function pick<T>(arr: T[], hash: number, seed = 0): T {
  return arr[(hash + seed) % arr.length];
}

/** Resolve a specific hue + lightness to a color name. */
function resolveColorName(h: number, s: number, l: number): string {
  // Achromatic
  if (s < 12) {
    const tier = ACHROMATIC.find(t => l <= t.maxL) ?? ACHROMATIC[ACHROMATIC.length - 1];
    return tier.name;
  }
  // Very dark or very light regardless of hue
  if (l < 8) return 'Midnight';
  if (l > 92) return 'Pearl';

  const tier = HUE_TIERS.find(t => h < t.max) ?? HUE_TIERS[0];
  if (l < 38) return tier.dark;
  if (l < 65) return tier.mid;
  return tier.light;
}

/** Choose a modifier that matches the dominant perceptual qualities of a color. */
function resolveModifier(h: number, s: number, l: number, hash: number, seed = 0): string {
  if (s > 75) return pick(MODIFIERS_VIVID, hash, seed);
  if (s < 20) return pick(MODIFIERS_MUTED, hash, seed);
  if (l < 20) return pick(MODIFIERS_DARK, hash, seed);
  if (l < 38) return pick(MODIFIERS_DIM, hash, seed);
  if (l < 62) return pick(MODIFIERS_MID, hash, seed);
  if (l < 80) return pick(MODIFIERS_BRIGHT, hash, seed);
  return pick(MODIFIERS_PALE, hash, seed);
}

/** Hue temperature: warm = reds/oranges/yellows (h < 55). Tight band so pink/violet are excluded. */
function isWarmHue(h: number): boolean {
  return h < 55 || h >= 345;
}

/** True cool hues: greens, teals, blues, indigo. Excludes purple/pink/magenta. */
function isCoolHue(h: number): boolean {
  return h >= 155 && h < 265;
}

export function generateGradientName(stops: ColorStop[]): string {
  if (stops.length === 0) return 'New Gradient';

  const hash = colorHash(stops);
  const hslList = stops.map(s => hexToHsl(s.color));

  // --- Single stop ---
  if (stops.length === 1) {
    const [h, s, l] = hslList[0];
    const colorName = resolveColorName(h, s, l);
    const modifier = resolveModifier(h, s, l, hash);
    // Alternate between three single-color templates
    const template = hash % 3;
    if (template === 0) return `${colorName} ${modifier}`;
    if (template === 1) return `${pick(ADJECTIVES, hash, 7)} ${colorName}`;
    return `${colorName} ${pick(POETIC_SUFFIXES, hash, 13)}`;
  }

  // --- Characterise the gradient ---
  const avgL = hslList.reduce((a, [, , l]) => a + l, 0) / hslList.length;
  const avgS = hslList.reduce((a, [, s]) => a + s, 0) / hslList.length;

  const [h0, s0, l0] = hslList[0];
  const [hN, sN, lN] = hslList[hslList.length - 1];

  const name0 = resolveColorName(h0, s0, l0);
  const nameN = resolveColorName(hN, sN, lN);

  const mod0 = resolveModifier(h0, s0, l0, hash, 0);
  const modN = resolveModifier(hN, sN, lN, hash, 5);

  const sameColorName = name0 === nameN;

  // Measure hue spread across ALL stops to detect rainbow-like gradients
  const hues = hslList.filter(([, s]) => s >= 15).map(([h]) => h);
  const hueSpread = hues.length > 1
    ? Math.max(...hues) - Math.min(...hues)
    : 0;

  // Rainbow / high variety: many distinct hues
  if (hues.length >= 3 && hueSpread > 160) {
    return pick(RAINBOW_NAMES, hash, 0);
  }

  // --- Mono-hue gradient: all chromatic stops share the same hue family ---
  // Catches cases where resolved color names differ (e.g. "Amethyst" vs "Periwinkle") but
  // the actual hues are close (< 35°). Use the most-saturated stop as representative.
  const chromaticHsls = hslList.filter(([, s]) => s >= 20);
  const nearMonochrome =
    hueSpread < 35 || (chromaticHsls.length >= 2 &&
      Math.max(...chromaticHsls.map(([h]) => h)) - Math.min(...chromaticHsls.map(([h]) => h)) < 35);

  if (sameColorName || nearMonochrome) {
    const dominant = hslList.reduce((best, curr) => curr[1] > best[1] ? curr : best);
    const domName = resolveColorName(dominant[0], dominant[1], dominant[2]);
    const dominantMod = resolveModifier(dominant[0], dominant[1], dominant[2], hash);
    const template = hash % 3;
    if (template === 0) return `${domName} ${dominantMod}`;
    if (template === 1) return `${pick(ADJECTIVES, hash, 3)} ${domName}`;
    return `${domName} ${pick(POETIC_SUFFIXES, hash, 17)}`;
  }

  // Warm-dominated gradient: all stops are clearly warm-hued and chromatic
  const chromatic = hslList.filter(([, s]) => s >= 20);
  const warmCount = chromatic.filter(([h]) => isWarmHue(h)).length;
  if (chromatic.length >= 2 && warmCount === chromatic.length && avgS > 35) {
    return pick(WARM_NAMES, hash, 0);
  }

  // Cool-dominated gradient: all stops are clearly cool-hued and chromatic
  const coolCount = chromatic.filter(([h]) => isCoolHue(h)).length;
  if (chromatic.length >= 2 && coolCount === chromatic.length && avgS > 35) {
    return pick(COOL_NAMES, hash, 0);
  }

  // --- Two distinct color names ---
  // Pick one of several evocative dual-color templates deterministically
  const dominantMod = avgL < 45
    ? pick(MODIFIERS_DIM, hash, 2)
    : avgS > 60
      ? pick(MODIFIERS_VIVID, hash, 2)
      : pick(MODIFIERS_MID, hash, 2);

  const template = hash % 6;
  switch (template) {
    case 0: return `${name0} ${modN}`;
    case 1: return `${nameN} ${mod0}`;
    case 2: return `${name0} & ${nameN}`;
    case 3: return `${name0} to ${nameN}`;
    case 4: return `${pick(ADJECTIVES, hash, 11)} ${name0} ${dominantMod}`;
    default: return `${name0} ${nameN} ${dominantMod}`;
  }
}

export function generateCss(gradient: Gradient): string {
  const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);
  const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');

  switch (gradient.type) {
    case 'linear':
      return `linear-gradient(${gradient.angle}deg, ${stopsStr})`;
    case 'radial':
      return `radial-gradient(circle, ${stopsStr})`;
    case 'conic':
      return `conic-gradient(from ${gradient.angle}deg, ${stopsStr})`;
  }
}

export function createDefaultGradient(): Gradient {
  return {
    id: generateId(),
    name: 'New Gradient',
    type: 'linear',
    angle: 135,
    stops: [
      { id: generateId(), color: '#6366f1', position: 0 },
      { id: generateId(), color: '#ec4899', position: 100 },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
