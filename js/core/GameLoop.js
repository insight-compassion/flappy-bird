/**
 * GameLoop with Delta Time computation and frame normalization
 */

export class GameLoop {
    constructor(onUpdate, onRender) {
        this.onUpdate = onUpdate;
        this.onRender = onRender;

        this.isRunning = false;
        this.lastTime = 0;
        this.rafId = null;
        this.frames = 0;

        this.tick = this.tick.bind(this);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame(this.tick);
    }

    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    tick(currentTime) {
        if (!this.isRunning) return;

        // Compute delta time in seconds
        let dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap dt to prevent spiral of death on lag / tab switch
        if (dt > 0.1) dt = 0.1;

        // dtFactor normalized to 60 FPS (1 / 60 = ~0.01667s)
        const targetFrameTime = 1 / 60;
        const dtFactor = dt > 0 ? dt / targetFrameTime : 1;

        this.frames++;

        if (this.onUpdate) {
            this.onUpdate(dt, dtFactor, this.frames);
        }

        if (this.onRender) {
            this.onRender(dt, this.frames);
        }

        this.rafId = requestAnimationFrame(this.tick);
    }
}
