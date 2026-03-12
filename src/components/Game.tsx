'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Difficulty } from '@/types/game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_LIVES } from '@/utils/constants';
import { useGameEngine } from '@/hooks/useGameEngine';
import StartScreen from './StartScreen';
import GameOverScreen from './GameOverScreen';
import PauseMenu from './PauseMenu';
import HUD from './HUD';
import MobileControls from './MobileControls';

export default function Game() {
  // ── User preferences ──────────────────────────
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const {
    canvasRef,
    uiState,
    startGame,
    togglePause,
    setThrusting,
  } = useGameEngine(difficulty, soundEnabled);

  const prevScoreRef = useRef(0);

  // Track if current game over is a new high score
  const isNewHighScore =
    uiState.gameState === 'gameover' &&
    uiState.score > 0 &&
    uiState.score >= uiState.highScore &&
    uiState.highScore > 0;

  const handleRestart = useCallback(() => {
    prevScoreRef.current = uiState.score;
    startGame();
  }, [startGame, uiState.score]);

  const handleMenu = useCallback(() => {
    // Return to start screen: reload page or just reset state
    // We simply call startGame then immediately reach a way to show start screen.
    // Simplest: set internal state via a separate flag.
    window.location.reload();
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  // ── Canvas responsiveness ─────────────────────
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const measure = () => {
      if (!wrapperRef.current) return;
      const parent = wrapperRef.current.parentElement;
      if (!parent) return;
      const maxW = parent.clientWidth - 16;  // 8px padding each side
      const maxH = parent.clientHeight - 16;
      const scaleX = maxW / CANVAS_WIDTH;
      const scaleY = maxH / CANVAS_HEIGHT;
      setScale(Math.min(1, scaleX, scaleY));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div
      className="relative flex items-center justify-center w-full h-full"
      style={{ touchAction: 'none' }}
    >
      {/* ── Scaled canvas wrapper ──────────────── */}
      <div
        ref={wrapperRef}
        className="relative"
        style={{
          width:  CANVAS_WIDTH  * scale,
          height: CANVAS_HEIGHT * scale,
          transformOrigin: 'center',
        }}
      >
        {/* Outer neon border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-30"
          style={{
            boxShadow:
              '0 0 0 2px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.08), inset 0 0 40px rgba(0,0,0,0.6)',
            borderRadius: '1rem',
          }}
        />

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            display: 'block',
            borderRadius: '1rem',
            width:  CANVAS_WIDTH  * scale,
            height: CANVAS_HEIGHT * scale,
            imageRendering: 'pixelated',
          }}
        />

        {/* ── Overlays ────────────────────────── */}
        <AnimatePresence>
          {uiState.gameState === 'start' && (
            <StartScreen
              key="start"
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              onStart={startGame}
              highScore={uiState.highScore}
              soundEnabled={soundEnabled}
              onSoundToggle={toggleSound}
            />
          )}

          {uiState.gameState === 'gameover' && (
            <GameOverScreen
              key="gameover"
              score={uiState.score}
              highScore={uiState.highScore}
              distance={uiState.distance}
              coins={uiState.coins}
              isNewHighScore={isNewHighScore}
              onRestart={handleRestart}
              onMenu={handleMenu}
            />
          )}

          {uiState.gameState === 'paused' && (
            <PauseMenu
              key="pause"
              onResume={togglePause}
              onRestart={handleRestart}
              onMenu={handleMenu}
              soundEnabled={soundEnabled}
              onSoundToggle={toggleSound}
            />
          )}
        </AnimatePresence>

        {/* ── HUD (shown during play + pause) ─── */}
        {(uiState.gameState === 'playing' || uiState.gameState === 'paused') && (
          <HUD
            score={uiState.score}
            highScore={uiState.highScore}
            distance={uiState.distance}
            coins={uiState.coins}
            lives={uiState.lives}
            maxLives={MAX_LIVES}
            activePowerUp={uiState.activePowerUp}
            powerUpTimeLeft={uiState.powerUpTimeLeft}
            soundEnabled={soundEnabled}
            onSoundToggle={toggleSound}
            onPause={togglePause}
          />
        )}

        {/* ── Mobile touch controls ─────────────── */}
        <MobileControls
          onThrustStart={() => {
            if (uiState.gameState === 'start' || uiState.gameState === 'gameover') {
              startGame();
            } else {
              setThrusting(true);
            }
          }}
          onThrustEnd={() => setThrusting(false)}
          onPause={togglePause}
          isPlaying={uiState.gameState === 'playing'}
        />
      </div>

      {/* ── Bottom hints (desktop only) ─────────── */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="font-mono text-xs text-cyan-900 tracking-wider">
          SPACE / W / ↑ to thrust &nbsp;·&nbsp; P to pause
        </p>
      </div>
    </div>
  );
}
