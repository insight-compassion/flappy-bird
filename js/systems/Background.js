/**
 * Background System: Dynamic multi-layer parallax scrolling with atmospheric Day/Dusk sky
 */
import { CANVAS, WORLD, PIPE_CONFIG } from '../config.js';

export class Background {
    constructor() {
        this.groundOffset = 0;
        this.mountainOffset = 0;
        this.cityOffset = 0;

        // Twinkling stars for dusk/night
        this.stars = Array.from({ length: 30 }, () => ({
            x: Math.random() * CANVAS.WIDTH,
            y: Math.random() * (CANVAS.HEIGHT - WORLD.GROUND_HEIGHT - 120),
            size: 1 + Math.random() * 2,
            twinkleSpeed: 0.02 + Math.random() * 0.04,
            phase: Math.random() * Math.PI * 2
        }));

        // Parallax clouds with different depths and speeds
        this.clouds = [
            { x: 30, y: 70, size: 38, speed: 0.35 },
            { x: 170, y: 40, size: 48, speed: 0.25 },
            { x: 290, y: 95, size: 32, speed: 0.45 },
            { x: 100, y: 130, size: 26, speed: 0.55 },
            { x: 240, y: 150, size: 34, speed: 0.3 }
        ];

        // Mountain points (procedural peaks)
        this.mountainPoints = [
            { x: 0, h: 90 }, { x: 70, h: 140 }, { x: 150, h: 80 },
            { x: 230, h: 160 }, { x: 300, h: 110 }, { x: 380, h: 150 },
            { x: 460, h: 90 }
        ];

        // Mid-ground city buildings
        this.buildings = Array.from({ length: 12 }, (_, i) => ({
            x: i * 36,
            w: 26 + (i * 7) % 14,
            h: 45 + (i * 19) % 65,
            windowLit: (i % 2 === 0)
        }));
    }

    reset() {
        this.groundOffset = 0;
        this.mountainOffset = 0;
        this.cityOffset = 0;
    }

    update(dtFactor = 1, isGameOver = false) {
        if (!isGameOver) {
            this.groundOffset = (this.groundOffset + PIPE_CONFIG.SPEED * dtFactor) % 20;
            this.mountainOffset = (this.mountainOffset + PIPE_CONFIG.SPEED * 0.25 * dtFactor) % 360;
            this.cityOffset = (this.cityOffset + PIPE_CONFIG.SPEED * 0.55 * dtFactor) % 360;

            for (const c of this.clouds) {
                c.x -= c.speed * dtFactor;
                if (c.x + c.size * 2 < -20) {
                    c.x = CANVAS.WIDTH + c.size + Math.random() * 40;
                    c.y = 35 + Math.random() * 120;
                }
            }
        }
    }

    draw(ctx, score = 0, frames = 0) {
        const W = CANVAS.WIDTH;
        const H = CANVAS.HEIGHT;
        const groundH = WORLD.GROUND_HEIGHT;
        const skyH = H - groundH;

        // 1. Dynamic atmospheric sky gradient (Day -> Sunset/Dusk -> Night as score increases)
        // Score 0-10: Day, 10-25: Sunset/Dusk, 25+: Twilight/Night
        const cycleProgress = Math.min(1.0, score / 25);

        const skyGrad = ctx.createLinearGradient(0, 0, 0, skyH);
        if (cycleProgress < 0.5) {
            // Day to Sunset
            const t = cycleProgress / 0.5;
            skyGrad.addColorStop(0, this.lerpColor('#38bdf8', '#312e81', t));
            skyGrad.addColorStop(0.55, this.lerpColor('#7dd3fc', '#c026d3', t));
            skyGrad.addColorStop(1, this.lerpColor('#bae6fd', '#fb923c', t));
        } else {
            // Sunset to Twilight/Night
            const t = (cycleProgress - 0.5) / 0.5;
            skyGrad.addColorStop(0, this.lerpColor('#312e81', '#030712', t));
            skyGrad.addColorStop(0.6, this.lerpColor('#c026d3', '#1e1b4b', t));
            skyGrad.addColorStop(1, this.lerpColor('#fb923c', '#4338ca', t));
        }

        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);

