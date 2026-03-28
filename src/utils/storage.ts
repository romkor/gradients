import type { Gradient } from './gradient';

const STORAGE_KEY = 'gradients-app-data';

export function loadGradients(): Gradient[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGradients(gradients: Gradient[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gradients));
}

export function saveGradient(gradient: Gradient): void {
  const gradients = loadGradients();
  const idx = gradients.findIndex(g => g.id === gradient.id);
  if (idx >= 0) {
    gradients[idx] = gradient;
  } else {
    gradients.push(gradient);
  }
  saveGradients(gradients);
}

export function deleteGradient(id: string): void {
  const gradients = loadGradients().filter(g => g.id !== id);
  saveGradients(gradients);
}

export function getGradient(id: string): Gradient | undefined {
  return loadGradients().find(g => g.id === id);
}
