import type { XY } from "./coordinates";
import type { Pixel } from "./pixel";

export default class Image2 {
    pixels: Pixel[] = [];
    width: number;
    height: number;

    constructor(imgData: ImageData) {
        this.width = imgData.width;
        this.height = imgData.height;
        for (let i = 0; i < imgData.data.length; i += 4) {
            const x = (i / 4) % this.width;
            const y = Math.floor(i / 4 / this.width);
            this.pixels.push({
                x: x,
                y: y,
                rgba: [imgData.data[i], imgData.data[i + 1], imgData.data[i + 2], imgData.data[i + 3]],
                marked: false
            });
        }
    }

    getPixel(x: number, y: number): Pixel {
        return this.pixels[y * this.width + x];
    }

    getNeighbours(xy: XY): Pixel[] {
        const [x, y] = xy;
        const neighbours: Pixel[] = [];

        if (x > 0) {
            neighbours.push(this.getPixel(x - 1, y));
        }
        if (x < this.width - 1) {
            neighbours.push(this.getPixel(x + 1, y));
        }
        if (y > 0) {
            neighbours.push(this.getPixel(x, y - 1));
        }
        if (y < this.height - 1) {
            neighbours.push(this.getPixel(x, y + 1));
        }

        return neighbours;
    }

    copy() {
        const imageData = new ImageData(this.width, this.height);
        imageData.data.set(this.pixels.map((p) => p.rgba).flat(1));
        return new Image2(imageData);
    }
}
