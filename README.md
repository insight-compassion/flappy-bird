# Flappy Bird - Classic Canvas Edition

A modern, high-performance HTML5 Canvas implementation of the classic Flappy Bird game, refactored into a clean, modular ES6 architecture.

## Architecture

- **`index.html`**: Canvas container, responsive viewport settings, and ES6 module entry point.
- **`css/style.css`**: Responsive design (RWD), centered viewport, and touch optimization.
- **`assets/`**: Asset directory structure for sprites and audio resources.
- **`js/`**:
  - **`config.js`**: Game constants, physics tuning, and keybindings.
  - **`main.js`**: Application bootstrap and lifecycle initiator.
  - **`core/`**:
    - `Game.js`: Core orchestrator managing state transitions, updates, and rendering.
    - `GameLoop.js`: High-precision `requestAnimationFrame` loop with Delta Time normalization.
    - `InputHandler.js`: Unified handling for keyboard (`Space`, `ArrowUp`, `W`), mouse click, and touch.
  - **`entities/`**:
    - `Entity.js`: Base entity class.
    - `Player.js`: Player bird physics, animation states, and vector rendering.
    - `EnemyManager.js`: Procedural obstacle pipe generation, recycling, and bounding boxes.
  - **`systems/`**:
    - `Physics.js`: Collision detection (AABB and ground checks).
    - `ParticleSystem.js`: Particle effects for flapping, scoring sparkles, and impact debris.
  - **`ui/`**:
    - `HUD.js`: Dynamic HUD rendering, high score persistence, screen shake, and jump readiness meter.

## Controls

- **Jump / Flap**: `Space`, `ArrowUp`, `W`, Mouse Click, or Screen Tap.
- **Restart**: Press Jump key or tap screen after falling to the ground in Game Over state.
