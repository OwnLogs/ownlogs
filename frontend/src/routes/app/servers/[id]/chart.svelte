<script lang="ts">
	import { onMount } from 'svelte';

  let { options } = $props();

	let ApexCharts = $state();
	let loaded = $state(false);

	const chart = (node: HTMLDivElement, options: ApexCharts) => {

		if (!loaded)
			return

		let myChart = new ApexCharts(node, options)
		myChart.render()

		return {
			update(options) {
				myChart.updateOptions(options)
			},
			destroy() {
				myChart.destroy()
			}
		}
	}

	onMount(async () => {
		const module = await import('apexcharts');
		ApexCharts = module.default;
    Object.assign(window, { ApexCharts });
		loaded = true
	});

</script>

{#if loaded}
  <div use:chart={options}></div>
{/if}
