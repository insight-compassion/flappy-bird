/**
 * EnemyManager: Manages obstacle pipes generation, movement, and drawing
 */
import { CANVAS, WORLD, PIPE_CONFIG } from '../config.js';

export class EnemyManager {
    constructor() {
        this.pipes = [];
        this.spawnTimer = 0;
    }

    reset() {
        this.pipes = [];
        this.spawnTimer = 0;
    }

    createPipe() {
        const minTop = PIPE_CONFIG.MIN_TOP;
        const maxTop = PIPE_CONFIG.MAX_TOP;
        const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;

        this.pipes.push({
            x: CANVAS.WIDTH,
            top: topHeight,
            bottom: topHeight + PIPE_CONFIG.GAP,
            width: PIPE_CONFIG.WIDTH,
            passed: false
        });
    }

    /**
     * Update pipes positions, handle scoring, and clean up offscreen pipes
     * @param {number} frames Current frame counter
     * @param {Object} bird Player instance
     * @param {Function} onScore Callback when player scores
     * @param {number} dtFactor Normalization factor
     */
    update(frames, bird, onScore, dtFactor = 1) {
        if (frames % PIPE_CONFIG.SPAWN_INTERVAL_FRAMES === 0) {
            this.createPipe();
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const p = this.pipes[i];
            p.x -= PIPE_CONFIG.SPEED * dtFactor;

            // Score check
            if (!p.passed && p.x + PIPE_CONFIG.WIDTH < bird.x) {
                p.passed = true;
                if (onScore) {
                    onScore(p.x + PIPE_CONFIG.WIDTH / 2, (p.top + p.bottom) / 2);
                }
            }

            // Remove off-screen pipes
            if (p.x + PIPE_CONFIG.WIDTH < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }

    /**
     * Draws all active pipes with caps, highlights, and borders
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        for (const p of this.pipes) {
            // Upper pipe
            this.drawSinglePipe(ctx, p.x, 0, PIPE_CONFIG.WIDTH, p.top, true);
            // Lower pipe
            const bottomHeight = CANVAS.HEIGHT - WORLD.GROUND_HEIGHT - p.bottom;
            this.drawSinglePipe(ctx, p.x, p.bottom, PIPE_CONFIG.WIDTH, bottomHeight, false);
        }
    }

    /**
     * Draw a single classic green pipe
     */
    drawSinglePipe(ctx, x, y, w, h, isTop) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#15803d';

        // Pipe body
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);

        // Pipe highlights and shadow
        ctx.fillStyle = '#86efac';
        ctx.fillRect(x + 4, y, 4, h);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + w - 8, y, 4, h);

        // Pipe rim / cap
        const capHeight = 22;
        const capX = x - 3;
        const capW = w + 6;
        const capY = isTop ? y + h - capHeight : y;

        ctx.fillStyle = '#22c55e';
        ctx.fillRect(capX, capY, capW, capHeight);
        ctx.strokeRect(capX, capY, capW, capHeight);

        // Cap highlights and shadow
        ctx.fillStyle = '#86efac';
        ctx.fillRect(capX + 4, capY, 4, capHeight);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(capX + capW - 8, capY, 4, capHeight);
    }

    /**
     * Returns list of pipe obstacle boxes for collision detection
     */
    getColliders() {
        const colliders = [];
        for (const p of this.pipes) {
            // Top collider
            colliders.push({
                x: p.x,
                y: 0,
                width: PIPE_CONFIG.WIDTH,
                height: p.top
            });
            // Bottom collider
            colliders.push({
                x: p.x,
                y: p.bottom,
                width: PIPE_CONFIG.WIDTH,
                height: CANVAS.HEIGHT - WORLD.GROUND_HEIGHT - p.bottom
            });
        }
        return colliders;
    }
}
