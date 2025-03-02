import type { XY } from "./coordinates";

export default class Line {
    from: XY;
    to: XY;
    constructor(from: XY, to: XY) {
        this.from = from;
        this.to = to;
    }

    scale(width: number, height: number, originalWidth: number, originalHeight: number): Line {
        // Scaling factors based on the target width and height
        const scaleX = width / originalWidth;
        const scaleY = height / originalHeight;

        // Scale the coordinates
        return new Line(
            [this.from[0] * scaleX, this.from[1] * scaleY],
            [this.to[0] * scaleX, this.to[1] * scaleY]
        );
    }

    getCoordinates(): Array<XY> {
        const [x1, y1] = this.from;
        const [x2, y2] = this.to;

        let points: Array<XY> = [];

        // Special case: Vertical line (same x-coordinate)
        if (x1 === x2) {
            const startY = Math.min(y1, y2);
            const endY = Math.max(y1, y2);
            for (let y = startY; y <= endY; y++) {
                points.push([x1, y]);
            }
            return points;
        }

        // Special case: Horizontal line (same y-coordinate)
        if (y1 === y2) {
            const startX = Math.min(x1, x2);
            const endX = Math.max(x1, x2);
            for (let x = startX; x <= endX; x++) {
                points.push([x, y1]);
            }
            return points;
        }

        // General case: Diagonal lines
        const dx = x2 - x1;
        const dy = y2 - y1;
        const stepX = dx > 0 ? 1 : -1;
        const stepY = dy > 0 ? 1 : -1;

        let x = x1;
        let y = y1;

        while (x !== x2 || y !== y2) {
            points.push([x, y]);

            // Move in the direction of the line
            if (Math.abs((y + stepY - y1) / dy) < Math.abs((x + stepX - x1) / dx)) {
                y += stepY;
            } else {
                x += stepX;
            }
        }

        // Add the last point
        points.push([x2, y2]);

        return points;
    }
}
