/**
 * InputHandler: Manages keyboard, pointer, and touch inputs for Jump, Dash, and UI interactions
 */
import { INPUT_CONFIG } from '../config.js';

export class InputHandler {
    constructor(canvas, onJump, onDash, onToggleAudio, isAudioButtonClicked) {
        this.canvas = canvas;
        this.onJump = onJump;
        this.onDash = onDash;
        this.onToggleAudio = onToggleAudio;
        this.isAudioButtonClicked = isAudioButtonClicked;

        this.lastTapTime = 0;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);

        this.init();
    }

    init() {
        window.addEventListener('keydown', this.handleKeyDown);
        this.canvas.addEventListener('mousedown', this.handlePointerDown);
        this.canvas.addEventListener('contextmenu', this.handleContextMenu);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.canvas.removeEventListener('mousedown', this.handlePointerDown);
        this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    }

    handleKeyDown(e) {
        if (INPUT_CONFIG.JUMP_KEYS.includes(e.code)) {
            e.preventDefault();
            this.onJump();
        } else if (INPUT_CONFIG.DASH_KEYS.includes(e.code)) {
            e.preventDefault();
            this.onDash();
        } else if (INPUT_CONFIG.MUTE_KEYS.includes(e.code)) {
            e.preventDefault();
            this.onToggleAudio();
        }
    }

    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    handlePointerDown(e) {
        e.preventDefault();
        const pos = this.getCanvasCoordinates(e);

        // Check if audio button was clicked
        if (this.isAudioButtonClicked && this.isAudioButtonClicked(pos.x, pos.y)) {
            this.onToggleAudio();
            return;
        }

        // Right-click = Dash
        if (e.button === 2) {
            this.onDash();
            return;
        }

        // Left-click = Jump
        if (e.button === 0) {
            this.onJump();
        }
    }

    handleContextMenu(e) {
        e.preventDefault(); // Prevent default browser context menu on right click
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 0) return;

        const touch = e.touches[0];
        const pos = this.getCanvasCoordinates(touch);

        // Check audio button tap
        if (this.isAudioButtonClicked && this.isAudioButtonClicked(pos.x, pos.y)) {
            this.onToggleAudio();
            return;
        }

        const now = Date.now();
        // Double tap within 260ms triggers Dash
        if (now - this.lastTapTime < 260) {
            this.onDash();
            this.lastTapTime = 0;
            return;
        }
        this.lastTapTime = now;

        // Normal tap = Jump
        this.onJump();
    }
}
