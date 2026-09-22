/**
 * Global Configuration and Tuning Constants
 */

export const CANVAS = {
    WIDTH: 360,
    HEIGHT: 640
};

export const WORLD = {
    GROUND_HEIGHT: 100,
    GRAVITY: 0.25,
    DEAD_GRAVITY_MULTIPLIER: 1.5
};

export const BIRD_CONFIG = {
    START_X: 80,
    START_Y: 280,
    RADIUS: 13,
    JUMP_FORCE: -5.5,
    ROTATION_MAX_UP: -Math.PI / 6,
    ROTATION_MAX_DOWN: Math.PI / 2,
    ROTATION_SPEED_FACTOR: 0.08
};

export const PIPE_CONFIG = {
    WIDTH: 54,
    GAP: 125,
    SPEED: 2.2,
    SPAWN_INTERVAL_FRAMES: 100,
    MIN_TOP: 50,
    // maxTop = HEIGHT - GROUND_HEIGHT - GAP - 50 = 365
    MAX_TOP: CANVAS.HEIGHT - WORLD.GROUND_HEIGHT - 125 - 50
};

export const GAME_STATES = {
    IDLE: 0,
    PLAYING: 1,
    GAMEOVER: 2
};

export const INPUT_CONFIG = {
    KEYS: ['Space', 'ArrowUp', 'KeyW']
};

export const STORAGE_KEYS = {
    HIGH_SCORE: 'fb_highscore'
};
