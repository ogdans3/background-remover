<script lang="ts">
	import Image2 from '$lib/model/image';
	import { untrack } from 'svelte';

	let canvas: any;
	let {
		image2 = $bindable(),
		imageWidth,
		imageHeight,
		image,
		onLoad
	}: {
		image2: Image2 | null;
		imageWidth: number;
		imageHeight: number;
		image: HTMLImageElement | null;
		onLoad: () => void;
	} = $props();

	$effect(() => {
		if (canvas) {
			canvas.width = imageWidth;
			canvas.height = imageHeight;
		}
	});

	$effect(() => {
		console.log(image);
		if (image) {
			//TODO: This is the wrong way to use effects apparently
			untrack(() => setup());
		}
	});

	function setup() {
		const context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(image, 0, 0, imageWidth, imageHeight);
		image2 = new Image2(context.getImageData(0, 0, imageWidth, imageHeight));
		onLoad();
	}

	export function update() {
		if (!image2) {
			return;
		}
		const ctx = canvas.getContext('2d')!;
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		imageData.data.set(image2.pixels.map((p) => p.rgba).flat(1));
		ctx.putImageData(imageData, 0, 0);
	}

	export function download() {
		var link = document.createElement('a');
		link.download = 'filename.png';
		link.href = canvas.toDataURL();
		link.click();
	}
</script>

<canvas id="image" class="absolute z-0" bind:this={canvas} height="800" width="800"> </canvas>
