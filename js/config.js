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
    ROTATION_SPEED_FACTOR: 0.08,
    // Skill: Air Dash / Dive
    DASH_COOLDOWN_FRAMES: 160, // ~2.6 seconds at 60 FPS
    DASH_DURATION_FRAMES: 12,  // brief rapid horizontal/forward dash
    DASH_IMPULSE_VY: -1.2,     // slight upward lift during dash
    DASH_SPEED_MULTIPLIER: 2.2
};

export const PIPE_CONFIG = {
    WIDTH: 54,
    GAP: 125,
    SPEED: 2.2,
    SPAWN_INTERVAL_FRAMES: 100,
    MIN_TOP: 50,
    MAX_TOP: CANVAS.HEIGHT - WORLD.GROUND_HEIGHT - 125 - 50,
    // Oscillating pipe variety
    OSCILLATE_CHANCE: 0.35,     // 35% chance to be an oscillating pipe
    OSCILLATE_AMPLITUDE: 32,
    OSCILLATE_SPEED: 0.035
};

export const STAR_CONFIG = {
    RADIUS: 9,
    SPAWN_CHANCE: 0.65, // 65% chance to have a collectible star in pipe gap
    SCORE_VALUE: 2
};

export const PARALLAX_CONFIG = {
    SKY_DAY_TOP: '#38bdf8',
    SKY_DAY_BOT: '#bae6fd',
    SKY_DUSK_TOP: '#312e81',
    SKY_DUSK_MID: '#c026d3',
    SKY_DUSK_BOT: '#fb923c',
    SKY_NIGHT_TOP: '#020617',
    SKY_NIGHT_BOT: '#1e1b4b',
    MOUNTAIN_SPEED: 0.3,
    CITY_SPEED: 0.7,
    CLOUD_SPEED_MIN: 0.2,
    CLOUD_SPEED_MAX: 0.6
};

export const GAME_STATES = {
    IDLE: 0,
    PLAYING: 1,
    GAMEOVER: 2
};

export const INPUT_CONFIG = {
    JUMP_KEYS: ['Space', 'ArrowUp', 'KeyW'],
    DASH_KEYS: ['ShiftLeft', 'ShiftRight', 'KeyS', 'ArrowDown', 'KeyX', 'KeyE'],
    MUTE_KEYS: ['KeyM']
};

export const STORAGE_KEYS = {
    HIGH_SCORE: 'fb_highscore',
    TOTAL_STARS: 'fb_total_stars'
};
