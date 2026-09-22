/**
 * Game Core Orchestrator
 */
import { CANVAS, WORLD, PIPE_CONFIG, GAME_STATES } from '../config.js';
import { Player } from '../entities/Player.js';
import { EnemyManager } from '../entities/EnemyManager.js';
import { Physics } from '../systems/Physics.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { HUD } from '../ui/HUD.js';
import { InputHandler } from './InputHandler.js';
import { GameLoop } from './GameLoop.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.currentState = GAME_STATES.IDLE;
        this.score = 0;
        this.groundOffset = 0;

        // Background visual elements
        this.clouds = [
            { x: 30, y: 80, size: 35 },
            { x: 180, y: 50, size: 45 },
            { x: 310, y: 100, size: 30 }
        ];

        this.buildings = Array.from({ length: 8 }, (_, i) => ({
            x: i * 50,
            w: 35 + Math.random() * 15,
            h: 40 + Math.random() * 50
        }));

        // Initialize sub-systems and entities
        this.player = new Player();
        this.enemyManager = new EnemyManager();
        this.particleSystem = new ParticleSystem();
        this.hud = new HUD();

        // Bind and setup input
        this.handleAction = this.handleAction.bind(this);
        this.inputHandler = new InputHandler(this.canvas, this.handleAction);

        // Bind and setup game loop
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.loop = new GameLoop(this.update, this.render);
    }

    start() {
        this.loop.start();
    }

    handleAction() {
        if (this.currentState === GAME_STATES.IDLE) {
            this.currentState = GAME_STATES.PLAYING;
            this.player.flap();
            this.hud.triggerFlapFeedback();
            this.particleSystem.emitFlap(this.player.x, this.player.y);
        } else if (this.currentState === GAME_STATES.PLAYING) {
            this.player.flap();
            this.hud.triggerFlapFeedback();
            this.particleSystem.emitFlap(this.player.x, this.player.y);
        } else if (this.currentState === GAME_STATES.GAMEOVER) {
            // Only allow restart after the bird settles on the ground
            const groundLimit = CANVAS.HEIGHT - WORLD.GROUND_HEIGHT;
            if (this.player.y + this.player.radius >= groundLimit - 2) {
                this.enemyManager.reset();
                this.particleSystem.clear();
                this.score = 0;
                this.player.reset();
                this.currentState = GAME_STATES.IDLE;
            }
        }
    }

    triggerGameOver() {
        this.currentState = GAME_STATES.GAMEOVER;
        this.hud.triggerShake(10, 14);
        this.particleSystem.emitImpact(this.player.x, this.player.y);
    }

    update(dt, dtFactor, frames) {
        this.hud.update(dtFactor);
        this.particleSystem.update(dtFactor);

        // Update ground moving stripes
        if (this.currentState !== GAME_STATES.GAMEOVER) {
            this.groundOffset = (this.groundOffset + PIPE_CONFIG.SPEED * dtFactor) % 20;
        }

        // Update bird entity
        this.player.update(frames, this.currentState, dtFactor);

        if (this.currentState === GAME_STATES.PLAYING) {
            // Update pipes and detect scoring
            this.enemyManager.update(
                frames,
                this.player,
                (scoreX, scoreY) => {
                    this.score++;
                    this.hud.saveHighScore(this.score);
                    this.particleSystem.emitScore(scoreX, scoreY);
                },
                dtFactor
            );

            // Collision check: Ground
            const groundLimit = CANVAS.HEIGHT - WORLD.GROUND_HEIGHT;
            if (Physics.checkCircleGround(this.player.getCircle(), groundLimit)) {
                this.player.y = groundLimit - this.player.radius;
                this.triggerGameOver();
                return;
            }

            // Collision check: Pipes
            const colliders = this.enemyManager.getColliders();
            for (const box of colliders) {
                if (Physics.checkCircleAABB(this.player.getCircle(), box)) {
                    this.triggerGameOver();
                    return;
                }
            }
        }
    }

    render() {
        const ctx = this.ctx;

        // Apply screen shake
        const shakeApplied = this.hud.applyShake(ctx);

        // Draw background scenery and ground
        this.drawBackground();

        // Draw pipes
        this.enemyManager.draw(ctx);

        // Draw player
        this.player.draw(ctx);

        // Draw particle effects
        this.particleSystem.draw(ctx);

        // Restore shake transform
        this.hud.restoreShake(ctx, shakeApplied);

        // Draw UI / HUD on top
        this.hud.draw(ctx, this.currentState, this.score);
    }

    drawBackground() {
        const ctx = this.ctx;
        const W = CANVAS.WIDTH;
        const H = CANVAS.HEIGHT;
        const groundH = WORLD.GROUND_HEIGHT;

        // Sky
        ctx.fillStyle = '#70c5ce';
        ctx.fillRect(0, 0, W, H);

        // Distant buildings
        ctx.fillStyle = '#4fa8b0';
        for (const b of this.buildings) {
            ctx.fillRect(b.x, H - groundH - b.h, b.w, b.h);
        }

        // Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (const c of this.clouds) {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
            ctx.arc(c.x + 15, c.y - 10, c.size * 0.7, 0, Math.PI * 2);
            ctx.arc(c.x + 30, c.y, c.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Ground
        ctx.fillStyle = '#ded895';
        ctx.fillRect(0, H - groundH, W, groundH);

        // Grass top band
        ctx.fillStyle = '#73bf2e';
        ctx.fillRect(0, H - groundH, W, 16);
        ctx.fillStyle = '#529c1e';
        ctx.fillRect(0, H - groundH + 16, W, 4);

        // Ground diagonal pattern
        ctx.strokeStyle = '#cbb86b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = -20; x < W + 20; x += 20) {
            ctx.moveTo(x - this.groundOffset, H - groundH + 20);
            ctx.lineTo(x - this.groundOffset - 10, H);
        }
        ctx.stroke();

        // Divider black stroke
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, H - groundH);
        ctx.lineTo(W, H - groundH);
        ctx.stroke();
    }
}
