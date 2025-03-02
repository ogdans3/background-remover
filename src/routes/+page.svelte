<script lang="ts">
	import otherImage from '$lib/assets/100_1_small.png';
	import otherImage2 from '$lib/assets/test2.jpeg';
	import CheckeredCanvas from '$lib/components/checkered-canvas/CheckeredCanvas.svelte';
	import HiddenCanvas from '$lib/components/hidden-canvas/HiddenCanvas.svelte';
	import ImageCanvas from '$lib/components/image-canvas/ImageCanvas.svelte';
	import LineDrawer from '$lib/components/line-drawer/LineDrawer.svelte';
	import SettingsView from '$lib/components/settings-view';
	import { Button } from '$lib/components/ui/button';
	import DragDrop from '$lib/components/ux/drag-drop/drag-drop.svelte';
	import Image2 from '$lib/model/image';
	import type Line from '$lib/model/line';
	import removeSolidColor from '$lib/remove-background/remove-solid-color';
	import { Settings } from '$lib/settings.svelte';
	import { onMount } from 'svelte';

	//TODO: If we determine that the background is solid color-ish then we can simply remove that from the image edges untill we reach an object
	//TODO: How do we remove the background for more complicated images?

	console.log(otherImage, otherImage2);

	let settings: Settings | null = $state(null);
	onMount(() => {
		settings = Settings.instance;
	});
	let imageCanvas: ImageCanvas;
	let droppedImage: string | null = $state(otherImage);
	let htmlImage: HTMLImageElement | null = $state(null);
	let image2: Image2 | null = $state(null);
	let threshold = 0.2;
	let container: any;
	let lines: Array<Line> = [];
	let imageWidth = $state(0);
	let imageHeight = $state(0);

	$effect(() => {
		console.log('This too?');
		if (droppedImage) {
			setup();
		}
	});

	/*
	$effect(() => {
		if (image2) {
            console.log("From here?");
			removeBackground();
		}
	});
    */

	function setup() {
        console.log("Setup");
		let image = new Image();
		image.src = droppedImage!;
		image.onload = function () {
			const { width, height } = scaleImage(image);

			imageWidth = width;
			imageHeight = height;

			console.log('W, H: ', imageWidth, imageHeight);

			container.style.width = width + 2 + 'px';
			container.style.height = height + 2 + 'px';
			lines = [];
			htmlImage = image;
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

	function reset() {
        console.log("Reset");
		setup();
	}

	function removeBackground() {
		console.log('Remove background');
		if (!image2) {
			return;
		}
		removeSolidColor(image2);
		imageCanvas.update();
		if (settings?.autoDownload) {
			console.log('Download');
			//download();
		}
	}

	function imageLoaded() {
		if (settings?.removeBackgroundOnLoad) {
			removeBackground();
		}
	}

	function download() {
		imageCanvas.download();
	}
</script>

<h1>Welcome to SvelteKit</h1>
<SettingsView {settings}></SettingsView>

<Button onclick={reset}>Reset</Button>
<Button onclick={download}>Download</Button>

<DragDrop bind:droppedImage></DragDrop>

<div class="relative border-[1px] border-black" bind:this={container}>
	<CheckeredCanvas {imageWidth} {imageHeight}></CheckeredCanvas>
	<LineDrawer {imageWidth} {imageHeight} {threshold}></LineDrawer>
	<ImageCanvas
		bind:this={imageCanvas}
		bind:image2
		{imageWidth}
		{imageHeight}
		image={htmlImage}
		onLoad={imageLoaded}
	></ImageCanvas>
	<HiddenCanvas {imageWidth} {imageHeight}></HiddenCanvas>
</div>
