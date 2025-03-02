import type Image2 from "$lib/model/image";
import type { Pixel } from "$lib/model/pixel";
import type { RGBA } from "$lib/model/rgba";
import { colorDifference } from "$lib/util";

export default function removeSolidColor(image: Image2) {
    // Count occurrences of edge colors
    let colorCount = new Map<string, number>();

    function rgbaToString(rgba: RGBA) {
        return rgba.join(',');
    }

    function stringToRgba(str: string): RGBA {
        return str.split(',').map(Number) as RGBA;
    }

    // Collect edge pixels
    let edgePixels: Pixel[] = [];

    // Top and bottom edges
    for (let x = 0; x < image.width; x++) {
        edgePixels.push(image.pixels[x]); // Top
        edgePixels.push(image.pixels[(image.height - 1) * image.width + x]); // Bottom
    }

    // Left and right edges
    for (let y = 0; y < image.height; y++) {
        edgePixels.push(image.pixels[y * image.width]); // Left
        edgePixels.push(image.pixels[y * image.width + (image.width - 1)]); // Right
    }

    // Count color occurrences
    for (let pixel of edgePixels) {
        let colorStr = rgbaToString(pixel.rgba);
        colorCount.set(colorStr, (colorCount.get(colorStr) || 0) + 1);
    }

    // Find the most common edge color
    let mostCommonColorStr = [...colorCount.entries()].reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    let mostCommonColor = stringToRgba(mostCommonColorStr);
    console.log(mostCommonColor);

    // Remove background pixels starting from the edges
    let threshold = 0.2; // 20% threshold
    let queue: Pixel[] = [...edgePixels];

    while (queue.length > 0) {
        let pixel = queue.pop()!;
        if (pixel.marked) continue; // Skip already processed pixels

        let diff = colorDifference(pixel.rgba, mostCommonColor);
        if (diff < threshold) {
            pixel.marked = true; // Remove pixel
            pixel.rgba[3] = 0;

            const neighbors = image.getNeighbours([pixel.x, pixel.y]);
            for (let neighbor of neighbors) {
                if (!neighbor.marked) queue.push(neighbor);
            }
        }
    }
}