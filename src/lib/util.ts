
export function colorDifference(rgba1: RGBA, rgba2: RGBA) {
    let diff = Math.sqrt(
        Math.pow(rgba1[0] - rgba2[0], 2) +
        Math.pow(rgba1[1] - rgba2[1], 2) +
        Math.pow(rgba1[2] - rgba2[2], 2) +
        Math.pow(rgba1[3] - rgba2[3], 2)
    );
    return diff / 510;
}