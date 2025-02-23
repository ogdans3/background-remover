<script lang="ts">
	let isDragging = false;
	export let droppedImage: string | null = null;

	// Handle drag events
	const handleDragOver = (event) => {
		event.preventDefault();
		isDragging = true;
	};

	const handleDragLeave = () => {
		isDragging = false;
	};

	const handleDrop = (event) => {
		event.preventDefault();
		isDragging = false;
		const files = event.dataTransfer.files;

		// Only accept image files
		if (files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('image/')) {
				droppedImage = URL.createObjectURL(file);
			} else {
				alert('Please drop only image files.');
			}
		}
	};

	const handleFileSelect = (event) => {
		const files = event.target.files;
		if (files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('image/')) {
				droppedImage = URL.createObjectURL(file);
			} else {
				alert('Please select an image file.');
			}
		}
	};
</script>

<div
	class="file-drop {isDragging ? 'dragging' : ''}"
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
>
	<p>Drag & Drop an Image Here</p>
	<input type="file" accept="image/*" on:change={handleFileSelect} />
	<button
		class="file-drop-button"
		on:click={() => document.querySelector('input[type="file"]').click()}
	>
		Or Select Image
	</button>
</div>

<style>
	.file-drop {
		border: 2px dashed #ccc;
		padding: 20px;
		text-align: center;
		transition: background-color 0.3s ease;
		cursor: pointer;
	}

	.file-drop.dragging {
		background-color: #f0f0f0;
	}

	.file-drop img {
		max-width: 100%;
		max-height: 200px;
		margin-top: 10px;
	}

	input[type='file'] {
		display: none;
	}

	.file-drop-button {
		margin-top: 10px;
		padding: 10px 20px;
		background-color: #007bff;
		color: white;
		border: none;
		cursor: pointer;
	}
</style>
