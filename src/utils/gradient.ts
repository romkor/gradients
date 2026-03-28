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

export function generateId(): string {
  return crypto.randomUUID();
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

function getColorName(hex: string): { hue: string; modifier: string } {
  const [h, s, l] = hexToHsl(hex);

  let hue = '';
  if (l < 15) hue = 'Midnight';
  else if (l > 85) hue = 'Pearl';
  else if (s < 15) {
    if (l < 40) hue = 'Charcoal';
    else if (l < 70) hue = 'Silver';
    else hue = 'Mist';
  } else if (h < 15 || h >= 345) hue = l > 60 ? 'Rose' : 'Crimson';
  else if (h < 40) hue = l > 60 ? 'Peach' : 'Amber';
  else if (h < 65) hue = l > 60 ? 'Cream' : 'Gold';
  else if (h < 150) hue = l > 60 ? 'Sage' : s > 60 ? 'Emerald' : 'Forest';
  else if (h < 185) hue = l > 60 ? 'Mint' : 'Teal';
  else if (h < 220) hue = l > 60 ? 'Sky' : 'Ocean';
  else if (h < 250) hue = l > 60 ? 'Periwinkle' : 'Indigo';
  else if (h < 290) hue = l > 60 ? 'Lavender' : 'Violet';
  else if (h < 330) hue = l > 60 ? 'Blush' : 'Magenta';
  else hue = 'Rose';

  const modifiers = ['Dusk', 'Dawn', 'Breeze', 'Glow', 'Haze', 'Bloom', 'Fade', 'Surge', 'Drift', 'Mist', 'Flare', 'Pulse'];
  const modifier = modifiers[Math.floor(h / 30) % modifiers.length];

  return { hue, modifier };
}

export function generateGradientName(stops: ColorStop[]): string {
  if (stops.length === 0) return 'New Gradient';
  if (stops.length === 1) {
    const { hue, modifier } = getColorName(stops[0].color);
    return `${hue} ${modifier}`;
  }

  const first = getColorName(stops[0].color);
  const last = getColorName(stops[stops.length - 1].color);

  if (first.hue === last.hue) {
    return `${first.hue} ${first.modifier}`;
  }

  const combos = [
    `${first.hue} ${last.modifier}`,
    `${first.hue} to ${last.hue}`,
    `${last.hue} ${first.modifier}`,
  ];
  return combos[Math.floor(Math.random() * combos.length)];
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
