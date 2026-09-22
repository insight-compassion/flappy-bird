/**
 * HUD & UI Rendering System with Screen Shake and Feedback Meters
 */
import { CANVAS, GAME_STATES, STORAGE_KEYS } from '../config.js';

export class HUD {
    constructor() {
        this.highScore = this.loadHighScore();
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;

        // Flap feedback / cooldown visualization
        this.flapCooldownProgress = 1.0; // 0 (just flapped) to 1 (ready)
    }

    loadHighScore() {
        try {
            return parseInt(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE), 10) || 0;
        } catch (e) {
            return 0;
        }
    }

    saveHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            try {
                localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, this.highScore);
            } catch (e) {}
        }
    }

    triggerShake(intensity = 8, duration = 12) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    update(dtFactor = 1) {
        // Update screen shake
        if (this.shakeDuration > 0) {
            this.shakeOffsetX = (Math.random() * 2 - 1) * this.shakeIntensity;
            this.shakeOffsetY = (Math.random() * 2 - 1) * this.shakeIntensity;
            this.shakeDuration -= dtFactor;
            this.shakeIntensity = Math.max(0, this.shakeIntensity - 0.5 * dtFactor);
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
            this.shakeIntensity = 0;
        }

        // Recover flap meter
        if (this.flapCooldownProgress < 1.0) {
            this.flapCooldownProgress = Math.min(1.0, this.flapCooldownProgress + 0.1 * dtFactor);
        }
    }

    applyShake(ctx) {
        if (this.shakeOffsetX !== 0 || this.shakeOffsetY !== 0) {
            ctx.save();
            ctx.translate(this.shakeOffsetX, this.shakeOffsetY);
            return true;
        }
        return false;
    }

    restoreShake(ctx, applied) {
        if (applied) {
            ctx.restore();
        }
    }

    triggerFlapFeedback() {
        this.flapCooldownProgress = 0.0;
    }

    /**
     * Render HUD elements based on game state
     */
    draw(ctx, state, score) {
        const W = CANVAS.WIDTH;
        const H = CANVAS.HEIGHT;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';

        if (state === GAME_STATES.IDLE) {
            // Game title
            ctx.font = '900 32px sans-serif';
            ctx.strokeText('FLAPPY BIRD', W / 2, 160);
            ctx.fillText('FLAPPY BIRD', W / 2, 160);

            // Operation prompt
            ctx.font = 'bold 16px sans-serif';
            ctx.lineWidth = 3;
            ctx.strokeText('按下 空白鍵 / 方向鍵 或 點擊跳躍', W / 2, 380);
            ctx.fillText('按下 空白鍵 / 方向鍵 或 點擊跳躍', W / 2, 380);

            // High score indicator
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#fef08a';
            ctx.strokeText(`最高紀錄: ${this.highScore}`, W / 2, 415);
            ctx.fillText(`最高紀錄: ${this.highScore}`, W / 2, 415);

        } else if (state === GAME_STATES.PLAYING) {
            // Live in-game score
            ctx.font = '900 42px sans-serif';
            ctx.strokeText(score, W / 2, 80);
            ctx.fillText(score, W / 2, 80);

            // Cooldown / Flap responsiveness meter bar (subtle top meter)
            this.drawCooldownMeter(ctx);

        } else if (state === GAME_STATES.GAMEOVER) {
            // Dimmed overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, W, H);

            // Game over dialog card
            ctx.fillStyle = '#e2e8f0';
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 3;
            if (ctx.roundRect) {
                ctx.beginPath();
                ctx.roundRect(W / 2 - 110, 180, 220, 190, 10);
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.fillRect(W / 2 - 110, 180, 220, 190);
                ctx.strokeRect(W / 2 - 110, 180, 220, 190);
            }

            // Title
            ctx.fillStyle = '#ef4444';
            ctx.font = '900 28px sans-serif';
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000000';
            ctx.strokeText('GAME OVER', W / 2, 225);
            ctx.fillText('GAME OVER', W / 2, 225);

            // Stats
            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = '#334155';
            ctx.textAlign = 'center';
            ctx.fillText(`本次得分: ${score}`, W / 2, 270);
            ctx.fillText(`最高紀錄: ${this.highScore}`, W / 2, 300);

            // Restart prompt
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 15px sans-serif';
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000000';
            ctx.strokeText('按 空白鍵 或 點擊 重新開始', W / 2, 420);
            ctx.fillText('按 空白鍵 或 點擊 重新開始', W / 2, 420);
        }
    }

    /**
     * Draw subtle jump responsiveness / readiness indicator meter
     */
    drawCooldownMeter(ctx) {
        const barW = 60;
        const barH = 4;
        const barX = (CANVAS.WIDTH - barW) / 2;
        const barY = 100;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(barX, barY, barW, barH);

        ctx.fillStyle = this.flapCooldownProgress >= 1.0 ? '#22c55e' : '#facc15';
        ctx.fillRect(barX, barY, barW * this.flapCooldownProgress, barH);
    }
}
