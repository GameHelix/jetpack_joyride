// ─────────────────────────────────────────────
//  Object spawner – generates missiles, coins,
//  and power-ups procedurally
// ─────────────────────────────────────────────

import { Missile, Coin, PowerUpItem, MissileType, PowerUpType } from '@/types/game';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  GROUND_Y, CEILING_Y,
  MISSILE_WIDTH, MISSILE_HEIGHT,
  COIN_SIZE, POWERUP_SIZE,
} from './constants';

// ── helpers ────────────────────────────────────
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

// ── Missiles ───────────────────────────────────
export function spawnMissile(speed: number, score: number): Missile {
  const types: MissileType[] = ['horizontal'];
  if (score > 300) types.push('diagonal-up', 'diagonal-down');
  if (score > 800) types.push('homing');

  const type = types[randInt(0, types.length - 1)];

  const playH = GROUND_Y - CEILING_Y;
  const y = rand(CEILING_Y + 20, GROUND_Y - MISSILE_HEIGHT - 20);

  let vx = -(speed * rand(0.9, 1.3));
  let vy = 0;
  let angle = Math.PI;

  if (type === 'diagonal-up') {
    vy = -rand(1, 2.5);
    angle = Math.PI + Math.atan2(vy, Math.abs(vx));
  } else if (type === 'diagonal-down') {
    vy = rand(1, 2.5);
    angle = Math.PI - Math.atan2(vy, Math.abs(vx));
  }

  return {
    x: CANVAS_WIDTH + 20,
    y,
    width: MISSILE_WIDTH,
    height: MISSILE_HEIGHT,
    velocityX: vx,
    velocityY: vy,
    angle,
    type,
    warningAlpha: 0,
    active: true,
  };
}

// ── Coins ──────────────────────────────────────
/** Spawn a small cluster / arc / line of coins */
export function spawnCoinPattern(speed: number): Coin[] {
  const patterns = ['line', 'arc', 'zigzag', 'cluster'];
  const pattern = patterns[randInt(0, patterns.length - 1)];
  const coins: Coin[] = [];
  const baseY = rand(CEILING_Y + 40, GROUND_Y - 40);
  const startX = CANVAS_WIDTH + 20;

  const makeCoin = (x: number, y: number): Coin => ({
    x,
    y,
    width: COIN_SIZE,
    height: COIN_SIZE,
    collected: false,
    collectedTimer: 0,
    attracting: false,
    active: true,
  });

  if (pattern === 'line') {
    const count = randInt(5, 10);
    for (let i = 0; i < count; i++) {
      coins.push(makeCoin(startX + i * (COIN_SIZE + 12), baseY));
    }
  } else if (pattern === 'arc') {
    const count = randInt(7, 12);
    const radius = rand(50, 90);
    for (let i = 0; i < count; i++) {
      const t = (i / (count - 1)) * Math.PI;
      coins.push(makeCoin(
        startX + i * (COIN_SIZE + 10),
        baseY - Math.sin(t) * radius
      ));
    }
  } else if (pattern === 'zigzag') {
    const count = randInt(6, 10);
    for (let i = 0; i < count; i++) {
      const y = baseY + (i % 2 === 0 ? -30 : 30);
      coins.push(makeCoin(startX + i * (COIN_SIZE + 16), y));
    }
  } else {
    const count = randInt(4, 7);
    for (let i = 0; i < count; i++) {
      coins.push(makeCoin(
        startX + rand(0, 120),
        rand(CEILING_Y + 40, GROUND_Y - 40)
      ));
    }
  }

  return coins;
}

// ── Power-ups ──────────────────────────────────
export function spawnPowerUp(): PowerUpItem {
  const types: PowerUpType[] = ['shield', 'magnet', 'boost'];
  const type = types[randInt(0, types.length - 1)];

  return {
    x: CANVAS_WIDTH + 20,
    y: rand(CEILING_Y + 30, GROUND_Y - POWERUP_SIZE - 30),
    width: POWERUP_SIZE,
    height: POWERUP_SIZE,
    type,
    angle: 0,
    active: true,
  };
}
