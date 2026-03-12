# 🚀 Jetpack Joyride — Neon Edition

A fast-paced, neon cyberpunk arcade game built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **HTML5 Canvas**. Fly your jetpack-powered character through a glowing cyberpunk city, dodge homing missiles, collect gold coins, and grab power-ups as the world speeds up around you.

---

## ✨ Features

- **Smooth Canvas gameplay** at 60 fps via `requestAnimationFrame`
- **Neon cyberpunk visual theme** — glowing particles, parallax city scrolling, grid floor
- **3 difficulty levels** — Easy / Medium / Hard (speed, missile frequency)
- **4 obstacle types** — horizontal missiles, diagonal (up/down), and homing missiles
- **Procedural coin patterns** — lines, arcs, zigzags, clusters
- **3 power-ups**
  - 🛡 **Shield** — absorbs one missile hit
  - 🧲 **Magnet** — attracts nearby coins automatically
  - ⚡ **Boost** — reduces gravity for nimble maneuvering
- **Jetpack flame particles** — dynamic fire effect on thrust
- **Lives system** — 3 lives per run with invincibility flash on hit
- **High score persistence** via `localStorage`
- **Synthesized sound effects & chiptune BGM** — zero asset files, pure Web Audio API
- **Sound on/off toggle**
- **Pause / resume** (keyboard `P` / `ESC` or HUD button)
- **Animated overlays** — Start screen, Pause menu, Game Over screen (framer-motion)
- **Fully responsive** — scales to any viewport with no horizontal scroll
- **Mobile-first touch controls** — tap / hold anywhere on screen to thrust
- **Vercel deploy-ready** — zero config needed

---

## 🕹️ Controls

| Action | Keyboard | Mobile / Touch |
|---|---|---|
| Thrust up | `Space` / `W` / `↑` | Tap & hold screen |
| Continuous thrust | Hold key | Hold finger |
| Pause / Resume | `P` or `ESC` | Pause button (top-right) |
| Start / Restart | `Space` on start/gameover screen | Tap screen |

---

## 🎮 Gameplay

1. Your character runs automatically to the right — you control only the vertical axis.
2. **Hold thrust** to rise (jetpack fires), **release** to fall (gravity takes over).
3. **Hit the floor or ceiling** = lose a life.
4. **Hit a missile** without a shield = lose a life.
5. **Collect coins** (+10 pts each) — distance adds to your score continuously.
6. **Grab power-up capsules** for temporary abilities shown by a HUD timer bar.
7. The world **accelerates** — missiles come faster as your score climbs.
8. Lose all 3 lives and it's **Game Over**. High score is saved automatically.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Animation | framer-motion |
| Rendering | HTML5 Canvas API |
| Sound | Web Audio API (no external files) |
| Persistence | `localStorage` |
| Deployment | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx         # Root layout + metadata
│   ├── page.tsx           # Home page
│   └── globals.css        # Tailwind + global resets
├── components/
│   ├── Game.tsx           # Main container + canvas scaling
│   ├── HUD.tsx            # Score, lives, power-up bar
│   ├── StartScreen.tsx    # Splash / difficulty picker
│   ├── GameOverScreen.tsx # End screen with stats
│   ├── PauseMenu.tsx      # Pause overlay
│   └── MobileControls.tsx # Touch input layer
├── hooks/
│   ├── useGameEngine.ts   # Core game loop, physics, collisions
│   └── useSound.ts        # Web Audio API sound engine
├── types/
│   └── game.ts            # All TypeScript interfaces
└── utils/
    ├── constants.ts       # Tunable parameters + colour palette
    ├── collision.ts       # AABB + point-in-circle helpers
    ├── spawner.ts         # Procedural object generation
    └── renderer.ts        # Canvas drawing functions
public/
└── favicon.svg            # Custom neon jetpack favicon
```

---

## 🚀 Running Locally

**Prerequisites:** Node.js 18+ and npm

```bash
# Clone the repository
git clone https://github.com/your-username/jetpack-joyride.git
cd jetpack-joyride

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Production build

```bash
npm run build
npm start
```

---

## ☁️ Deploy to Vercel

This project is zero-config Vercel-ready.

**Option A — Vercel CLI**
```bash
npm install -g vercel
vercel
```

**Option B — GitHub Integration**
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Click **Deploy** — no environment variables needed

---

## 🎨 Customisation

All game parameters live in `src/utils/constants.ts`:

- `GRAVITY` / `THRUST` — player physics feel
- `BASE_SPEED` — starting speed per difficulty level
- `MISSILE_SPAWN_BASE` — missile spawn interval (frames)
- `POWERUP_SPAWN_INTERVAL` — power-up frequency
- `COLORS` — entire neon colour palette

---

## 📄 License

MIT — fork, remix, and deploy freely.
