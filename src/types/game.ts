// ─────────────────────────────────────────────
//  Core game types for Jetpack Joyride
// ─────────────────────────────────────────────

export type GameState = 'start' | 'playing' | 'paused' | 'gameover';
export type PowerUpType = 'shield' | 'magnet' | 'boost' | 'none';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type MissileType = 'horizontal' | 'diagonal-up' | 'diagonal-down' | 'homing';

// ── Core geometry ──────────────────────────────
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ── Game objects ───────────────────────────────
export interface Player extends Rect {
  velocity: number;
  isThrusting: boolean;
  frame: number;
  frameTimer: number;
  /** Active power-up type */
  powerUp: PowerUpType;
  powerUpTimer: number;
  /** Brief invincibility flash after getting hit with no shield */
  invincible: boolean;
  invincibleTimer: number;
  /** Particle list for jetpack flames */
  particles: Particle[];
}

export interface Missile extends Rect {
  velocityX: number;
  velocityY: number;
  angle: number;
  type: MissileType;
  warningAlpha: number; // flashes before it appears
  active: boolean;
}

export interface Coin extends Rect {
  collected: boolean;
  collectedTimer: number; // for pop animation
  attracting: boolean;    // being pulled by magnet
  active: boolean;
}

export interface PowerUpItem extends Rect {
  type: PowerUpType;
  angle: number;
  active: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

// ── Background layers ──────────────────────────
export interface BackgroundStar {
  x: number;
  y: number;
  size: number;
  brightness: number;
}

export interface BackgroundBuilding {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  windowRows: number;
  windowCols: number;
}

// ── High-level game state (for React UI) ──────
export interface UIState {
  gameState: GameState;
  score: number;
  highScore: number;
  distance: number;
  coins: number;
  activePowerUp: PowerUpType;
  powerUpTimeLeft: number; // 0-1 ratio
  lives: number;
  difficulty: Difficulty;
  soundEnabled: boolean;
}
