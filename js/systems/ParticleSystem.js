/**
 * ParticleSystem for visual polish and game juice
 */

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
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
     * Spawns cyan and golden speed wind streaks during Dash
     */
    emitDash(x, y) {
        const count = 10;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x - 10 + (Math.random() * 10 - 5),
                y: y + (Math.random() * 14 - 7),
                vx: -4 - Math.random() * 3.5,
                vy: (Math.random() - 0.5) * 1.5,
                size: 2 + Math.random() * 2.5,
                color: Math.random() > 0.3 ? '#38bdf8' : '#fef08a',
                alpha: 1.0,
                life: 14 + Math.floor(Math.random() * 8),
                maxLife: 22
            });
        }
    }

    /**
     * Spawns golden celebration sparks on passing pipe
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
     * Spawns radiant starburst and adds "+2" floating score text
     */
    emitStar(x, y) {
        const count = 16;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 2.5 + Math.random() * 3.0;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 2,
                color: i % 2 === 0 ? '#fbbf24' : '#ffffff',
                alpha: 1.0,
                life: 22 + Math.floor(Math.random() * 12),
                maxLife: 34
            });
        }

        this.floatingTexts.push({
            text: '+2 ★',
            x,
            y: y - 10,
            vy: -1.2,
            alpha: 1.0,
            life: 35,
            maxLife: 35,
            color: '#facc15'
        });
    }

    /**
     * Spawns impact debris on collision
     */
    emitImpact(x, y) {
        const count = 18;
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
     * Updates particles and floating texts
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

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy * dtFactor;
            ft.life -= dtFactor;
            ft.alpha = Math.max(0, ft.life / ft.maxLife);

            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    /**
     * Renders active particles and floating indicators
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        if (this.particles.length > 0) {
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

        if (this.floatingTexts.length > 0) {
            ctx.save();
            ctx.font = '900 16px sans-serif';
            ctx.textAlign = 'center';
            for (const ft of this.floatingTexts) {
                ctx.globalAlpha = ft.alpha;
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 3;
                ctx.strokeText(ft.text, ft.x, ft.y);
                ctx.fillStyle = ft.color;
                ctx.fillText(ft.text, ft.x, ft.y);
            }
            ctx.restore();
        }
    }

    clear() {
        this.particles.length = 0;
        this.floatingTexts.length = 0;
    }
}
