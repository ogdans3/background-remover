<script lang="ts">
	import ExampleImages from '$lib/example-images';
	import { onMount } from 'svelte';

	let {
		onSelect
	}: {
		onSelect: (image: string) => void;
	} = $props();
	let images: Array<[string, string]> = $state([]);

	onMount(() => {
		images = Object.entries(ExampleImages.instance.images);
		console.log(images);
	});

	export function selectImage(image: [string, string]) {
		onSelect(image[1]);
	}
</script>

<div class="flex gap-4 m-4 flex-wrap">
	{#each images as image}
		<button onclick={() => selectImage(image)} class="hover:cursor-pointer">
			<div class="w-[100px]">
				<div class="break-all">{image[0]}</div>
				<img src={image[1]} alt="yellow line go away" />
			</div>
		</button>
	{/each}
</div>
