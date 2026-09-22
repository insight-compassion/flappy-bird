/**
 * Player (Flappy Bird) Entity
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
    }

    reset() {
        this.x = BIRD_CONFIG.START_X;
        this.y = BIRD_CONFIG.START_Y;
        this.vy = 0;
        this.rotation = 0;
        this.wingAngle = 0;
    }

    flap() {
        this.vy = this.jump;
    }

    update(frames, state, dtFactor = 1) {
        if (state === GAME_STATES.IDLE) {
            // Idle floating animation
            this.y = BIRD_CONFIG.START_Y + Math.sin(frames * 0.08) * 6;
            this.rotation = 0;
            this.wingAngle = Math.sin(frames * 0.2) * 0.5;
        } else if (state === GAME_STATES.PLAYING) {
            this.vy += this.gravity * dtFactor;
            this.y += this.vy * dtFactor;

            // Rotation clamped between -30 deg and 90 deg
            this.rotation = Math.min(
                BIRD_CONFIG.ROTATION_MAX_DOWN,
                Math.max(BIRD_CONFIG.ROTATION_MAX_UP, this.vy * BIRD_CONFIG.ROTATION_SPEED_FACTOR)
            );
            this.wingAngle = Math.sin(frames * 0.4) * 0.6;

            // Ceiling constraint
            if (this.y - this.radius <= 0) {
                this.y = this.radius;
                this.vy = 0;
            }
        } else if (state === GAME_STATES.GAMEOVER) {
            // Death fall animation
            const groundLimit = CANVAS.HEIGHT - WORLD.GROUND_HEIGHT;
            if (this.y + this.radius < groundLimit) {
                this.vy += this.gravity * WORLD.DEAD_GRAVITY_MULTIPLIER * dtFactor;
                this.y += this.vy * dtFactor;
                this.rotation = Math.PI / 2;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Body (Yellow circle)
        ctx.fillStyle = '#facc15';
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
