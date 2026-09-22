/**
 * Abstract Base Entity Class
 */

export class Entity {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
    }

    /**
     * Update entity state
     * @param {number} dt Delta time in seconds
     * @param {number} dtFactor Normalization factor against 60 FPS
     */
    update(dt, dtFactor) {
        // Base update implementation
    }

    /**
     * Render entity to canvas context
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        // Base draw implementation
    }

    /**
     * Returns AABB bounding box for collisions
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
