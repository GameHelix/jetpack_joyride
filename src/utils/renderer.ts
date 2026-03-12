// ─────────────────────────────────────────────
//  Canvas rendering helpers
// ─────────────────────────────────────────────

import {
  Player, Missile, Coin, PowerUpItem, Particle, BackgroundBuilding, BackgroundStar,
} from '@/types/game';
import { COLORS, CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, CEILING_Y, COIN_SIZE, POWERUP_SIZE } from './constants';

// ── Glow helper ────────────────────────────────
export function withGlow(
  ctx: CanvasRenderingContext2D,
  color: string,
  blur: number,
  fn: () => void
) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  fn();
  ctx.restore();
}

// ── Background ─────────────────────────────────
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  scrollOffset: number,
  stars: BackgroundStar[],
  buildings: BackgroundBuilding[],
  buildingsFar: BackgroundBuilding[]
) {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#03031a');
  grad.addColorStop(1, '#08082a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Stars (fixed)
  for (const s of stars) {
    const pulse = 0.6 + Math.sin(Date.now() * 0.002 + s.brightness * 10) * 0.4;
    ctx.globalAlpha = s.brightness * pulse;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
  ctx.globalAlpha = 1;

  // Far buildings (slow parallax)
  drawBuildings(ctx, buildingsFar, (scrollOffset * 0.2) % CANVAS_WIDTH);

  // Mid buildings (medium parallax)
  drawBuildings(ctx, buildings, (scrollOffset * 0.5) % CANVAS_WIDTH);

  // Grid floor
  drawGrid(ctx, scrollOffset);

  // Ceiling strip
  ctx.fillStyle = COLORS.ceiling;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CEILING_Y);
  withGlow(ctx, COLORS.ceilingGlow, 18, () => {
    ctx.strokeStyle = COLORS.ceilingGlow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CEILING_Y);
    ctx.lineTo(CANVAS_WIDTH, CEILING_Y);
    ctx.stroke();
  });

  // Ground strip
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
  withGlow(ctx, COLORS.groundGlow, 18, () => {
    ctx.strokeStyle = COLORS.groundGlow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();
  });
}

