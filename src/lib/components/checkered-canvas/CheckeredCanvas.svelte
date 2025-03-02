<script lang="ts">
	let checkeredCanvas: any;
	let { imageWidth, imageHeight } = $props();

	$effect(() => {
		if (checkeredCanvas) {
			checkeredCanvas.width = imageWidth;
			checkeredCanvas.height = imageHeight;
			drawCheckeredPattern();
		}
	});

	function drawCheckeredPattern() {
		const canvas = checkeredCanvas;
		const ctx = canvas.getContext('2d');
		const size = 5;

		if (!canvas) {
			return;
		}

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
</script>

<canvas id="checkered" class="absolute z-0" bind:this={checkeredCanvas} height="800" width="800">
</canvas>
