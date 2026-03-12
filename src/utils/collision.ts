// ─────────────────────────────────────────────
//  Collision detection utilities
// ─────────────────────────────────────────────

import { Rect } from '@/types/game';

/**
 * Axis-Aligned Bounding Box check with optional shrink for fairness.
 * shrink = fraction to shrink each dimension (0.2 = 20% smaller hitbox)
 */
export function rectIntersects(a: Rect, b: Rect, shrinkA = 0.2, shrinkB = 0.2): boolean {
  const ax1 = a.x + a.width * shrinkA;
  const ay1 = a.y + a.height * shrinkA;
  const ax2 = a.x + a.width * (1 - shrinkA);
  const ay2 = a.y + a.height * (1 - shrinkA);

  const bx1 = b.x + b.width * shrinkB;
  const by1 = b.y + b.height * shrinkB;
  const bx2 = b.x + b.width * (1 - shrinkB);
  const by2 = b.y + b.height * (1 - shrinkB);

  return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
}

/** Point-in-circle test (used for magnet attraction) */
export function pointInCircle(
  px: number, py: number,
  cx: number, cy: number,
  radius: number
): boolean {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}
