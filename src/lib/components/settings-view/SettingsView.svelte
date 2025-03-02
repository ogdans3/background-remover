<script lang="ts">
	const { settings } = $props();
</script>

{#if settings}
	<div class="border-2 border-black p-2 m-2">
		<div>These settings are saved in a browser cookie for easy of use</div>
		<div class="flex gap-4">
			<div>
				<label>
					Auto download
					<input type="checkbox" bind:checked={settings.autoDownload} />
				</label>
			</div>

			<div>
				<label>
					Remove solid color
					<input type="checkbox" bind:checked={settings.removeSolidColor} />
				</label>
			</div>

			<div>
				<label>
					Remove background on image load
					<input type="checkbox" bind:checked={settings.removeBackgroundOnLoad} />
				</label>
			</div>
		</div>
	</div>
{/if}
