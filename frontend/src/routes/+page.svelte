<script lang="ts">
  import { onMount } from 'svelte';
  import { type Log, type LogLevel } from '../app.d';
  import LogRow from './LogRow.svelte';
  import { WEBSOCKET_URL, API_URL } from '$lib/constants';
	import { flip } from 'svelte/animate';

  const tableColumnWidths: [string, string] = ["300px", "100%"];
  const logLevelValues = ['all', 'debug', 'info', 'warn', 'error', 'fatal'];

  let logs: Log[] = $state([]);
  let logIds: Set<number> = $state(new Set());
  let isLoading: boolean = $state(false);
  let isFetchingMoreLogs: boolean = $state(false);
  let socket: WebSocket|undefined = $state();
  let logsOffset: number = $state(0);
  let hasMoreLogs: boolean = $state(true);
  let totalLogs: number = $state(0);
  let logLevelFilterValue: LogLevel | 'all' = $state('all');

  // Fetches logs based on the specified log level
  async function fetchLogs({ level }: { level?: LogLevel | 'all' } = { level: logLevelFilterValue }) {
    if(isLoading || !hasMoreLogs) return;

    if(logs.length === 0) {
      isLoading = true;
    }else {
      isFetchingMoreLogs = true;
    }


    // Fetch logs from API
    const res = await fetch(API_URL+'/logs?offset='+logsOffset+'&level='+level);
    const newLogs = await res.json();

    // Update state
    logsOffset = newLogs.offset;
    hasMoreLogs = newLogs.hasMore;
    totalLogs = newLogs.total;
    newLogs.logs.forEach((log: Log) => {
      if(logIds.has(log.id)) return;
      logs.push(log);
      logIds.add(log.id);
    });

    isLoading = false;
    isFetchingMoreLogs = false;
  }

  // Connect to websocket and listen for new logs
  onMount(() => {
    socket = new WebSocket(WEBSOCKET_URL+'/logs');

    // Listen for messages
    socket.addEventListener("message", (event) => {
      const newLogs = JSON.parse(event.data);


      filterLogs(newLogs).forEach((log: Log) => {
        if(logIds.has(log.id)) return;
        logs = [log, ...logs];
        logIds.add(log.id);
        totalLogs++;
      });
      isLoading = false;
    });

    fetchLogs();
  });

  // Function to handle log level change
  function logLevelChange() {
    logs = [];
    logIds = new Set();
    logsOffset = 0;
    hasMoreLogs = true;
    totalLogs = 0;
    fetchLogs({ level: logLevelFilterValue });
  }

  function filterLogs(logs: Log[]): Log[] {
    return logs.filter(log => logLevelFilterValue === 'all' || log.level === logLevelFilterValue);
  }
</script>
<select name="logLevel" id="logLevel" bind:value={logLevelFilterValue} onchange={logLevelChange}>
  {#each logLevelValues as value}
    <option value={value}>{value.toUpperCase()}</option>
  {/each}
</select>

<!-- Table -->
<div class="w-full flex flex-col gap-1 p-4">
  <!-- Table header -->
  <div class="flex flex-row">
    <div style="width: {tableColumnWidths[0]};">Timestamp</div>
    <div style="width: {tableColumnWidths[1]};">Message</div>
  </div>

  <!-- Table rows -->
  {#if isLoading}
    <div class="w-full text-center">
      Loading...
    </div>
  {/if}
  {#if logs.length === 0 && !isLoading}
    <div class="w-full text-center">
      No logs found
    </div>
  {/if}
  {#if totalLogs > 0}
    <div class="w-full text-center">
      Showing {logs.length} of {totalLogs} logs
    </div>
  {/if}
  {#each logs as log (log.id)}
    <div animate:flip>
      <LogRow {log} {tableColumnWidths} class="bg-neutral-950/20 transition-colors" />
    </div>
  {/each}
  {#if isFetchingMoreLogs}
    <div class="w-full text-center">
      Loading more logs...
    </div>
  {/if}
  {#if hasMoreLogs}
    <div class="w-full text-center">
      <button disabled={isFetchingMoreLogs} class="btn" onclick={() => fetchLogs()}>Load more</button>
    </div>
  {:else}
    <div class="w-full text-center">
      No more logs to load
    </div>
  {/if}
</div>
