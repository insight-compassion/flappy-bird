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
     * Checks collision between two circles (e.g. bird and star item)
     * @param {Object} c1 { x, y, radius }
     * @param {Object} c2 { x, y, radius }
     * @returns {boolean}
     */
    static checkCircleCircle(c1, c2) {
        const dx = c1.x - c2.x;
        const dy = c1.y - c2.y;
        const distSq = dx * dx + dy * dy;
        const radiusSum = c1.radius + c2.radius;
        return distSq <= radiusSum * radiusSum;
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