function drawGrid(ctx: CanvasRenderingContext2D, scrollOffset: number) {
  ctx.save();
  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.6;

  const spacing = 60;
  const offset = scrollOffset % spacing;

  // Vertical lines scrolling
  for (let x = -offset; x < CANVAS_WIDTH; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, CEILING_Y);
    ctx.lineTo(x, GROUND_Y);
    ctx.stroke();
  }
  // Horizontal lines
  for (let y = CEILING_Y; y <= GROUND_Y; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBuildings(
  ctx: CanvasRenderingContext2D,
  buildings: BackgroundBuilding[],
  offset: number
) {
  for (const b of buildings) {
    const x = ((b.x - offset) % (CANVAS_WIDTH * 2)) - 50;
    if (x > CANVAS_WIDTH + 100) continue;

    ctx.fillStyle = b.color;
    ctx.fillRect(x, b.y, b.width, b.height);

    // Windows
    ctx.fillStyle = 'rgba(0, 200, 255, 0.12)';
    const ww = b.width / (b.windowCols + 1);
    const wh = b.height / (b.windowRows + 1);
    for (let r = 0; r < b.windowRows; r++) {
      for (let c = 0; c < b.windowCols; c++) {
        if (Math.random() > 0.4) {
          ctx.fillRect(x + (c + 0.5) * ww, b.y + (r + 0.5) * wh, ww * 0.5, wh * 0.5);
        }
      }
    }
  }
}

// ── Particles ──────────────────────────────────
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Player ─────────────────────────────────────
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  frame: number
) {
  const { x, y, width, height, powerUp, invincible, invincibleTimer } = player;
  const cx = x + width / 2;
  const cy = y + height / 2;

  // Skip draw every other frame when invincible (flicker effect)
  if (invincible && Math.floor(invincibleTimer / 6) % 2 === 0) return;

  ctx.save();

  // Shield bubble
  if (powerUp === 'shield') {
    const r = width * 0.8;
    withGlow(ctx, COLORS.shieldRing, 20, () => {
      ctx.strokeStyle = COLORS.shieldRing;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = COLORS.shieldBubble;
      ctx.fill();
    });
  }

  // Jetpack body
  ctx.shadowColor = '#005577';
  ctx.shadowBlur = 10;
  ctx.fillStyle = COLORS.jetpack;
  ctx.beginPath();
  ctx.roundRect(x + width - 16, y + 10, 14, height - 18, 4);
  ctx.fill();

  // Jetpack nozzle flame outline
  ctx.fillStyle = '#223344';
  ctx.fillRect(x + width - 18, y + height - 26, 8, 14);

  // Character body
  const bodyGrad = ctx.createLinearGradient(x, y, x + width * 0.7, y + height);
  bodyGrad.addColorStop(0, '#007799');
  bodyGrad.addColorStop(1, '#004466');
  ctx.fillStyle = bodyGrad;
  ctx.shadowColor = COLORS.player;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 8, width - 18, height - 12, 8);
  ctx.fill();

  // Visor
  ctx.fillStyle = '#00d4ff';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 12, width * 0.42, height * 0.3, 6);
  ctx.fill();

  // Visor glare
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x + 9, y + 15, 7, 4);

  // Boots
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#002233';
  ctx.fillRect(x + 4, y + height - 14, 18, 10);
  ctx.fillRect(x + 24, y + height - 14, 18, 10);

  // Boost tint overlay
  if (powerUp === 'boost') {
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 8, width - 18, height - 12, 8);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ── Missiles ───────────────────────────────────
export function drawMissile(ctx: CanvasRenderingContext2D, m: Missile) {
  if (!m.active) return;
  const cx = m.x + m.width / 2;
  const cy = m.y + m.height / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(m.angle - Math.PI);

  withGlow(ctx, COLORS.missileGlow, 22, () => {
    // Body
    const bodyGrad = ctx.createLinearGradient(-m.width / 2, 0, m.width / 2, 0);
    bodyGrad.addColorStop(0, '#cc0022');
    bodyGrad.addColorStop(0.5, '#ff3355');
    bodyGrad.addColorStop(1, '#ff5577');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-m.width / 2, -m.height / 2, m.width * 0.8, m.height, 4);
    ctx.fill();

    // Nose cone
    ctx.fillStyle = '#ff7799';
    ctx.beginPath();
    ctx.moveTo(m.width * 0.3, 0);
    ctx.lineTo(-m.width * 0.1, -m.height / 2);
    ctx.lineTo(-m.width * 0.1, m.height / 2);
    ctx.closePath();
    ctx.fill();

    // Fins
    ctx.fillStyle = '#aa0022';
    ctx.beginPath();
    ctx.moveTo(-m.width / 2, -m.height / 2);
    ctx.lineTo(-m.width / 2 - 10, -m.height);
    ctx.lineTo(-m.width / 2 + 6, -m.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-m.width / 2, m.height / 2);
    ctx.lineTo(-m.width / 2 - 10, m.height);
    ctx.lineTo(-m.width / 2 + 6, m.height / 2);
    ctx.closePath();
    ctx.fill();

    // Engine glow
    ctx.fillStyle = '#ff6600';
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(-m.width / 2 - 4, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// ── Coins ──────────────────────────────────────
export function drawCoin(ctx: CanvasRenderingContext2D, coin: Coin, time: number) {
  if (!coin.active || coin.collected) return;
  const cx = coin.x + COIN_SIZE / 2;
  const cy = coin.y + COIN_SIZE / 2 + Math.sin(time * 0.04 + coin.x * 0.05) * 3;
  const scaleX = Math.abs(Math.cos(time * 0.06 + coin.x * 0.03));

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scaleX + 0.05, 1);

  withGlow(ctx, COLORS.coinGlow, 16, () => {
    const grad = ctx.createRadialGradient(0, -COIN_SIZE * 0.2, 0, 0, 0, COIN_SIZE / 2);
    grad.addColorStop(0, '#ffe066');
    grad.addColorStop(0.6, '#ffd700');
    grad.addColorStop(1, '#cc9900');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, COIN_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Dollar sign
    ctx.fillStyle = '#886600';
    ctx.font = `bold ${COIN_SIZE * 0.55}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
  });

  ctx.restore();
}

// ── Power-up items ─────────────────────────────
const POWERUP_ICONS: Record<string, string> = {
  shield: '🛡',
  magnet: '🧲',
  boost:  '⚡',
};
const POWERUP_GLOW: Record<string, string> = {
  shield: COLORS.shieldItem,
  magnet: COLORS.magnetItem,
  boost:  COLORS.boostItem,
};
const POWERUP_FILL: Record<string, string> = {
  shield: '#003344',
  magnet: '#330033',
  boost:  '#003322',
};

export function drawPowerUp(ctx: CanvasRenderingContext2D, p: PowerUpItem, time: number) {
  if (!p.active) return;
  const cx = p.x + POWERUP_SIZE / 2;
  const cy = p.y + POWERUP_SIZE / 2 + Math.sin(time * 0.05 + p.x * 0.02) * 4;

  ctx.save();
  ctx.translate(cx, cy);

  const glow = POWERUP_GLOW[p.type] ?? '#ffffff';
  const fill = POWERUP_FILL[p.type] ?? '#111';

  withGlow(ctx, glow, 25, () => {
    // Outer rotating ring
    ctx.rotate(time * 0.04);
    ctx.strokeStyle = glow;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, POWERUP_SIZE * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.rotate(-time * 0.04);

    // Background circle
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(0, 0, POWERUP_SIZE * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = glow;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Icon
  ctx.font = `${POWERUP_SIZE * 0.62}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(POWERUP_ICONS[p.type] ?? '?', 0, 1);

  ctx.restore();
}

// ── Coin collected pop ─────────────────────────
export function drawCoinPop(ctx: CanvasRenderingContext2D, coin: Coin) {
  if (!coin.collected || coin.collectedTimer <= 0) return;
  const t = 1 - coin.collectedTimer / 20;
  const cx = coin.x + COIN_SIZE / 2;
  const cy = coin.y + COIN_SIZE / 2 - t * 30;

  ctx.save();
  ctx.globalAlpha = 1 - t;
  ctx.fillStyle = COLORS.scoreGold;
  ctx.font = `bold 14px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`+${10}`, cx, cy);
  ctx.restore();
}
