'use client';

import { motion } from 'framer-motion';

interface Props {
  score: number;
  highScore: number;
  distance: number;
  coins: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({
  score, highScore, distance, coins, isNewHighScore, onRestart, onMenu,
}: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-sm mx-4 rounded-2xl border border-red-500/40 bg-black/85 backdrop-blur-md p-7 flex flex-col items-center gap-5 shadow-[0_0_60px_rgba(255,34,68,0.2)]"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-red-400 font-mono text-xs uppercase tracking-[0.3em] mb-1"
          >
            — MISSION FAILED —
          </motion.div>
          <h2 className="text-4xl font-black font-mono text-white uppercase tracking-wider">
            GAME OVER
          </h2>
        </div>

        {/* New high score banner */}
        {isNewHighScore && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full rounded-lg bg-yellow-500/20 border border-yellow-400/50 py-2 text-center"
          >
            <span className="font-mono font-black text-yellow-300 text-sm uppercase tracking-widest">
              🏆 New High Score!
            </span>
          </motion.div>
        )}

        {/* Stats */}
        <div className="w-full grid grid-cols-2 gap-2">
          {[
            { label: 'SCORE',    value: score.toLocaleString(),    color: '#00d4ff' },
            { label: 'BEST',     value: highScore.toLocaleString(),color: '#ffd700' },
            { label: 'DISTANCE', value: `${Math.floor(distance)}m`,color: '#00ff88' },
            { label: 'COINS',    value: coins.toLocaleString(),    color: '#ffd700' },
          ].map(({ label, value, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 rounded-lg p-3 text-center border border-white/10"
            >
              <div className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-0.5">{label}</div>
              <div className="font-mono font-black text-lg" style={{ color }}>{value}</div>
            </motion.div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <motion.button
            onClick={onRestart}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black font-mono text-base uppercase tracking-widest shadow-[0_0_18px_rgba(0,212,255,0.4)] transition-colors"
          >
            RETRY
          </motion.button>
          <motion.button
            onClick={onMenu}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-3 rounded-xl border border-cyan-800 hover:border-cyan-500 text-cyan-500 font-black font-mono text-base uppercase tracking-widest transition-colors"
          >
            MENU
          </motion.button>
        </div>

        {/* Corner accents */}
        <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-red-500 opacity-80" />
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-red-500 opacity-80" />
        <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-cyan-500 opacity-60" />
        <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-cyan-500 opacity-60" />
      </motion.div>
    </div>
  );
}
