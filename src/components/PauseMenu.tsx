'use client';

import { motion } from 'framer-motion';

interface Props {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

export default function PauseMenu({ onResume, onRestart, onMenu, soundEnabled, onSoundToggle }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-xs mx-4 rounded-2xl border border-cyan-500/30 bg-black/90 p-7 flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(0,212,255,0.1)]"
      >
        <div className="text-center mb-1">
          <div className="text-cyan-600 font-mono text-xs uppercase tracking-[0.3em] mb-1">— PAUSED —</div>
          <h2 className="text-3xl font-black font-mono text-cyan-400 uppercase tracking-widest">
            HOLD ON
          </h2>
        </div>

        <div className="flex flex-col gap-2 w-full">
          {[
            { label: 'RESUME',  fn: onResume,  primary: true  },
            { label: 'RESTART', fn: onRestart, primary: false },
            { label: 'MENU',    fn: onMenu,    primary: false },
          ].map(({ label, fn, primary }) => (
            <motion.button
              key={label}
              onClick={fn}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={[
                'w-full py-3 rounded-xl font-black font-mono text-sm uppercase tracking-widest transition-colors',
                primary
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_16px_rgba(0,212,255,0.4)]'
                  : 'border border-cyan-800 hover:border-cyan-500 text-cyan-600 hover:text-cyan-400',
              ].join(' ')}
            >
              {label}
            </motion.button>
          ))}
        </div>

        {/* Sound toggle */}
        <button
          onClick={onSoundToggle}
          className="flex items-center gap-2 text-sm font-mono text-cyan-700 hover:text-cyan-400 transition-colors mt-1"
        >
          <span className="text-lg">{soundEnabled ? '🔊' : '🔇'}</span>
          <span>{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
        </button>

        <div className="text-xs font-mono text-cyan-900 uppercase tracking-widest">
          Press P or ESC to resume
        </div>
      </motion.div>
    </div>
  );
}
