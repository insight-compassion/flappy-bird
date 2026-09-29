/**
 * Player (Flappy Bird) Entity with Air Dash Skill and Ghost Trails
 */
import { Entity } from './Entity.js';
import { BIRD_CONFIG, WORLD, CANVAS, GAME_STATES } from '../config.js';

export class Player extends Entity {
    constructor() {
        super(BIRD_CONFIG.START_X, BIRD_CONFIG.START_Y, BIRD_CONFIG.RADIUS * 2, BIRD_CONFIG.RADIUS * 2);
        this.radius = BIRD_CONFIG.RADIUS;
        this.vy = 0;
        this.gravity = WORLD.GRAVITY;
        this.jump = BIRD_CONFIG.JUMP_FORCE;
        this.rotation = 0;
        this.wingAngle = 0;

        // Skill: Air Dash
        this.dashCooldown = 0;
        this.dashTimer = 0;
        this.isDashing = false;
        this.ghostTrails = [];
    }

    reset() {
        this.x = BIRD_CONFIG.START_X;
        this.y = BIRD_CONFIG.START_Y;
        this.vy = 0;
        this.rotation = 0;
        this.wingAngle = 0;
        this.dashCooldown = 0;
        this.dashTimer = 0;
        this.isDashing = false;
        this.ghostTrails = [];
    }

    flap() {
        this.vy = this.jump;
    }

    canDash() {
        return this.dashCooldown <= 0;
    }

    dash() {
        if (!this.canDash()) return false;
        this.isDashing = true;
        this.dashTimer = BIRD_CONFIG.DASH_DURATION_FRAMES;
        this.dashCooldown = BIRD_CONFIG.DASH_COOLDOWN_FRAMES;
        this.vy = BIRD_CONFIG.DASH_IMPULSE_VY; // Stabilize glide
        return true;
    }

    getDashCooldownProgress() {
        if (this.dashCooldown <= 0) return 1.0;
        return 1.0 - (this.dashCooldown / BIRD_CONFIG.DASH_COOLDOWN_FRAMES);
    }

    update(frames, state, dtFactor = 1) {
        if (state === GAME_STATES.IDLE) {
            this.y = BIRD_CONFIG.START_Y + Math.sin(frames * 0.08) * 6;
            this.rotation = 0;
            this.wingAngle = Math.sin(frames * 0.2) * 0.5;
            this.dashCooldown = 0;
            this.isDashing = false;
            this.ghostTrails = [];
        } else if (state === GAME_STATES.PLAYING) {
            // Update Dash skill status
            if (this.isDashing) {
                this.dashTimer -= dtFactor;

                // Push ghost trail for speed blur
                if (frames % 2 === 0) {
                    this.ghostTrails.push({
                        x: this.x,
                        y: this.y,
                        rotation: this.rotation,
                        radius: this.radius,
                        alpha: 0.6
                    });
                }

                // Mild floating gravity during dash
                this.vy += this.gravity * 0.2 * dtFactor;
                this.y += this.vy * dtFactor;
                this.rotation = -0.15; // aerodynamic streamlined angle
                this.wingAngle = 0.8;

                if (this.dashTimer <= 0) {
                    this.isDashing = false;
                }
            } else {
                // Normal physics
                this.vy += this.gravity * dtFactor;
                this.y += this.vy * dtFactor;

                // Rotation calculation
                this.rotation = Math.min(
                    BIRD_CONFIG.ROTATION_MAX_DOWN,
                    Math.max(BIRD_CONFIG.ROTATION_MAX_UP, this.vy * BIRD_CONFIG.ROTATION_SPEED_FACTOR)
                );
                this.wingAngle = Math.sin(frames * 0.4) * 0.6;
            }

            // Recover dash cooldown
            if (this.dashCooldown > 0) {
                this.dashCooldown = Math.max(0, this.dashCooldown - dtFactor);
            }

            // Ceiling constraint
            if (this.y - this.radius <= 0) {
                this.y = this.radius;
                this.vy = 0;
            }
        } else if (state === GAME_STATES.GAMEOVER) {
            this.isDashing = false;
            const groundLimit = CANVAS.HEIGHT - WORLD.GROUND_HEIGHT;
            if (this.y + this.radius < groundLimit) {
                this.vy += this.gravity * WORLD.DEAD_GRAVITY_MULTIPLIER * dtFactor;
                this.y += this.vy * dtFactor;
                this.rotation = Math.PI / 2;
            }
        }

        // Fade and prune ghost afterimages
        for (let i = this.ghostTrails.length - 1; i >= 0; i--) {
            const t = this.ghostTrails[i];
            t.alpha -= 0.08 * dtFactor;
            if (t.alpha <= 0) {
                this.ghostTrails.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // Draw Dash ghost trails
        for (const t of this.ghostTrails) {
            ctx.save();
            ctx.globalAlpha = t.alpha;
            ctx.translate(t.x, t.y);
            ctx.rotate(t.rotation);
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Dash aura glow
        if (this.isDashing) {
            ctx.save();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.ellipse(-4, 0, this.radius + 6, this.radius + 2, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Body (Yellow circle, with dash tint)
        ctx.fillStyle = this.isDashing ? '#fef08a' : '#facc15';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Belly (White/Light Yellow)
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(-2, 3, this.radius - 4, 0, Math.PI);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(6, -4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pupil
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(7, -4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Beak (Orange)
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(16, 3);
        ctx.lineTo(8, 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Wing
        ctx.save();
        ctx.translate(-4, 2);
        ctx.rotate(this.wingAngle);
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(-2, 0, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    getCircle() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius
        };
    }
}
