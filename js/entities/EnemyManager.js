/**
 * EnemyManager: Manages obstacle pipes (normal & oscillating) and collectible stars
 */
import { CANVAS, WORLD, PIPE_CONFIG, STAR_CONFIG } from '../config.js';
import { Physics } from '../systems/Physics.js';

export class EnemyManager {
    constructor() {
        this.pipes = [];
        this.stars = [];
    }

    reset() {
        this.pipes = [];
        this.stars = [];
    }

    createPipe() {
        const minTop = PIPE_CONFIG.MIN_TOP;
        const maxTop = PIPE_CONFIG.MAX_TOP;
        const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;

        const isOscillating = Math.random() < PIPE_CONFIG.OSCILLATE_CHANCE;

        const pipe = {
            x: CANVAS.WIDTH,
            baseTop: topHeight,
            top: topHeight,
            bottom: topHeight + PIPE_CONFIG.GAP,
            width: PIPE_CONFIG.WIDTH,
            passed: false,
            isOscillating,
            oscPhase: Math.random() * Math.PI * 2,
            oscAmplitude: PIPE_CONFIG.OSCILLATE_AMPLITUDE,
            oscSpeed: PIPE_CONFIG.OSCILLATE_SPEED
        };

        this.pipes.push(pipe);

        // Spawn collectible star in pipe gap
        if (Math.random() < STAR_CONFIG.SPAWN_CHANCE) {
            this.stars.push({
                x: CANVAS.WIDTH + PIPE_CONFIG.WIDTH / 2,
                baseY: topHeight + PIPE_CONFIG.GAP / 2,
                y: topHeight + PIPE_CONFIG.GAP / 2,
                radius: STAR_CONFIG.RADIUS,
                pipeRef: pipe,
                rotation: 0,
                collected: false
            });
        }
    }

    /**
     * Updates pipe and star positions, handles scoring, and cleans up offscreen entities
     * @param {number} frames
     * @param {Object} player
     * @param {Function} onScore
     * @param {Function} onStarCollect
     * @param {number} dtFactor
     */
    update(frames, player, onScore, onStarCollect, dtFactor = 1) {
        if (frames % PIPE_CONFIG.SPAWN_INTERVAL_FRAMES === 0) {
            this.createPipe();
        }

        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const p = this.pipes[i];
            const speed = (player.isDashing ? PIPE_CONFIG.SPEED * 1.5 : PIPE_CONFIG.SPEED) * dtFactor;
            p.x -= speed;

            // Oscillating motion
            if (p.isOscillating) {
                const offset = Math.sin(frames * p.oscSpeed + p.oscPhase) * p.oscAmplitude;
                p.top = Math.max(PIPE_CONFIG.MIN_TOP, Math.min(PIPE_CONFIG.MAX_TOP, p.baseTop + offset));
                p.bottom = p.top + PIPE_CONFIG.GAP;
            }

            // Score check
            if (!p.passed && p.x + PIPE_CONFIG.WIDTH < player.x) {
                p.passed = true;
                if (onScore) {
                    onScore(p.x + PIPE_CONFIG.WIDTH / 2, (p.top + p.bottom) / 2);
                }
            }

            // Clean up offscreen pipes
            if (p.x + PIPE_CONFIG.WIDTH < 0) {
                this.pipes.splice(i, 1);
            }
        }

        // Update stars
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const s = this.stars[i];
            const speed = (player.isDashing ? PIPE_CONFIG.SPEED * 1.5 : PIPE_CONFIG.SPEED) * dtFactor;
            s.x -= speed;
            s.rotation += 0.04 * dtFactor;

            // Follow oscillating pipe center if attached
            if (s.pipeRef && s.pipeRef.isOscillating) {
                s.y = (s.pipeRef.top + s.pipeRef.bottom) / 2;
            } else {
                s.y = s.baseY + Math.sin(frames * 0.08) * 4;
            }

            // Star collision with player
            if (!s.collected && Physics.checkCircleCircle(player.getCircle(), s)) {
                s.collected = true;
                if (onStarCollect) {
                    onStarCollect(s.x, s.y);
                }
                this.stars.splice(i, 1);
                continue;
            }

            // Clean up offscreen stars
            if (s.x + s.radius < 0) {
                this.stars.splice(i, 1);
            }
        }
    }

    /**
     * Draws pipes and stars
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        // Draw pipes
        for (const p of this.pipes) {
            this.drawSinglePipe(ctx, p, true);
            this.drawSinglePipe(ctx, p, false);
        }

        // Draw stars
        for (const s of this.stars) {
            this.drawStar(ctx, s);
        }
    }

    /**
     * Draw a single pipe section with special oscillating styling indicator
     */
    drawSinglePipe(ctx, pipe, isTop) {
        const x = pipe.x;
        const w = PIPE_CONFIG.WIDTH;
        const y = isTop ? 0 : pipe.bottom;
        const h = isTop ? pipe.top : CANVAS.HEIGHT - WORLD.GROUND_HEIGHT - pipe.bottom;

        ctx.lineWidth = 2;
        // Oscillating pipes have gold/amber hazard warning stripes on rim
        const isOsc = pipe.isOscillating;
        ctx.strokeStyle = isOsc ? '#b45309' : '#15803d';

        // Pipe body
        ctx.fillStyle = isOsc ? '#f59e0b' : '#22c55e';
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);

        // Pipe body highlight and shadow
        ctx.fillStyle = isOsc ? '#fde68a' : '#86efac';
        ctx.fillRect(x + 4, y, 4, h);
        ctx.fillStyle = isOsc ? '#b45309' : '#15803d';
        ctx.fillRect(x + w - 8, y, 4, h);

        // Pipe cap
        const capHeight = 22;
        const capX = x - 3;
        const capW = w + 6;
        const capY = isTop ? y + h - capHeight : y;

        ctx.fillStyle = isOsc ? '#d97706' : '#22c55e';
        ctx.fillRect(capX, capY, capW, capHeight);
        ctx.strokeRect(capX, capY, capW, capHeight);

        // Cap highlight and shadow
        ctx.fillStyle = isOsc ? '#fef3c7' : '#86efac';
        ctx.fillRect(capX + 4, capY, 4, capHeight);
        ctx.fillStyle = isOsc ? '#92400e' : '#15803d';
        ctx.fillRect(capX + capW - 8, capY, 4, capHeight);
    }

    /**
     * Draw golden 5-point star
     */
    drawStar(ctx, star) {
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate(star.rotation);

        // Outer glow
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;

        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        const spikes = 5;
        const outerRadius = star.radius;
        const innerRadius = star.radius * 0.45;
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;

        ctx.moveTo(0, -outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.lineTo(0, -outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
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
