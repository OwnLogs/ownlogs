<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    type: string;
    data: Record<string, any>[];
    xKey: string;
    yKeys: string[];
  }
  const { type = 'line', data = [], xKey = '', yKeys = [] }: Props = $props();

  let chart: any = $state();
  let chartElement: any = $state();
  let ApexCharts;

  onMount(() => {
    (async () => {
    const module = await import('apexcharts');
    ApexCharts = module.default;
    Object.assign(window, { ApexCharts });

    // Prepare chart options
    const series = yKeys.map((key) => ({
      name: key,
      data: data.map((entry) => ({
        x: entry[xKey],
        y: entry[key]
      }))
    }));

    const xaxisType: string = typeof data[0]?.[xKey] === 'number' ? 'numeric' : 'datetime';
    const xaxisLabel: { format:string } | undefined = xaxisType === 'datetime' ? { format: 'yyyy-MM-dd' } : undefined;

    const options = {
      chart: {
        type,
        height: '100%',
        width: '100%',
      },
      xaxis: {
        type: xaxisType,
        labels: xaxisLabel,
      },
      yaxis: {
        labels: {
          formatter: (value: unknown) => {
            if(typeof value !== 'number') return value;
            return value.toFixed(2)
          },
        },
      },
      tooltip: {
        x: xaxisLabel,
        y: {
          formatter: (value: unknown) => {
            if(typeof value !== 'number') return value;
            return value.toFixed(2)
          },
        },
      },
      series,
    };

    // Initialize the chart
    chart = new ApexCharts(chartElement, options);
    chart.render();
    })();

    return () => {
      chart.destroy(); // Clean up
    };
  });
</script>

<div bind:this={chartElement} style="min-height: 300px;"></div>
