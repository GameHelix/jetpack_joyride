// ─────────────────────────────────────────────
//  Main game engine hook
// ─────────────────────────────────────────────

'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import {
  Player, Missile, Coin, PowerUpItem, Particle,
  BackgroundBuilding, BackgroundStar,
  GameState, PowerUpType, UIState, Difficulty,
} from '@/types/game';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, THRUST, MAX_FALL_SPEED, MAX_RISE_SPEED,
  PLAYER_X, PLAYER_WIDTH, PLAYER_HEIGHT, GROUND_Y, CEILING_Y,
  BASE_SPEED, MAX_SPEED, SPEED_RAMP,
  MISSILE_SPAWN_BASE, COIN_SPAWN_BASE, POWERUP_SPAWN_INTERVAL,
  COIN_SCORE, DISTANCE_SCORE_RATE,
  SHIELD_DURATION, MAGNET_DURATION, BOOST_DURATION, MAGNET_RADIUS,
  MAX_LIVES, INVINCIBLE_FRAMES, COIN_SIZE, POWERUP_SIZE,
} from '@/utils/constants';
import { rectIntersects, pointInCircle } from '@/utils/collision';
import { spawnMissile, spawnCoinPattern, spawnPowerUp } from '@/utils/spawner';
import {
  drawBackground, drawParticles, drawPlayer,
  drawMissile, drawCoin, drawPowerUp, drawCoinPop,
} from '@/utils/renderer';
import { useSound } from './useSound';

// ── Background generators ──────────────────────
function generateStars(): BackgroundStar[] {
  return Array.from({ length: 120 }, () => ({
    x: Math.random() * CANVAS_WIDTH,
    y: Math.random() * CANVAS_HEIGHT,
    size: Math.random() < 0.7 ? 1 : 2,
    brightness: Math.random() * 0.7 + 0.3,
  }));
}

function generateBuildings(count: number, yBase: number, palette: string[]): BackgroundBuilding[] {
  const buildings: BackgroundBuilding[] = [];
  let x = 0;
  for (let i = 0; i < count; i++) {
    const w = 40 + Math.random() * 90;
    const h = 50 + Math.random() * (yBase - 80);
    buildings.push({
      x,
      y: yBase - h,
      width: w,
      height: h,
      color: palette[Math.floor(Math.random() * palette.length)],
      windowRows: Math.floor(h / 20),
      windowCols: Math.floor(w / 18),
    });
    x += w + Math.random() * 20;
  }
  return buildings;
}

const FAR_PALETTE  = ['#080820', '#0a0a24', '#0c0c2a'];
const MID_PALETTE  = ['#0e0e30', '#111138', '#131340'];

