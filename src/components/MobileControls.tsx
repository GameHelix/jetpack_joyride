'use client';

import { motion } from 'framer-motion';

interface Props {
  onThrustStart: () => void;
  onThrustEnd: () => void;
  onPause: () => void;
  isPlaying: boolean;
}

/**
 * Full-screen transparent touch zone — always rendered so the user can tap to
 * start, thrust, and restart without needing a keyboard.
 */
export default function MobileControls({ onThrustStart, onThrustEnd, onPause, isPlaying }: Props) {
  return (
    <>
      {/* Full-screen thrust / start zone — z-5 so UI overlays (z-10+) sit above it */}
      <div
        className="absolute inset-0 z-5 select-none touch-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        onTouchStart={e => { e.preventDefault(); onThrustStart(); }}
        onTouchEnd={e => { e.preventDefault(); onThrustEnd(); }}
        onTouchCancel={e => { e.preventDefault(); onThrustEnd(); }}
        onMouseDown={onThrustStart}
        onMouseUp={onThrustEnd}
        onMouseLeave={onThrustEnd}
      />

      {/* Pause button — only useful while actually playing */}
      {isPlaying && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onPause}
          className="absolute top-2 right-14 z-30 w-8 h-8 rounded-lg border border-cyan-800 bg-black/70 text-xs flex items-center justify-center font-mono font-bold text-cyan-600 hover:text-cyan-400 hover:border-cyan-500 transition-colors touch-none md:hidden"
        >
          II
        </motion.button>
      )}
    </>
  );
}
