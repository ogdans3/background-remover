
import dangerSignBig from '$lib/assets/example-images/100_1.jpg';
import dangerSign from '$lib/assets/example-images/100_1_small.png';
import appSquareLogo from '$lib/assets/example-images/app-square.png';
import manWithCow from '$lib/assets/example-images/man-with-cow.jpg';
import penGreen from '$lib/assets/example-images/pen-green.jpeg';
import personBlurredBackground from '$lib/assets/example-images/person-blurred-background.jpeg';
import personBrownBackgroundNonSolidColor from '$lib/assets/example-images/person-brown-background-non-solid.jpeg';
import personDrawingWhiteBackground from '$lib/assets/example-images/person-drawing-white-background.png';
import personWhiteBackground from '$lib/assets/example-images/person-white-background.jpeg';
import personYellowBackground from '$lib/assets/example-images/person-yellow-background.jpeg';
import theoT3 from '$lib/assets/example-images/theo_t3.jpg';

const exampleImages = {
    theoT3,
    penGreen,
    dangerSign,
    manWithCow,
    dangerSignBig,
    appSquareLogo,
    personWhiteBackground,
    personYellowBackground,
    personBlurredBackground,
    personDrawingWhiteBackground,
    personBrownBackgroundNonSolidColor,
};
class ExampleImages {
    static _instance: ExampleImages;
    private constructor() {
    }

    public static get instance(): ExampleImages {
        if (!ExampleImages._instance) {
            ExampleImages._instance = new ExampleImages();
        }

        return ExampleImages._instance;
    }

    selectRandomImage() {
        const images = Object.values(exampleImages);
        return images[Math.floor(Math.random() * images.length)];
    }

    selectImage(index: number) {
        const images = Object.values(exampleImages);
        return images[index];
    }

    get images() {
        return exampleImages;
    }

    get length() {
        return Object.values(exampleImages).length;
    }
}


export default ExampleImages;
