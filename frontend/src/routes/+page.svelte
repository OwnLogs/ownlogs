<script lang="ts">
  import { onMount } from 'svelte';
  import { type Log } from '../app.d';
  import LogRow from './LogRow.svelte';
  import { WEBSOCKET_URL, API_URL } from '$lib/constants';
	import { flip } from 'svelte/animate';

  let logs: Log[] = $state([]);
  let logIds: Set<number> = $state(new Set());
  let isLoading: boolean = $state(false);
  let socket: WebSocket|undefined = $state();

  async function fetchLogs() {
    if(!socket) return;
    isLoading = true;
    const res = await fetch(API_URL+'/logs');
    const newLogs = await res.json();
    newLogs.forEach((log: Log) => {
      if(logIds.has(log.id)) return;
      logs = [log, ...logs];
      logIds.add(log.id);
    });

    isLoading = false;
  }

  onMount(() => {
    socket = new WebSocket(WEBSOCKET_URL+'/logs');

    // Listen for messages
    socket.addEventListener("message", (event) => {
      const newLogs = JSON.parse(event.data);

      newLogs.forEach((log: Log) => {
        if(logIds.has(log.id)) return;
        logs = [log, ...logs];
        logIds.add(log.id);
      });
      isLoading = false;
    });
  })
</script>

<nav class="sticky top-0 py-2 px-4 bg-neutral-900">
  <button onclick={fetchLogs} disabled={isLoading}>
    Refresh
  </button>
</nav>

<!-- Table -->
<div class="w-full flex flex-col gap-1 p-4">
  <!-- Table header -->
  <div class="flex flex-row">
    <div>Timestamp</div>
    <div>Message</div>
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
  {#each logs as log (log.id)}
    <div animate:flip>
      <LogRow {log} class="bg-neutral-950/20 transition-colors" />
    </div>
  {/each}
</div>
