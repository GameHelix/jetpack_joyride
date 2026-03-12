'use client';

import { motion } from 'framer-motion';
import { Difficulty } from '@/types/game';

interface Props {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  onStart: () => void;
  highScore: number;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

const DIFF_CONFIG: Record<Difficulty, { label: string; desc: string; color: string }> = {
  easy:   { label: 'EASY',   desc: 'Slow missiles, more coins', color: '#00ff88' },
  medium: { label: 'MEDIUM', desc: 'Balanced challenge',        color: '#ffd700' },
  hard:   { label: 'HARD',   desc: 'Fast & relentless',        color: '#ff2244' },
};

export default function StartScreen({
  difficulty, onDifficultyChange, onStart, highScore, soundEnabled, onSoundToggle,
}: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      {/* Backdrop blur panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md mx-4 rounded-2xl border border-cyan-500/40 bg-black/80 backdrop-blur-md p-8 flex flex-col items-center gap-6 shadow-[0_0_60px_rgba(0,212,255,0.15)]"
      >
        {/* Title */}
        <div className="text-center">
          <motion.h1
            animate={{ textShadow: ['0 0 20px #00d4ff', '0 0 40px #00d4ff', '0 0 20px #00d4ff'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl font-black tracking-widest text-cyan-400 uppercase font-mono leading-none"
          >
            JETPACK
          </motion.h1>
          <motion.h1
            animate={{ textShadow: ['0 0 20px #ff2244', '0 0 40px #ff2244', '0 0 20px #ff2244'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="text-5xl font-black tracking-widest text-red-400 uppercase font-mono leading-none"
          >
            JOYRIDE
          </motion.h1>
        </div>

        {/* High score */}
        {highScore > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-yellow-400 font-mono text-sm"
          >
            <span className="text-yellow-500">🏆</span>
            <span>BEST: <span className="font-bold text-yellow-300">{highScore.toLocaleString()}</span></span>
          </motion.div>
        )}

        {/* Difficulty selector */}
        <div className="w-full">
          <p className="text-cyan-600 font-mono text-xs uppercase tracking-widest mb-2 text-center">Difficulty</p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(DIFF_CONFIG) as [Difficulty, typeof DIFF_CONFIG[Difficulty]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => onDifficultyChange(key)}
                style={{
                  borderColor: difficulty === key ? cfg.color : 'transparent',
                  color: difficulty === key ? cfg.color : '#4a6070',
                  boxShadow: difficulty === key ? `0 0 14px ${cfg.color}55` : 'none',
                }}
                className="py-2 px-1 rounded-lg border-2 bg-black/50 font-mono text-sm font-bold transition-all duration-200 hover:opacity-90 flex flex-col items-center gap-0.5"
              >
                <span className="text-xs">{cfg.label}</span>
              </button>
            ))}
          </div>
          <p className="text-center text-xs mt-2 font-mono" style={{ color: DIFF_CONFIG[difficulty].color }}>
            {DIFF_CONFIG[difficulty].desc}
          </p>
        </div>

        {/* Controls hint */}
        <div className="w-full bg-cyan-950/40 rounded-lg p-3 border border-cyan-900/50">
          <p className="text-cyan-600 font-mono text-xs uppercase tracking-widest mb-2">Controls</p>
          <div className="grid grid-cols-2 gap-y-1 text-xs font-mono">
            <span className="text-cyan-500">SPACE / W / ↑</span><span className="text-gray-400">Thrust up</span>
            <span className="text-cyan-500">HOLD</span><span className="text-gray-400">Continuous thrust</span>
            <span className="text-cyan-500">P / ESC</span><span className="text-gray-400">Pause</span>
            <span className="text-cyan-500">TAP</span><span className="text-gray-400">Mobile thrust</span>
          </div>
        </div>

        {/* Buttons row */}
        <div className="flex gap-3 w-full">
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black font-mono text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(0,212,255,0.5)] transition-colors"
          >
            LAUNCH
          </motion.button>
          <motion.button
            onClick={onSoundToggle}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title={soundEnabled ? 'Mute' : 'Unmute'}
            className="w-12 rounded-xl border border-cyan-800 bg-black/50 text-xl flex items-center justify-center hover:border-cyan-500 transition-colors"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </motion.button>
        </div>

        {/* Decorative corner dots */}
        <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-cyan-500 opacity-70" />
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-cyan-500 opacity-70" />
        <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-red-500 opacity-70" />
        <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-red-500 opacity-70" />
      </motion.div>
    </div>
  );
}
