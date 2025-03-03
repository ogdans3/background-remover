import type Image2 from "$lib/model/image";
import type { Pixel } from "$lib/model/pixel";
import type { RGBA } from "$lib/model/rgba";
import { colorDifference } from "$lib/util";
import { findColor } from "./remove-solid-color";

function sobelEdgeDetection(image: Image2) {
    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    const imageCopy = image.copy();

    for (let y = 0; y < imageCopy.height; y++) {
        for (let x = 0; x < imageCopy.width; x++) {
            let gx = 0, gy = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const nx = Math.min(Math.max(x + kx, 0), imageCopy.width - 1);
                    const ny = Math.min(Math.max(y + ky, 0), imageCopy.height - 1);

                    const pixel = imageCopy.getPixel(nx, ny);
                    const intensity = (pixel.rgba[0] + pixel.rgba[1] + pixel.rgba[2]) / 3;

                    gx += intensity * sobelX[ky + 1][kx + 1];
                    gy += intensity * sobelY[ky + 1][kx + 1];
                }
            }

            let magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy));
            image.pixels[y * image.width + x] = {
                x,
                y,
                rgba: [magnitude, magnitude, magnitude, 255],
                marked: false
            };
        }
    }
}

function removeSolidColor(image: Image2, originalImage: Image2, singleColorThreshold: number, color?: RGBA) {
    let edgePixels: Pixel[] = [];
    let originalEdgePixels: Pixel[] = [];

    for (let x = 0; x < image.width; x++) {
        originalEdgePixels.push(originalImage.pixels[x]); // Top
        originalEdgePixels.push(originalImage.pixels[(originalImage.height - 1) * originalImage.width + x]); // Bottom
    }

    for (let y = 0; y < image.height; y++) {
        originalEdgePixels.push(originalImage.pixels[y * originalImage.width]); // Left
        originalEdgePixels.push(originalImage.pixels[y * originalImage.width + (originalImage.width - 1)]); // Right
    }

    const originalEdgeMedianColor = findColor(originalEdgePixels);

    for (let x = 0; x < image.width; x++) {
        let op = originalImage.pixels[x];
        if (colorDifference(op.rgba, originalEdgeMedianColor) <= singleColorThreshold) {
            edgePixels.push(image.pixels[x]); // Top
        }
        op = originalImage.pixels[(originalImage.height - 1) * originalImage.width + x];
        if (colorDifference(op.rgba, originalEdgeMedianColor) <= singleColorThreshold) {
            edgePixels.push(image.pixels[(image.height - 1) * image.width + x]); // Bottom
        }
    }

    for (let y = 0; y < image.height; y++) {
        let op = originalImage.pixels[y * originalImage.width];
        if (colorDifference(op.rgba, originalEdgeMedianColor) <= singleColorThreshold) {
            edgePixels.push(image.pixels[y * image.width]); // Left
        }
        op = originalImage.pixels[y * originalImage.width + (originalImage.width - 1)];
        if (colorDifference(op.rgba, originalEdgeMedianColor) <= singleColorThreshold) {
            edgePixels.push(image.pixels[y * image.width + (image.width - 1)]); // Right
        }
    }

    color = color ?? findColor(edgePixels);
    let queue: Pixel[] = [...edgePixels];

    while (queue.length > 0) {
        let pixel = queue.pop()!;
        if (pixel.marked) {
            continue;
        }

        let diff = colorDifference(pixel.rgba, color);
        if (diff < singleColorThreshold) {
            pixel.marked = true;
            pixel.rgba[3] = 0;

            const neighbors = image.getNeighbours([pixel.x, pixel.y]);
            for (let neighbor of neighbors) {
                if (!neighbor.marked) queue.push(neighbor);
            }
        }
    }
}

export default function edgeDetection(image: Image2) {
    let threshold = 0.05;
    const originalImage = image.copy();
    sobelEdgeDetection(image);
    image.unmark();
    //removeSolidColor(image, 0.1, [0, 0, 0, 0]);
    removeSolidColor(image, originalImage, threshold, [0, 0, 0, 255]);
}