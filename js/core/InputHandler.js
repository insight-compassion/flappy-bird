/**
 * InputHandler: Manages keyboard, pointer, and touch inputs
 */
import { INPUT_CONFIG } from '../config.js';

export class InputHandler {
    constructor(canvas, onAction) {
        this.canvas = canvas;
        this.onAction = onAction;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);

        this.init();
    }

    init() {
        window.addEventListener('keydown', this.handleKeyDown);
        this.canvas.addEventListener('mousedown', this.handlePointerDown);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.canvas.removeEventListener('mousedown', this.handlePointerDown);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    }

    handleKeyDown(e) {
        if (INPUT_CONFIG.KEYS.includes(e.code)) {
            e.preventDefault();
            this.onAction();
        }
    }

    handlePointerDown(e) {
        e.preventDefault();
        this.onAction();
    }

    handleTouchStart(e) {
        e.preventDefault();
        this.onAction();
    }
}
