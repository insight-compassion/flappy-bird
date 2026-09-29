# Flappy Bird - Deluxe Canvas Edition

A modern, high-performance HTML5 Canvas implementation of Flappy Bird with modular ES6 architecture, dynamic parallax backgrounds, special skill mechanics, and procedural Web Audio engine.

## Features & Gameplay Mechanics

- **Air Dash / Dive Skill**: Trigger a rapid horizontal dash with streamlined aerodynamics, ghost afterimage trails, and brief obstacle penetration on a cooldown gauge.
- **Pipe Variety**: Classic pipes alongside vertically oscillating challenge pipes with warning indicators.
- **Collectible Stars**: High-value gold stars spawning in tight gaps (+2 score bonus and celebration starbursts).
- **Dynamic Multi-Layer Parallax Background**: Atmospheric sky smoothly transitioning from bright daylight to vivid sunset and twilight as score progresses, with distant mountain silhouettes, city skyline, lit windows, and multi-depth clouds.
- **Audio System**: Looped chiptune BGM, jump chirps, crash bump impact audio, dash wind whoosh, and star bell chimes with in-game mute toggle.
- **Deluxe HUD**: Real-time score display, star counter, dash cooldown meter, screen shake, and post-game medal evaluation.

## Controls

- **Jump / Flap**: `Space`, `ArrowUp`, `W`, Left Mouse Click, or Screen Tap.
- **Air Dash**: `Shift`, `ArrowDown`, `S`, `X`, `E`, Right Mouse Click, or Quick Double Tap on mobile.
- **Mute / Unmute Audio**: `M` key or click the 🔊/🔇 icon in the top right.
- **Restart**: Press Jump key or tap screen after settling on the ground in Game Over state.

## Architecture

```text
├── index.html                     # Viewport configuration & entry point
├── css/style.css                  # Responsive canvas styling & reset
├── assets/
│   ├── audio/                     # Sound assets & fallbacks
│   └── images/                    # Sprite & scenery textures
├── js/
│   ├── config.js                  # Tuning constants, skill cooldowns, keybindings
│   ├── main.js                    # Bootstrap and lifecycle initialization
│   ├── core/
│   │   ├── Game.js                # Core game orchestrator & event bus
│   │   ├── GameLoop.js            # RequestAnimationFrame loop with Delta Time
│   │   └── InputHandler.js        # Keyboard, mouse, and touch listener
│   ├── entities/
│   │   ├── Entity.js              # Base entity class
│   │   ├── Player.js              # Player entity, physics, dash skill & ghost trails
│   │   └── EnemyManager.js        # Oscillating pipes and collectible star manager
│   ├── systems/
│   │   ├── Background.js          # Multi-layer parallax and atmospheric sky system
│   │   ├── Physics.js             # AABB and circle-circle collision system
│   │   ├── ParticleSystem.js      # Jump dust, dash streaks, starbursts, floating score text
│   │   └── SoundManager.js        # Web Audio API procedural synthesizer & asset loader
│   └── ui/
│       └── HUD.js                 # UI screens, dash gauge, star badges, and audio button
```