        // 2. Stars (visible when dusk/night begins)
        if (cycleProgress > 0.3) {
            const starAlpha = Math.min(1.0, (cycleProgress - 0.3) / 0.5);
            ctx.save();
            for (const s of this.stars) {
                const twinkle = Math.sin(frames * s.twinkleSpeed + s.phase) * 0.3 + 0.7;
                ctx.globalAlpha = starAlpha * twinkle;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // 3. Distant Mountains (Layer 1 - slow parallax)
        ctx.save();
        ctx.fillStyle = cycleProgress < 0.5 ? '#3b82f633' : '#4338ca44';
        for (let copy = -1; copy <= 1; copy++) {
            ctx.beginPath();
            ctx.moveTo(copy * 360 - this.mountainOffset, skyH);
            for (const pt of this.mountainPoints) {
                ctx.lineTo(copy * 360 - this.mountainOffset + pt.x, skyH - pt.h);
            }
            ctx.lineTo(copy * 360 - this.mountainOffset + 460, skyH);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // 4. Distant City Skyline (Layer 2 - medium parallax)
        ctx.save();
        const cityColor = cycleProgress < 0.5 ? '#4fa8b0' : '#2e2640';
        ctx.fillStyle = cityColor;
        for (let copy = -1; copy <= 1; copy++) {
            const offsetX = copy * 360 - this.cityOffset;
            for (const b of this.buildings) {
                const bx = offsetX + b.x;
                const by = skyH - b.h;
                ctx.fillRect(bx, by, b.w, b.h);

                // Glowing windows in dusk
                if (cycleProgress > 0.4 && b.windowLit) {
                    ctx.fillStyle = '#fef08a';
                    for (let wy = by + 6; wy < skyH - 8; wy += 12) {
                        ctx.fillRect(bx + 4, wy, 4, 6);
                        if (b.w > 20) ctx.fillRect(bx + b.w - 8, wy, 4, 6);
                    }
                    ctx.fillStyle = cityColor;
                }
            }
        }
        ctx.restore();

        // 5. Parallax Clouds (Layer 3)
        ctx.save();
        for (const c of this.clouds) {
            ctx.fillStyle = cycleProgress < 0.5
                ? 'rgba(255, 255, 255, 0.72)'
                : 'rgba(254, 215, 170, 0.45)';
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
            ctx.arc(c.x + c.size * 0.4, c.y - c.size * 0.25, c.size * 0.75, 0, Math.PI * 2);
            ctx.arc(c.x + c.size * 0.8, c.y, c.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // 6. Ground & Grass (Layer 4)
        // Ground base
        ctx.fillStyle = '#ded895';
        ctx.fillRect(0, skyH, W, groundH);

        // Grass top band
        ctx.fillStyle = '#73bf2e';
        ctx.fillRect(0, skyH, W, 16);
        ctx.fillStyle = '#529c1e';
        ctx.fillRect(0, skyH + 16, W, 4);

        // Ground moving diagonal stripes
        ctx.strokeStyle = '#cbb86b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = -20; x < W + 20; x += 20) {
            ctx.moveTo(x - this.groundOffset, skyH + 20);
            ctx.lineTo(x - this.groundOffset - 10, H);
        }
        ctx.stroke();

        // Top divider black stroke
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, skyH);
        ctx.lineTo(W, skyH);
        ctx.stroke();
    }

    /**
     * Color interpolation helper for smooth sky transitions
     */
    lerpColor(a, b, amount) {
        const ah = parseInt(a.replace(/#/g, ''), 16);
        const ar = (ah >> 16) & 0xff;
        const ag = (ah >> 8) & 0xff;
        const ab = ah & 0xff;

        const bh = parseInt(b.replace(/#/g, ''), 16);
        const br = (bh >> 16) & 0xff;
        const bg = (bh >> 8) & 0xff;
        const bb = bh & 0xff;

        const rr = Math.round(ar + amount * (br - ar));
        const rg = Math.round(ag + amount * (bg - ag));
        const rb = Math.round(ab + amount * (bb - ab));

        return `rgb(${rr},${rg},${rb})`;
    }
}
