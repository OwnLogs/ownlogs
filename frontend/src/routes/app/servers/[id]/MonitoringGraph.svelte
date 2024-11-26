<script lang="ts">
  import type { ServerMonitoring } from "@shared/types";
  import Chart from "./chart.svelte";
  import moment from "moment";

  let { monitoring = [] }: { monitoring: ServerMonitoring[] } = $props();

  let minDate: Date = $state(new Date());
  let maxDate: Date = $state(new Date());

  console.log(monitoring)
  const chartOptions = {
    series: [{
      name: "Status",
      data: monitoring.map(e => e.isOnline ? 1 : 0)
    }],
      chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'stepline'
    },
    title: {
      text: 'Server status',
      align: 'left'
    },
    xaxis: {
      categories: monitoring.map(e => e.timestamp),
      labels: {
        rotate: -15,
        rotateAlways: true,
        formatter: function(val: number, timestamp: Date) {
          const showYear = minDate.getFullYear() !== maxDate.getFullYear();
          const format = showYear ? "DD MMM YYYY HH:mm" : "DD MMM HH:mm";
          return moment(timestamp).format(format);
        }
      }
    },
    yaxis: {
      title: {
        text: 'Status'
      },
      labels: {
        formatter: function(val: number) {
          return val ? "Online" : "Offline";
        }
      }
    }
  }
</script>

<Chart options={chartOptions} />
