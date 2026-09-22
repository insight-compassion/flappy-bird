/**
 * Physics & Collision Detection System
 */

export class Physics {
    /**
     * Checks if a circle overlaps an axis-aligned bounding box (AABB)
     * using the exact boundary bounds matching classic Flappy Bird hitboxes.
     * @param {Object} circle { x, y, radius }
     * @param {Object} box { x, y, width, height }
     * @returns {boolean}
     */
    static checkCircleAABB(circle, box) {
        return (
            circle.x + circle.radius > box.x &&
            circle.x - circle.radius < box.x + box.width &&
            circle.y + circle.radius > box.y &&
            circle.y - circle.radius < box.y + box.height
        );
    }

    /**
     * Checks collision between bird circle and ground limit.
     * @param {Object} circle { x, y, radius }
     * @param {number} groundY
     * @returns {boolean}
     */
    static checkCircleGround(circle, groundY) {
        return circle.y + circle.radius >= groundY;
    }

    /**
     * Standard AABB vs AABB collision.
     * @param {Object} rectA { x, y, width, height }
     * @param {Object} rectB { x, y, width, height }
     * @returns {boolean}
     */
    static checkAABB(rectA, rectB) {
        return (
            rectA.x < rectB.x + rectB.width &&
            rectA.x + rectA.width > rectB.x &&
            rectA.y < rectB.y + rectB.height &&
            rectA.y + rectA.height > rectB.y
        );
    }
}
