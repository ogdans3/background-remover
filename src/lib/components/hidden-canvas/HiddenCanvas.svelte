<script lang="ts">
	let canvas: any;
	let { imageWidth, imageHeight } = $props();

	$effect(() => {
		if (canvas) {
			canvas.width = imageWidth;
			canvas.height = imageHeight;

			//canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
			//canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
		}
	});
</script>

<canvas id="hidden-canvas" class="hidden" bind:this={canvas}> </canvas>
