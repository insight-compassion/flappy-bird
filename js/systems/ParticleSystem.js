/**
 * ParticleSystem for visual polish and game juice
 */

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    /**
     * Spawns feathers/dust when the player flaps
     */
    emitFlap(x, y) {
        const count = 5;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x - 8 + (Math.random() * 6 - 3),
                y: y + 4 + (Math.random() * 6 - 3),
                vx: -1.2 - Math.random() * 1.5,
                vy: 0.5 + Math.random() * 1.5,
                size: 2.5 + Math.random() * 2,
                color: Math.random() > 0.5 ? '#fef08a' : '#ffffff',
                alpha: 0.9,
                life: 18 + Math.floor(Math.random() * 10),
                maxLife: 28
            });
        }
    }

    /**
     * Spawns golden celebration sparks on scoring
     */
    emitScore(x, y) {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2.5 + Math.random() * 2.5,
                color: Math.random() > 0.4 ? '#facc15' : '#ffffff',
                alpha: 1.0,
                life: 25 + Math.floor(Math.random() * 15),
                maxLife: 40
            });
        }
    }

    /**
     * Spawns impact debris on collision
     */
    emitImpact(x, y) {
        const count = 16;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4.5;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                color: Math.random() > 0.5 ? '#ef4444' : '#f97316',
                alpha: 1.0,
                life: 20 + Math.floor(Math.random() * 15),
                maxLife: 35
            });
        }
    }

    /**
     * Updates particles
     * @param {number} dtFactor
     */
    update(dtFactor = 1) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dtFactor;
            p.y += p.vy * dtFactor;
            p.life -= dtFactor;
            p.alpha = Math.max(0, p.life / p.maxLife);

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Renders active particles
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        if (this.particles.length === 0) return;

        ctx.save();
        for (const p of this.particles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    clear() {
        this.particles.length = 0;
    }
}
