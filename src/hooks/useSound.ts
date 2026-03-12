// ─────────────────────────────────────────────
//  Web Audio API sound engine (no asset files)
// ─────────────────────────────────────────────

import { useRef, useCallback, useEffect } from 'react';

type SoundName = 'thrust' | 'coin' | 'powerup' | 'hit' | 'death' | 'start' | 'bgm';

export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const bgmNodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const bgmPlayingRef = useRef(false);

  // Lazy-init AudioContext (must be after user gesture)
  const getCtx = useCallback((): AudioContext | null => {
    if (!enabled) return null;
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, [enabled]);

  // ── One-shot synth sounds ───────────────────
  const playThrust = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [getCtx]);

  const playCoin = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }, [getCtx]);

  const playPowerUp = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const freqs = [440, 554, 659, 880];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      const t = ctx.currentTime + i * 0.07;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }, [getCtx]);

  const playHit = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const bufSize = ctx.sampleRate * 0.18;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }, [getCtx]);

  const playDeath = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    // Descending explosion
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const t = ctx.currentTime + i * 0.06;
      osc.frequency.setValueAtTime(300 - i * 60, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.35);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    }
  }, [getCtx]);

  const playStart = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const freqs = [330, 440, 550, 660];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = f;
      const t = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }, [getCtx]);

  // ── Background music (looping arpeggios) ──────
  const startBGM = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || bgmPlayingRef.current) return;
    bgmPlayingRef.current = true;

    // Simple neon arpeggio pattern
    const scale = [110, 138.6, 164.8, 220, 261.6, 329.6, 440];
    let step = 0;
    const bpm = 180;
    const interval = (60 / bpm) * 1000 * 0.5;

    function tick() {
      if (!bgmPlayingRef.current || !ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = scale[step % scale.length] * (step % 14 < 7 ? 1 : 2);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      step++;
      setTimeout(tick, interval);
    }
    tick();
  }, [getCtx]);

  const stopBGM = useCallback(() => {
    bgmPlayingRef.current = false;
    bgmNodesRef.current.forEach(({ osc, gain }) => {
      try { osc.stop(); } catch {}
    });
    bgmNodesRef.current = [];
  }, []);

  // Stop BGM when disabled
  useEffect(() => {
    if (!enabled) stopBGM();
  }, [enabled, stopBGM]);

  const play = useCallback((name: SoundName) => {
    if (!enabled) return;
    switch (name) {
      case 'thrust':  playThrust(); break;
      case 'coin':    playCoin();   break;
      case 'powerup': playPowerUp(); break;
      case 'hit':     playHit();   break;
      case 'death':   playDeath(); break;
      case 'start':   playStart(); break;
      case 'bgm':     startBGM();  break;
    }
  }, [enabled, playThrust, playCoin, playPowerUp, playHit, playDeath, playStart, startBGM]);

  return { play, stopBGM };
}
