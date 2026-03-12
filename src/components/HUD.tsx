'use client';

import { motion } from 'framer-motion';
import { PowerUpType } from '@/types/game';

interface Props {
  score: number;
  highScore: number;
  distance: number;
  coins: number;
  lives: number;
  maxLives: number;
  activePowerUp: PowerUpType;
  powerUpTimeLeft: number; // 0-1
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onPause: () => void;
}

const POWERUP_CONFIG: Record<PowerUpType, { icon: string; color: string; label: string }> = {
  shield: { icon: '🛡', color: '#00d4ff', label: 'SHIELD'  },
  magnet: { icon: '🧲', color: '#ff44ff', label: 'MAGNET'  },
  boost:  { icon: '⚡', color: '#00ff88', label: 'BOOST'   },
  none:   { icon: '',   color: 'transparent', label: ''    },
};

function Heart({ filled }: { filled: boolean }) {
  return (
    <span className={`text-base transition-all ${filled ? 'opacity-100' : 'opacity-20'}`}>
      ❤️
    </span>
  );
}

export default function HUD({
  score, highScore, distance, coins, lives, maxLives,
  activePowerUp, powerUpTimeLeft, soundEnabled, onSoundToggle, onPause,
}: Props) {
  const pwCfg = POWERUP_CONFIG[activePowerUp];

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Top bar */}
      <div className="flex items-start justify-between px-3 pt-2 gap-2">
        {/* Score + distance */}
        <div className="flex flex-col gap-0.5 min-w-[110px]">
          <motion.div
            key={score}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
            className="font-black font-mono text-2xl text-cyan-300 leading-none tabular-nums"
            style={{ textShadow: '0 0 12px rgba(0,212,255,0.7)' }}
          >
            {score.toLocaleString()}
          </motion.div>
          <div className="font-mono text-xs text-cyan-700 leading-none">{Math.floor(distance)}m</div>
        </div>

        {/* Best score (centre) */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="font-mono text-xs text-yellow-700 uppercase tracking-widest leading-none">BEST</div>
          <div className="font-mono font-bold text-base text-yellow-400 leading-none tabular-nums"
            style={{ textShadow: '0 0 8px rgba(255,215,0,0.5)' }}>
            {highScore.toLocaleString()}
          </div>
        </div>

        {/* Right: coins + buttons */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs text-yellow-500 font-bold">{coins}</span>
            <span className="text-sm">🪙</span>
            {/* Sound */}
            <button
              onClick={onSoundToggle}
              className="pointer-events-auto w-7 h-7 rounded-lg border border-cyan-900 bg-black/60 text-sm flex items-center justify-center hover:border-cyan-500 transition-colors ml-1"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            {/* Pause */}
            <button
              onClick={onPause}
              className="pointer-events-auto w-7 h-7 rounded-lg border border-cyan-900 bg-black/60 text-xs flex items-center justify-center hover:border-cyan-500 transition-colors font-mono font-bold text-cyan-600 hover:text-cyan-400"
            >
              II
            </button>
          </div>

          {/* Lives */}
          <div className="flex gap-0.5">
            {Array.from({ length: maxLives }).map((_, i) => (
              <Heart key={i} filled={i < lives} />
            ))}
          </div>
        </div>
      </div>

      {/* Active power-up bar (bottom-left) */}
      {activePowerUp !== 'none' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute bottom-20 left-3 flex items-center gap-2"
        >
          <span className="text-xl">{pwCfg.icon}</span>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs font-bold uppercase leading-none" style={{ color: pwCfg.color }}>
              {pwCfg.label}
            </span>
            {/* Timer bar */}
            <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: pwCfg.color, width: `${powerUpTimeLeft * 100}%`, boxShadow: `0 0 6px ${pwCfg.color}` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
