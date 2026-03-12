'use client';

import { motion } from 'framer-motion';

interface Props {
  onThrustStart: () => void;
  onThrustEnd: () => void;
  onPause: () => void;
  isPlaying: boolean;
}

/**
 * Large transparent touch zone for mobile players.
 * The entire canvas area acts as the thrust button;
 * a small overlay shows the hint the first time.
 */
export default function MobileControls({ onThrustStart, onThrustEnd, onPause, isPlaying }: Props) {
  if (!isPlaying) return null;

  return (
    <>
      {/* Full-screen thrust zone (transparent) */}
      <div
        className="absolute inset-0 z-10 select-none touch-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        onTouchStart={e => { e.preventDefault(); onThrustStart(); }}
        onTouchEnd={e => { e.preventDefault(); onThrustEnd(); }}
        onTouchCancel={e => { e.preventDefault(); onThrustEnd(); }}
        // Mouse fallback for desktop testing without keyboard
        onMouseDown={onThrustStart}
        onMouseUp={onThrustEnd}
        onMouseLeave={onThrustEnd}
      />

      {/* Pause button overlay – visible on touch devices */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onPause}
        className="absolute top-2 right-14 z-30 w-8 h-8 rounded-lg border border-cyan-800 bg-black/70 text-xs flex items-center justify-center font-mono font-bold text-cyan-600 hover:text-cyan-400 hover:border-cyan-500 transition-colors touch-none md:hidden"
      >
        II
      </motion.button>
    </>
  );
}
