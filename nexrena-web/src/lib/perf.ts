/**
 * Performance tier detection.
 * Used to gate expensive animations and canvas effects across the site.
 *
 * Tiers:
 *  'minimal' — prefers-reduced-motion is set; skip all motion
 *  'reduced' — low hardware concurrency (≤2 logical cores); use simplified effects
 *  'full'    — capable device; full experience
 */
export type MotionTier = 'full' | 'reduced' | 'minimal';

export function getMotionTier(): MotionTier {
  if (typeof window === 'undefined') return 'full';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'minimal';
  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores <= 2) return 'reduced';
  return 'full';
}

export function isFullMotion(): boolean {
  return getMotionTier() === 'full';
}

/** True if the device can sustain the WebGL hero shader. */
export function canUseWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  if (getMotionTier() === 'minimal') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

/** True if heavy Canvas 2D background animations should run. */
export function canUseCanvas(): boolean {
  return getMotionTier() !== 'minimal';
}
