<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import CheckeredCanvas from '$lib/components/checkered-canvas/CheckeredCanvas.svelte';
	import ExampleImageSelector from '$lib/components/example-image-selector/ExampleImageSelector.svelte';
	import HiddenCanvas from '$lib/components/hidden-canvas/HiddenCanvas.svelte';
	import ImageCanvas from '$lib/components/image-canvas/ImageCanvas.svelte';
	import LineDrawer from '$lib/components/line-drawer/LineDrawer.svelte';
	import SettingsView from '$lib/components/settings-view';
	import { Button } from '$lib/components/ui/button';
	import DragDrop from '$lib/components/ux/drag-drop/drag-drop.svelte';
	import ExampleImages from '$lib/example-images';
	import Image2 from '$lib/model/image';
	import type Line from '$lib/model/line';
	import {
		sendPosthogPageLeaveEvent,
		sendPosthogPageViewEvent,
		sendRemoveBackgroundEvent
	} from '$lib/posthog';
	import edgeDetection from '$lib/remove-background/edge-detection';
	import removeSolidColor from '$lib/remove-background/remove-solid-color';
	import { Settings } from '$lib/settings.svelte';
	import { onDestroy, onMount } from 'svelte';

	//TODO: If we determine that the background is solid color-ish then we can simply remove that from the image edges untill we reach an object
	//TODO: How do we remove the background for more complicated images?

	let container: any;
	let imageWidth = $state(0);
	let imageHeight = $state(0);
	let lines: Array<Line> = [];
	let imageCanvas: ImageCanvas;
	let image2: Image2 | null = $state(null);
	let settings: Settings | null = $state(null);
	let droppedImage: string | null = $state(null);
	let htmlImage: HTMLImageElement | null = $state(null);

	onMount(() => {
		settings = Settings.instance;
        droppedImage = ExampleImages.instance.selectImage(settings.lastExampleImage);
        settings.lastExampleImage += 1;
		sendPosthogPageViewEvent($page.url.href);

		onDestroy(() => {
			if (browser) {
				console.log('Destryo');
				sendPosthogPageLeaveEvent($page.url.href);
			}
		});
	});

	$effect(() => {
		if (droppedImage) {
			setup();
		}
	});

	function setup() {
		let image = new Image();
		image.src = droppedImage!;
		image.onload = function () {
			const { width, height } = scaleImage(image);

			imageWidth = width;
			imageHeight = height;

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
		setup();
	}

	function removeBackground() {
		sendRemoveBackgroundEvent();
		if (!image2) {
			return;
		}
        edgeDetection(image2);
		//removeSolidColor(image2, settings?.singleColorThreshold ?? 0);
		imageCanvas.update();
		if (settings?.autoDownload) {
			download();
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

	function selectExampleImage(image: string) {
		droppedImage = image;
		reset();
	}
</script>

<div>
	<h1>Welcome to SvelteKit</h1>
	<SettingsView {settings}></SettingsView>
</div>

<div>
	<Button onclick={reset}>Reset</Button>
	<Button onclick={download}>Download</Button>
</div>

<div>
	<ExampleImageSelector onSelect={selectExampleImage}></ExampleImageSelector>
</div>

<DragDrop bind:droppedImage></DragDrop>

<div class="relative border-[1px] border-black" bind:this={container}>
	<CheckeredCanvas {imageWidth} {imageHeight}></CheckeredCanvas>
	<LineDrawer {imageWidth} {imageHeight} threshold={settings?.singleColorThreshold}></LineDrawer>
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
