<script lang="ts">
  import { format } from 'date-fns';
  import { onMount } from 'svelte';
  import { cn } from '$lib/utils';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';

  let ApexCharts: any = $state();
  let chartElement: HTMLDivElement | undefined = $state();
  let chart: any = $state();
  let canShow = $state(false);
  let hasNoData = $state(false);

  let {
    data = $bindable()
  }: {
    data: {
      series: { name: string; data: number[] }[];
      categories: string[];
    } | null;
  } = $props();

  let options = {
    series: [],
    xaxis: {
      type: 'datetime',
      categories: [],
      labels: {
        formatter: function (value: string) {
          return format(new Date(value), 'MMM dd');
        }
      }
    },
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: {
        show: false
      }
    },
    responsive: [
      {
        breakpoint: 700,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }
    ],
    colors: ['#4b5563', '#2563eb', '#d97706', '#dc2626', '#e11d48'],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 5,
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last'
      }
    },
    legend: {
      position: 'right',
      offsetY: 40
    },
    fill: {
      opacity: 1
    }
  };

  onMount(async () => {
    const module = await import('apexcharts');
    ApexCharts = module.default;
    Object.assign(window, { ApexCharts });

    chart = new ApexCharts(chartElement, options);
    chart.render();
  });

  $effect(() => {
    if (chart && data?.series && data?.categories) {
      options.series = data.series as any;
      options.xaxis.categories = data.categories as any;
      chart.updateOptions(options);
      canShow = true;
      hasNoData = data.series.length === 0;
    }
  });

  const skeletonBarHeight = new Array(5).fill(0).map(() => Math.max(Math.random() * 100, 10));
</script>

{#if !canShow}
  <!-- Skeleton loader -->
  <div
    class="w-fulll flex flex-row items-end justify-around gap-8 p-4"
    style="height: {options.chart.height}px;"
  >
    {#each Array(5) as _, i}
      <Skeleton class="w-1/6" style="height: {skeletonBarHeight[i]}%;" />
    {/each}
  </div>
{/if}
{#if hasNoData}
  <div class="flex h-64 items-center justify-center">
    <p class="text-gray-500">No data available</p>
  </div>
{:else}
  <!-- Chart is not in a else statement due to the ApexCharts library needing to access the element to populate it before rendering -->
  <div bind:this={chartElement} class={cn(canShow ? 'block' : 'hidden')}></div>
{/if}
