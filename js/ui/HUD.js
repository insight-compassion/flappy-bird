/**
 * HUD & UI Rendering System with Screen Shake, Dash Skill Gauge, and Audio Controls
 */
import { CANVAS, GAME_STATES, STORAGE_KEYS } from '../config.js';

export class HUD {
    constructor() {
        this.highScore = this.loadHighScore();
        this.totalStars = this.loadTotalStars();
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;

        // Sound toggle button bounds on canvas
        this.audioButton = {
            x: CANVAS.WIDTH - 44,
            y: 14,
            width: 32,
            height: 32
        };
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

    loadTotalStars() {
        try {
            return parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_STARS), 10) || 0;
        } catch (e) {
            return 0;
        }
    }

    addStar() {
        this.totalStars++;
        try {
            localStorage.setItem(STORAGE_KEYS.TOTAL_STARS, this.totalStars);
        } catch (e) {}
    }

    triggerShake(intensity = 8, duration = 12) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    update(dtFactor = 1) {
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

    isAudioButtonClicked(canvasX, canvasY) {
        const btn = this.audioButton;
        return (
            canvasX >= btn.x &&
            canvasX <= btn.x + btn.width &&
            canvasY >= btn.y &&
            canvasY <= btn.y + btn.height
        );
    }

    draw(ctx, state, score, currentStars, player, isMuted, frames = 0) {
        const W = CANVAS.WIDTH;
        const H = CANVAS.HEIGHT;

        // 1. Audio Mute/Unmute Button in Top Right
        this.drawAudioButton(ctx, isMuted);

        // 2. State-specific UI
        if (state === GAME_STATES.IDLE) {
            this.drawIdleScreen(ctx, W, H);
        } else if (state === GAME_STATES.PLAYING) {
            this.drawPlayingHUD(ctx, W, H, score, currentStars, player, frames);
        } else if (state === GAME_STATES.GAMEOVER) {
            this.drawGameOverScreen(ctx, W, H, score, currentStars);
        }
    }

    drawAudioButton(ctx, isMuted) {
        const btn = this.audioButton;
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 6);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
            ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
        }

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isMuted ? '🔇' : '🔊', btn.x + btn.width / 2, btn.y + btn.height / 2 + 1);
        ctx.restore();
    }

    drawIdleScreen(ctx, W, H) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';

        // Title with cyan gradient / shadow
        ctx.font = '900 32px sans-serif';
        ctx.strokeText('FLAPPY BIRD', W / 2, 160);
        ctx.fillText('FLAPPY BIRD', W / 2, 160);

        // Subtitle badge
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.strokeText('DELUXE EDITION', W / 2, 185);
        ctx.fillText('DELUXE EDITION', W / 2, 185);

        // Control instructions
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.lineWidth = 3;
        ctx.strokeText('跳躍: 空白鍵 / ↑ / 點擊', W / 2, 360);
        ctx.fillText('跳躍: 空白鍵 / ↑ / 點擊', W / 2, 360);

        ctx.fillStyle = '#38bdf8';
        ctx.strokeText('衝刺技能: SHIFT / ↓ / 右鍵', W / 2, 390);
        ctx.fillText('衝刺技能: SHIFT / ↓ / 右鍵', W / 2, 390);

        // High score indicator
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.strokeText(`最高紀錄: ${this.highScore}  |  ★ ${this.totalStars}`, W / 2, 425);
        ctx.fillText(`最高紀錄: ${this.highScore}  |  ★ ${this.totalStars}`, W / 2, 425);

        ctx.restore();
    }

    drawPlayingHUD(ctx, W, H, score, currentStars, player, frames) {
        ctx.save();

        // Star Counter in top-left
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.fillRect(14, 14, 75, 28);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(14, 14, 75, 28);

        ctx.fillStyle = '#facc15';
        ctx.font = '900 15px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`★ ${currentStars}`, 22, 33);

        // Big Main Score
        ctx.font = '900 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeText(score, W / 2, 75);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(score, W / 2, 75);

        // Dash Skill Meter Gauge
        if (player) {
            const dashReady = player.canDash();
            const progress = player.getDashCooldownProgress();

            const barW = 140;
            const barH = 10;
            const barX = (W - barW) / 2;
            const barY = H - 35;

            // Background container
            ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
            ctx.fillRect(barX - 4, barY - 18, barW + 8, barH + 24);
            ctx.strokeStyle = dashReady ? '#38bdf8' : '#475569';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(barX - 4, barY - 18, barW + 8, barH + 24);

            // Label
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = dashReady ? '#38bdf8' : '#94a3b8';
            ctx.textAlign = 'center';
            const labelText = dashReady ? 'DASH READY [SHIFT / ↓]' : 'DASH CHARGING...';
            ctx.fillText(labelText, W / 2, barY - 6);

            // Fill meter
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(barX, barY, barW, barH);

            if (dashReady) {
                // Pulsing glow when ready
                const pulse = Math.sin(frames * 0.15) * 0.2 + 0.8;
                ctx.fillStyle = `rgba(56, 189, 248, ${pulse})`;
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 8;
                ctx.fillRect(barX, barY, barW, barH);
            } else {
                ctx.fillStyle = '#0ea5e9';
                ctx.fillRect(barX, barY, barW * progress, barH);
            }
        }

        ctx.restore();
    }

    drawGameOverScreen(ctx, W, H, score, currentStars) {
        ctx.save();

        // Dark dim overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, W, H);

        // Dialog Box
        const boxW = 240;
        const boxH = 220;
        const boxX = (W - boxW) / 2;
        const boxY = 170;

        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxW, boxH, 12);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeRect(boxX, boxY, boxW, boxH);
        }

        // GAME OVER Title
        ctx.font = '900 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText('GAME OVER', W / 2, boxY + 40);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('GAME OVER', W / 2, boxY + 40);

        // Stats
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(`本次得分: ${score}`, W / 2, boxY + 80);
        ctx.fillText(`獲得星星: ★ ${currentStars}`, W / 2, boxY + 110);
        ctx.fillText(`歷史最高: ${this.highScore}`, W / 2, boxY + 140);

        // Medal indicator
        let medal = '🥉';
        if (score >= 30) medal = '👑';
        else if (score >= 20) medal = '🥇';
        else if (score >= 10) medal = '🥈';
        ctx.font = '24px sans-serif';
        ctx.fillText(medal, W / 2, boxY + 180);

        // Restart prompt
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText('按 空白鍵 或 點擊 重新開始', W / 2, 430);
        ctx.fillText('按 空白鍵 或 點擊 重新開始', W / 2, 430);

        ctx.restore();
    }
}
