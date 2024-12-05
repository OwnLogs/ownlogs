<script lang="ts">
  import { onMount } from 'svelte';

  let ApexCharts = $state();
  let chartElement = $state();
  let chart = $state();

  let { options = $bindable() } = $props();

  onMount(async () => {
    const module = await import('apexcharts');
    ApexCharts = module.default;
    Object.assign(window, { ApexCharts });

    chart = new ApexCharts(chartElement, options);
    chart.render();
  });
</script>

<div bind:this={chartElement}></div>
