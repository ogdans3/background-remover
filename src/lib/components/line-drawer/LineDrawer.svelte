<script lang="ts">
	let canvas2: any;
	let lineStart: XY | null = null;
	let { threshold, imageWidth, imageHeight } = $props();

	$effect(() => {
		if (canvas2) {
			canvas2.width = imageWidth;
			canvas2.height = imageHeight;
		}
	});

	let image: Image | null = $state(null);

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

	//onmousemove={hoverCanvas}
</script>

<canvas
	id="lines"
	class="z-10 absolute"
	bind:this={canvas2}
	height="800"
	width="800"
	onmousedown={startLineDraw}
	onmouseup={stopLineDraw}
	onmouseleave={stopLineDraw}
>
</canvas>
