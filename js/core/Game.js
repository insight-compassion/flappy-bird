/**
 * Game Core Orchestrator
 */
import { CANVAS, WORLD, GAME_STATES, STAR_CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { EnemyManager } from '../entities/EnemyManager.js';
import { Physics } from '../systems/Physics.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { SoundManager } from '../systems/SoundManager.js';
import { Background } from '../systems/Background.js';
import { HUD } from '../ui/HUD.js';
import { InputHandler } from './InputHandler.js';
import { GameLoop } from './GameLoop.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.currentState = GAME_STATES.IDLE;
        this.score = 0;
        this.currentStars = 0;
        this.frames = 0;

        // Systems and Entities
        this.soundManager = new SoundManager();
        this.background = new Background();
        this.player = new Player();
        this.enemyManager = new EnemyManager();
        this.particleSystem = new ParticleSystem();
        this.hud = new HUD();

        // Bind input handlers
        this.handleJump = this.handleJump.bind(this);
        this.handleDash = this.handleDash.bind(this);
        this.handleToggleAudio = this.handleToggleAudio.bind(this);
        this.isAudioButtonClicked = this.isAudioButtonClicked.bind(this);

        this.inputHandler = new InputHandler(
            this.canvas,
            this.handleJump,
            this.handleDash,
            this.handleToggleAudio,
            this.isAudioButtonClicked
        );

        // Bind game loop
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.loop = new GameLoop(this.update, this.render);
    }

    start() {
        this.loop.start();
    }

    isAudioButtonClicked(x, y) {
        return this.hud.isAudioButtonClicked(x, y);
    }

    handleToggleAudio() {
        this.soundManager.toggleMute();
    }

    handleJump() {
        this.soundManager.resume();

        if (this.currentState === GAME_STATES.IDLE) {
            this.currentState = GAME_STATES.PLAYING;
            this.soundManager.startBGM();
            this.player.flap();
            this.soundManager.playJump();
            this.particleSystem.emitFlap(this.player.x, this.player.y);
        } else if (this.currentState === GAME_STATES.PLAYING) {
            this.player.flap();
            this.soundManager.playJump();
            this.particleSystem.emitFlap(this.player.x, this.player.y);
        } else if (this.currentState === GAME_STATES.GAMEOVER) {
            // Only allow restart after the bird settles near the ground
            const groundLimit = CANVAS.HEIGHT - WORLD.GROUND_HEIGHT;
            if (this.player.y + this.player.radius >= groundLimit - 2) {
                this.enemyManager.reset();
                this.particleSystem.clear();
                this.background.reset();
                this.score = 0;
                this.currentStars = 0;
                this.player.reset();
                this.currentState = GAME_STATES.IDLE;
            }
        }
    }

    handleDash() {
        if (this.currentState !== GAME_STATES.PLAYING) return;

        if (this.player.dash()) {
            this.soundManager.playDash();
            this.hud.triggerShake(4, 8);
            this.particleSystem.emitDash(this.player.x, this.player.y);
        }
    }

    triggerGameOver() {
        if (this.currentState === GAME_STATES.GAMEOVER) return;

        this.currentState = GAME_STATES.GAMEOVER;
        this.soundManager.stopBGM();
        this.soundManager.playBump();
        this.hud.triggerShake(12, 16);
        this.particleSystem.emitImpact(this.player.x, this.player.y);
    }

    update(dt, dtFactor, frames) {
        this.frames = frames;
        const isGameOver = (this.currentState === GAME_STATES.GAMEOVER);

        this.hud.update(dtFactor);
        this.particleSystem.update(dtFactor);
        this.background.update(dtFactor, isGameOver);
        this.player.update(frames, this.currentState, dtFactor);

        if (this.currentState === GAME_STATES.PLAYING) {
            // Update obstacles and star pickups
            this.enemyManager.update(
                frames,
                this.player,
                (scoreX, scoreY) => {
                    // Pipe passed
                    this.score++;
                    this.hud.saveHighScore(this.score);
                    this.particleSystem.emitScore(scoreX, scoreY);
                },
                (starX, starY) => {
                    // Star collected
                    this.currentStars++;
                    this.score += STAR_CONFIG.SCORE_VALUE;
                    this.hud.addStar();
                    this.hud.saveHighScore(this.score);
                    this.soundManager.playStar();
                    this.particleSystem.emitStar(starX, starY);
                },
                dtFactor
            );

            // Ground collision
            const groundLimit = CANVAS.HEIGHT - WORLD.GROUND_HEIGHT;
            if (Physics.checkCircleGround(this.player.getCircle(), groundLimit)) {
                this.player.y = groundLimit - this.player.radius;
                this.triggerGameOver();
                return;
            }

            // Pipe collisions (Air Dash gives invulnerability through obstacles!)
            if (!this.player.isDashing) {
                const colliders = this.enemyManager.getColliders();
                for (const box of colliders) {
                    if (Physics.checkCircleAABB(this.player.getCircle(), box)) {
                        this.triggerGameOver();
                        return;
                    }
                }
            }
        }
    }

    render() {
        const ctx = this.ctx;

        // Apply screen shake
        const shakeApplied = this.hud.applyShake(ctx);

        // 1. Dynamic Parallax Background
        this.background.draw(ctx, this.score, this.frames);

        // 2. Pipes and Collectibles
        this.enemyManager.draw(ctx);

        // 3. Player Bird
        this.player.draw(ctx);

        // 4. Particle Effects
        this.particleSystem.draw(ctx);

        // Restore screen shake transform
        this.hud.restoreShake(ctx, shakeApplied);

        // 5. HUD and UI Overlay
        this.hud.draw(
            ctx,
            this.currentState,
            this.score,
            this.currentStars,
            this.player,
            this.soundManager.muted,
            this.frames
        );
    }
}
