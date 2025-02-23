<script lang="ts">
	import otherImage from '$lib/assets/100_1.jpg';
	import { Button } from '$lib/components/ui/button';
	import DragDrop from '$lib/components/ux/drag-drop/drag-drop.svelte';

	let droppedImage: string | null = $state(otherImage);
	let image2: Image2 | null = $state(null);
	let newestImage: Image2 | null = $state(null);
	let threshold = 0.2;
	let canvas: any;
	let canvas2: any;
	let hiddenCanvas: any;
	let checkeredCanvas: any;
	let hoveredColor: any;
	let container: any;

	$effect(() => {
		if (canvas && droppedImage) {
			setup();
		}
	});

	function setup() {
		const context = canvas.getContext('2d');
		let image = new Image();
		image.src = droppedImage!;
		image.onload = function () {
			const { width, height } = scaleImage(image);
            console.log(image.width, image.height);
            console.log(width, height);

			canvas.width = width;
			canvas.height = height;
			canvas2.width = width;
			canvas2.height = height;
			checkeredCanvas.width = width;
			checkeredCanvas.height = height;
			//hiddenCanvas.width = image.width;
			//hiddenCanvas.height = image.height;
			hiddenCanvas.width = width;
			hiddenCanvas.height = height;

			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(image, 0, 0, width, height);
			hiddenCanvas.getContext('2d').clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
			hiddenCanvas.getContext('2d').drawImage(image, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
			image2 = new Image2(context.getImageData(0, 0, width, height));
			container.style.width = width + 2 + 'px';
			container.style.height = height + 2 + 'px';
			lines = [];
			drawLines();
			drawCheckeredPattern();
		};
	}

	function scaleImage(image: any) {
		const maxSize = 600;
		let width = image.width;
		let height = image.height;

		// Calculate new dimensions while keeping the aspect ratio
		if (width > height) {
			height = (maxSize / width) * height;
			width = maxSize;
		} else {
			width = (maxSize / height) * width;
			height = maxSize;
		}
		return { width, height };
	}

	$effect(() => {
		if (checkeredCanvas) {
			drawCheckeredPattern();
		}
	});

	function drawCheckeredPattern() {
		const canvas = checkeredCanvas;
		const ctx = canvas.getContext('2d');
		const size = 5;

		if (!canvas || !image2) {
			return;
		}

		canvas.width = image2.width;
		canvas.height = image2.height;

		for (let row = 0; row < canvas.height / size; row++) {
			for (let col = 0; col < canvas.width / size; col++) {
				// Alternate between black and white squares
				if ((row + col) % 2 === 0) {
					ctx.fillStyle = 'gray';
				} else {
					ctx.fillStyle = 'white';
				}
				ctx.fillRect(col * size, row * size, size, size);
			}
		}
	}

	let lines: Array<Line> = [];
	type XY = [number, number];
	type RGBA = [number, number, number, number];
	type Pixel = { x: number; y: number; rgba: RGBA; marked: boolean };
	function colorDifference(rgba1: RGBA, rgba2: RGBA) {
		let diff = Math.sqrt(
			Math.pow(rgba1[0] - rgba2[0], 2) +
				Math.pow(rgba1[1] - rgba2[1], 2) +
				Math.pow(rgba1[2] - rgba2[2], 2) +
				Math.pow(rgba1[3] - rgba2[3], 2)
		);
		return diff / 510;
	}
	class Image2 {
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

	class Line {
		from: XY;
		to: XY;
		constructor(from: XY, to: XY) {
			this.from = from;
			this.to = to;
		}

		scale(width: number, height: number): Line {
			const originalWidth = canvas.width;
			const originalHeight = canvas.height;

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

	function processLine(line: Line) {
		if (!image2) {
			return;
		}
		const backgroundPixels: Array<Pixel> = [];
		const ctx = canvas.getContext('2d');
		const image = new Image2(ctx.getImageData(0, 0, canvas.width, canvas.height));
		_processLine(image, backgroundPixels, line);

		const pixels = image.pixels;
		for (let pixel of backgroundPixels) {
			const index = pixel.y * image.width + pixel.x;
			pixels[index].rgba = [0, 0, 0, 0];
		}

		newestImage = image;
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		imageData.data.set(pixels.map((p) => p.rgba).flat(1));
		console.log(imageData);
		ctx.putImageData(imageData, 0, 0);
	}

	function _processLine(image: Image2, backgroundPixels: Array<Pixel>, line: Line) {
		line = line.scale(image.width, image.height);
		const coordinates = line.getCoordinates();
		const pixelStack = [];
		console.time('Process Line');
		for (let xy of coordinates) {
			const pixel = image!.getPixel(xy[0], xy[1]);
			if (!pixel) {
				continue;
			}
			if (pixel.marked) {
				continue;
			}
			pixel.marked = true;
			const neighbouringPixels = image!.getNeighbours([pixel.x, pixel.y]);
			pixelStack.push(...neighbouringPixels);
			backgroundPixels.push(pixel);
			while (pixelStack.length !== 0) {
				const pixel2 = pixelStack.shift();
				if (!pixel2) {
					break;
				}
				if (pixel2.marked) {
					continue;
				}
				const neighbouringPixels = image!.getNeighbours([pixel2.x, pixel2.y]);
				const diff = colorDifference(pixel.rgba, pixel2.rgba);
				if (diff <= threshold) {
					pixelStack.push(...neighbouringPixels);
					backgroundPixels.push(pixel2);
					pixelStack.push(pixel2);
				}
				pixel2.marked = true;
			}
		}
		console.timeEnd('Process Line');
		console.log(backgroundPixels);
	}

	let lineStart: XY | null = null;
	function startLineDraw(event: any) {
		const bounding = canvas2.getBoundingClientRect();
		const x = event.clientX - bounding.left;
		const y = event.clientY - bounding.top;
		lineStart = [x, y];
		drawLines(new Line(lineStart, lineStart));
	}

	function stopLineDraw(event: any) {
		const bounding = canvas2.getBoundingClientRect();
		const x = event.clientX - bounding.left;
		const y = event.clientY - bounding.top;
		if (!lineStart) {
			return;
		}
		const line = new Line(lineStart, [x, y]);
		lines.push(line);
		drawLines(line);
		lineStart = null;

		processLine(line);
	}

	function hoverCanvas(event: any) {
		if (!image2 || !newestImage) {
			return;
		}
		const bounding = canvas2.getBoundingClientRect();
		const x = event.clientX - bounding.left;
		const y = event.clientY - bounding.top;
		let pixel = newestImage.getPixel(x, y)?.rgba;
		if (!pixel) {
			return;
		}

		const rgba = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
		hoveredColor.style.background = rgba;
		if (lineStart) {
			drawLines(new Line(lineStart, [x, y]));
		}
	}

	function drawLines(line?: Line) {
		const ctx = canvas2!.getContext('2d');
		if (!ctx) {
			console.error('Canvas context not supported');
			return;
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (let line of lines) {
			drawLine(ctx, line);
		}
		if (line) {
			drawLine(ctx, line);
		}
	}

	function drawLine(ctx: any, line: Line) {
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(line.from[0], line.from[1]);
		ctx.lineTo(line.to[0], line.to[1]);
		ctx.stroke();
	}

	function reset() {
		setup();
	}

	function download() {
		var link = document.createElement('a');
		link.download = 'filename.png';
		link.href = canvas.toDataURL();
		link.click();
	}
</script>

<h1>
	Welcome to SvelteKit

	<div bind:this={hoveredColor} class="w-[20px] h-[20px]"></div>
</h1>
<Button onclick={reset}>Reset</Button>
<Button onclick={download}>Download</Button>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<DragDrop bind:droppedImage></DragDrop>

<div class="relative border-[1px] border-black" bind:this={container}>
	<canvas id="checkered" class="absolute z-0" bind:this={checkeredCanvas} height="800" width="800">
	</canvas>
	<canvas
		id="lines"
		class="z-10 absolute"
		bind:this={canvas2}
		height="800"
		width="800"
		onmousemove={hoverCanvas}
		onmousedown={startLineDraw}
		onmouseup={stopLineDraw}
		onmouseleave={stopLineDraw}
	>
	</canvas>
	<canvas id="image" class="absolute z-0" bind:this={canvas} height="800" width="800"> </canvas>
	<canvas id="hidden-canvas" class="hidden" bind:this={hiddenCanvas}> </canvas>
</div>
