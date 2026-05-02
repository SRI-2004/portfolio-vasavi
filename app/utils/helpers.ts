/**
 * Preload images to ensure they're ready before spawning
 */
export async function preloadImages(imagePaths: string[]): Promise<void> {
  const promises = imagePaths.map(
    (src) =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
      })
  );

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error('Image preloading error:', error);
    // Don't reject - let page continue even if some images fail
  }
}

/**
 * Lerp (linear interpolation) helper
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if device is touch-enabled
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    (typeof window !== 'undefined' && window.ontouchstart !== undefined) ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
  );
}