export function useGameEngine(difficulty: Difficulty, soundEnabled: boolean) {
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const rafRef     = useRef<number>(0);
  const frameRef   = useRef(0);

  // ── Persistent background assets ────────────
  const starsRef         = useRef<BackgroundStar[]>(generateStars());
  const buildingsRef     = useRef<BackgroundBuilding[]>(generateBuildings(40, GROUND_Y, MID_PALETTE));
  const buildingsFarRef  = useRef<BackgroundBuilding[]>(generateBuildings(30, GROUND_Y, FAR_PALETTE));

  // ── Game objects ─────────────────────────────
  const playerRef   = useRef<Player>(createPlayer());
  const missilesRef = useRef<Missile[]>([]);
  const coinsRef    = useRef<Coin[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);

  // ── Game state (ref = perf, state = UI sync) ─
  const gameStateRef  = useRef<GameState>('start');
  const scoreRef      = useRef(0);
  const distanceRef   = useRef(0);
  const coinsCountRef = useRef(0);
  const livesRef      = useRef(MAX_LIVES);
  const speedRef      = useRef(BASE_SPEED[difficulty]);
  const scrollRef     = useRef(0);
  const thrustingRef  = useRef(false);
  const thrustTickRef = useRef(0); // throttle sound

  // ── Spawn timers ─────────────────────────────
  const missileTimerRef = useRef(MISSILE_SPAWN_BASE);
  const coinTimerRef    = useRef(20);
  const powerUpTimerRef = useRef(POWERUP_SPAWN_INTERVAL);

  // ── High score (localStorage) ─────────────────
  // Use both a ref (for sync access inside game loop) and state (for UI re-renders)
  const [highScore, setHighScore] = useState<number>(0);
  const highScoreRef = useRef<number>(0);

  // ── React UI state ───────────────────────────
  const [uiState, setUIState] = useState<UIState>({
    gameState: 'start',
    score: 0,
    highScore: 0,
    distance: 0,
    coins: 0,
    activePowerUp: 'none',
    powerUpTimeLeft: 0,
    lives: MAX_LIVES,
    difficulty,
    soundEnabled,
  });

  const { play, stopBGM } = useSound(soundEnabled);

  // ── Sync high score from localStorage ────────
  useEffect(() => {
    const stored = parseInt(localStorage.getItem('jj_highscore') ?? '0', 10);
    highScoreRef.current = stored;
    setHighScore(stored);
    setUIState(prev => ({ ...prev, highScore: stored }));
  }, []);

  // ── Player factory ────────────────────────────
  function createPlayer(): Player {
    return {
      x: PLAYER_X,
      y: CANVAS_HEIGHT / 2 - PLAYER_HEIGHT / 2,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      velocity: 0,
      isThrusting: false,
      frame: 0,
      frameTimer: 0,
      powerUp: 'none',
      powerUpTimer: 0,
      invincible: false,
      invincibleTimer: 0,
      particles: [],
    };
  }

  // ── Reset everything for a new run ────────────
  const resetGame = useCallback(() => {
    playerRef.current   = createPlayer();
    missilesRef.current  = [];
    coinsRef.current     = [];
    powerUpsRef.current  = [];
    scoreRef.current     = 0;
    distanceRef.current  = 0;
    coinsCountRef.current = 0;
    livesRef.current     = MAX_LIVES;
    speedRef.current     = BASE_SPEED[difficulty] ?? 5;
    scrollRef.current    = 0;
    frameRef.current     = 0;
    missileTimerRef.current = MISSILE_SPAWN_BASE;
    coinTimerRef.current    = 20;
    powerUpTimerRef.current = POWERUP_SPAWN_INTERVAL;
    thrustingRef.current    = false;
  }, [difficulty]);

  // ── Start / restart game ──────────────────────
  const startGame = useCallback(() => {
    resetGame();
    gameStateRef.current = 'playing';
    play('start');
    play('bgm');
    syncUI();
  }, [resetGame, play]);

  // ── Pause / resume ────────────────────────────
  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'playing') {
      gameStateRef.current = 'paused';
      stopBGM();
    } else if (gameStateRef.current === 'paused') {
      gameStateRef.current = 'playing';
      play('bgm');
    }
    syncUI();
  }, [play, stopBGM]);

  // ── Thrust (press/hold) ───────────────────────
  const setThrusting = useCallback((value: boolean) => {
    thrustingRef.current = value;
    playerRef.current.isThrusting = value;
  }, []);

  // ── Die ───────────────────────────────────────
  function die() {
    const p = playerRef.current;
    // Spawn death particles
    for (let i = 0; i < 20; i++) {
      p.particles.push({
        x: p.x + p.width / 2,
        y: p.y + p.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 40, maxLife: 40,
        size: Math.random() * 5 + 2,
        color: ['#ff4400', '#ff8800', '#ffcc00'][Math.floor(Math.random() * 3)],
      });
    }
    livesRef.current--;
    play('hit');
    if (livesRef.current <= 0) {
      // Game over — update high score and immediately sync UI so the overlay appears
      play('death');
      stopBGM();
      gameStateRef.current = 'gameover';
      const hs = Math.max(highScoreRef.current, Math.floor(scoreRef.current));
      highScoreRef.current = hs;
      localStorage.setItem('jj_highscore', String(hs));
      setHighScore(hs);
      syncUI(); // ← must call here; the game loop exits early on 'gameover' so syncUI
                //   would never run otherwise
    } else {
      // Flash invincible and respawn to center so the player doesn't keep touching
      // the floor/ceiling and re-trigger die() once invincibility expires
      p.invincible = true;
      p.invincibleTimer = INVINCIBLE_FRAMES;
      p.powerUp = 'none';
      p.powerUpTimer = 0;
      p.y = CEILING_Y + (GROUND_Y - CEILING_Y) / 2 - p.height / 2;
      p.velocity = 0;
    }
  }

  // ── Sync React UI from refs ───────────────────
  // Uses refs throughout so it's safe to call from any callback without stale-closure issues
  function syncUI() {
    const p = playerRef.current;
    setUIState({
      gameState: gameStateRef.current,
      score: Math.floor(scoreRef.current),
      highScore: highScoreRef.current, // ← ref, always current
      distance: Math.floor(distanceRef.current),
      coins: coinsCountRef.current,
      activePowerUp: p.powerUp,
      powerUpTimeLeft: p.powerUpTimer > 0
        ? p.powerUpTimer / getPowerUpDuration(p.powerUp)
        : 0,
      lives: livesRef.current,
      difficulty,
      soundEnabled,
    });
  }

  function getPowerUpDuration(t: PowerUpType) {
    if (t === 'shield') return SHIELD_DURATION;
    if (t === 'magnet') return MAGNET_DURATION;
    if (t === 'boost')  return BOOST_DURATION;
    return 1;
  }

  // ── Main game loop ────────────────────────────
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rafRef.current = requestAnimationFrame(gameLoop);

    const gs = gameStateRef.current;
    if (gs === 'start' || gs === 'gameover') {
      // Still draw background on start/gameover for visual richness
      drawBackground(ctx, scrollRef.current, starsRef.current, buildingsRef.current, buildingsFarRef.current);
      return;
    }
    if (gs === 'paused') {
      // Don't advance, just re-render current state
      renderFrame(ctx);
      return;
    }

    // ── Update ─────────────────────────────────
    frameRef.current++;
    const frame = frameRef.current;
    const speed = speedRef.current;

    // Ramp up speed
    speedRef.current = Math.min(MAX_SPEED, speed + SPEED_RAMP);
    scrollRef.current += speed;
    distanceRef.current += speed;
    scoreRef.current += DISTANCE_SCORE_RATE * speed;

    // Player physics
    const p = playerRef.current;
    if (thrustingRef.current) {
      p.velocity = Math.max(p.velocity + THRUST, MAX_RISE_SPEED);
      // Jetpack flame particles
      if (frame % 2 === 0) {
        p.particles.push({
          x: p.x + p.width - 4,
          y: p.y + p.height - 20,
          vx: 2 + Math.random() * 2,
          vy: (Math.random() - 0.5) * 3,
          life: 15, maxLife: 15,
          size: Math.random() * 5 + 2,
          color: ['#ff6600', '#ff9900', '#ffdd00', '#fff0aa'][Math.floor(Math.random() * 4)],
        });
      }
      // Thrust sound (throttled)
      thrustTickRef.current++;
      if (thrustTickRef.current % 6 === 0) play('thrust');
    } else {
      p.velocity = Math.min(p.velocity + GRAVITY, MAX_FALL_SPEED);
    }

    if (p.powerUp === 'boost') {
      p.velocity = Math.min(p.velocity, MAX_FALL_SPEED * 0.5);
    }

    p.y += p.velocity;

    // Clamp to play area
    if (p.y + p.height >= GROUND_Y) {
      p.y = GROUND_Y - p.height;
      p.velocity = 0;
      if (!p.invincible) die();
    }
    if (p.y <= CEILING_Y) {
      p.y = CEILING_Y;
      p.velocity = 0;
      if (!p.invincible) die();
    }

    // Invincible timer
    if (p.invincible) {
      p.invincibleTimer--;
      if (p.invincibleTimer <= 0) p.invincible = false;
    }

    // Power-up timer
    if (p.powerUp !== 'none') {
      p.powerUpTimer--;
      if (p.powerUpTimer <= 0) {
        p.powerUp = 'none';
        p.powerUpTimer = 0;
      }
    }

    // Update particles
    p.particles = p.particles
      .map(pt => ({ ...pt, x: pt.x + pt.vx, y: pt.y + pt.vy, life: pt.life - 1 }))
      .filter(pt => pt.life > 0);

    // ── Spawn objects ───────────────────────────
    missileTimerRef.current--;
    if (missileTimerRef.current <= 0) {
      const difficultyFactor = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 0.7 : 0.5;
      const scoreBonus = Math.max(0, 1 - scoreRef.current / 3000);
      missilesRef.current.push(spawnMissile(speed, scoreRef.current));
      missileTimerRef.current = Math.max(40, MISSILE_SPAWN_BASE * difficultyFactor * (0.5 + scoreBonus));
    }

    coinTimerRef.current--;
    if (coinTimerRef.current <= 0) {
      coinsRef.current.push(...spawnCoinPattern(speed));
      coinTimerRef.current = COIN_SPAWN_BASE;
    }

    powerUpTimerRef.current--;
    if (powerUpTimerRef.current <= 0) {
      powerUpsRef.current.push(spawnPowerUp());
      powerUpTimerRef.current = POWERUP_SPAWN_INTERVAL;
    }

    // ── Move missiles ───────────────────────────
    missilesRef.current = missilesRef.current
      .map(m => {
        if (!m.active) return m;
        let vx = m.velocityX;
        let vy = m.velocityY;
        // Homing: steer toward player
        if (m.type === 'homing') {
          const dx = p.x - m.x;
          const dy = (p.y + p.height / 2) - (m.y + m.height / 2);
          const dist = Math.hypot(dx, dy);
          if (dist > 1) {
            const steering = 0.04;
            vx += (dx / dist) * steering * Math.abs(vx);
            vy += (dy / dist) * steering * 2;
          }
        }
        return { ...m, x: m.x + vx, y: m.y + vy, velocityX: vx, velocityY: vy };
      })
      .filter(m => m.x + m.width > -50 && m.y > -200 && m.y < CANVAS_HEIGHT + 200);

    // ── Move coins ──────────────────────────────
    coinsRef.current = coinsRef.current
      .map(c => {
        if (!c.active) return c;
        let { x, y } = c;
        x -= speed;

        // Magnet attraction
        if (p.powerUp === 'magnet') {
          const cx = x + COIN_SIZE / 2;
          const cy = y + COIN_SIZE / 2;
          const pcx = p.x + p.width / 2;
          const pcy = p.y + p.height / 2;
          if (pointInCircle(cx, cy, pcx, pcy, MAGNET_RADIUS)) {
            const dx = pcx - cx;
            const dy = pcy - cy;
            const dist = Math.hypot(dx, dy);
            x += (dx / dist) * 6;
            y += (dy / dist) * 6;
          }
        }

        // Decrease pop timer
        const collectedTimer = c.collectedTimer > 0 ? c.collectedTimer - 1 : 0;
        return { ...c, x, y, collectedTimer };
      })
      .filter(c => c.x + COIN_SIZE > -20 || c.collected);

    // ── Move power-ups ──────────────────────────
    powerUpsRef.current = powerUpsRef.current
      .map(pu => ({ ...pu, x: pu.x - speed, angle: pu.angle + 0.04 }))
      .filter(pu => pu.x + POWERUP_SIZE > -20);

    // ── Collision: player ↔ missiles ────────────
    if (!p.invincible) {
      for (const m of missilesRef.current) {
        if (!m.active) continue;
        if (rectIntersects(p, m)) {
          if (p.powerUp === 'shield') {
            // Shield absorbs hit
            p.powerUp = 'none';
            p.powerUpTimer = 0;
            p.invincible = true;
            p.invincibleTimer = 60;
            m.active = false;
            play('hit');
          } else {
            m.active = false;
            die();
            break;
          }
        }
      }
    }

    // ── Collision: player ↔ coins ─────────────
    for (const c of coinsRef.current) {
      if (!c.active || c.collected) continue;
      if (rectIntersects(p, c, 0.1, 0.1)) {
        c.collected = true;
        c.collectedTimer = 20;
        coinsCountRef.current++;
        scoreRef.current += COIN_SCORE;
        play('coin');
      }
    }

    // ── Collision: player ↔ power-ups ────────
    for (const pu of powerUpsRef.current) {
      if (!pu.active) continue;
      if (rectIntersects(p, pu, 0.1, 0.1)) {
        pu.active = false;
        p.powerUp = pu.type;
        p.powerUpTimer =
          pu.type === 'shield' ? SHIELD_DURATION :
          pu.type === 'magnet' ? MAGNET_DURATION :
          BOOST_DURATION;
        play('powerup');
      }
    }

    // Sync UI every 10 frames
    if (frame % 10 === 0) syncUI();

    // ── Draw ────────────────────────────────────
    renderFrame(ctx);
  }, [difficulty, play, stopBGM, highScore]);

  function renderFrame(ctx: CanvasRenderingContext2D) {
    const frame = frameRef.current;
    const p = playerRef.current;

    drawBackground(ctx, scrollRef.current, starsRef.current, buildingsRef.current, buildingsFarRef.current);

    // Coins
    for (const c of coinsRef.current) {
      drawCoin(ctx, c, frame);
      drawCoinPop(ctx, c);
    }

    // Power-ups
    for (const pu of powerUpsRef.current) {
      drawPowerUp(ctx, pu, frame);
    }

    // Missiles
    for (const m of missilesRef.current) {
      drawMissile(ctx, m);
    }

    // Player particles (behind player)
    drawParticles(ctx, p.particles);

    // Player
    drawPlayer(ctx, p, frame);

    // Magnet field hint
    if (p.powerUp === 'magnet') {
      ctx.save();
      ctx.globalAlpha = 0.12 + Math.sin(frame * 0.1) * 0.06;
      ctx.strokeStyle = '#ff44ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2, p.y + p.height / 2, MAGNET_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  // ── Start / stop rAF ─────────────────────────
  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      stopBGM();
    };
  }, [gameLoop, stopBGM]);

  // ── Keyboard input ────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (gameStateRef.current === 'start' || gameStateRef.current === 'gameover') {
          startGame();
        } else if (gameStateRef.current === 'playing') {
          setThrusting(true);
        }
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameStateRef.current === 'playing' || gameStateRef.current === 'paused') {
          togglePause();
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        setThrusting(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [startGame, setThrusting, togglePause]);

  return {
    canvasRef,
    uiState,
    startGame,
    togglePause,
    setThrusting,
  };
}
