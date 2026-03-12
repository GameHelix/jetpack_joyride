// ─────────────────────────────────────────────
//  Root page — full-screen game wrapper
// ─────────────────────────────────────────────

import Game from '@/components/Game';

export default function HomePage() {
  return (
    <main className="w-screen h-screen flex items-center justify-center bg-[#050514] overflow-hidden">
      <Game />
    </main>
  );
}
