/**
 * Application Bootstrap and Game Entry Point
 */
import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element #gameCanvas not found.');
        return;
    }

    const game = new Game(canvas);
    game.start();
});
