// ─────────────────────────────────────────────
//  Game constants
// ─────────────────────────────────────────────

export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 520;

// ── Player physics ─────────────────────────────
export const GRAVITY = 0.38;
export const THRUST = -0.75;
export const MAX_FALL_SPEED = 10;
export const MAX_RISE_SPEED = -12;

// ── Player geometry ────────────────────────────
export const PLAYER_X = 160;
export const PLAYER_WIDTH = 54;
export const PLAYER_HEIGHT = 54;

// ── World ──────────────────────────────────────
export const GROUND_Y = CANVAS_HEIGHT - 70;   // top of ground band
export const CEILING_Y = 50;                   // bottom of ceiling band
export const PLAY_HEIGHT = GROUND_Y - CEILING_Y;

// ── Speed / difficulty ─────────────────────────
export const BASE_SPEED: Record<string, number> = {
  easy: 3.5,
  medium: 5,
  hard: 7,
};
export const MAX_SPEED = 12;
export const SPEED_RAMP = 0.0006; // added per frame

// ── Spawning intervals (frames) ────────────────
export const MISSILE_SPAWN_BASE = 140;
export const COIN_SPAWN_BASE = 60;
export const POWERUP_SPAWN_INTERVAL = 600;

// ── Scoring ────────────────────────────────────
export const COIN_SCORE = 10;
export const DISTANCE_SCORE_RATE = 0.05; // per px scrolled

// ── Power-up durations (frames) ────────────────
export const SHIELD_DURATION = 420;
export const MAGNET_DURATION = 360;
export const BOOST_DURATION = 200;
export const MAGNET_RADIUS = 160;

// ── Object sizes ───────────────────────────────
export const MISSILE_WIDTH = 64;
export const MISSILE_HEIGHT = 22;
export const COIN_SIZE = 18;
export const POWERUP_SIZE = 32;

// ── Lives ──────────────────────────────────────
export const MAX_LIVES = 3;
export const INVINCIBLE_FRAMES = 120;

// ── Neon colour palette ────────────────────────
export const COLORS = {
  bg:          '#050514',
  bgFar:       '#0a0a20',
  bgMid:       '#0d0d2b',
  ceiling:     '#0e0e30',
  ground:      '#0e0e30',
  gridLine:    '#1a1a4a',
  ceilingGlow: '#00ccff',
  groundGlow:  '#00ccff',

  player:      '#00d4ff',
  playerBody:  '#005577',
  jetpack:     '#334455',
  flame:       ['#ff6600', '#ff9900', '#ffdd00', '#fff0aa'],

  missile:     '#ff2244',
  missileGlow: '#ff0000',
  zapper:      '#ff44bb',

  coin:        '#ffd700',
  coinGlow:    '#ffaa00',

  shieldItem:  '#00ffff',
  magnetItem:  '#ff44ff',
  boostItem:   '#00ff88',

  shieldBubble: 'rgba(0,210,255,0.25)',
  shieldRing:   '#00d4ff',

  hud:         '#00d4ff',
  hudDim:      '#005577',
  scoreGold:   '#ffd700',
  text:        '#e0f8ff',
} as const;
