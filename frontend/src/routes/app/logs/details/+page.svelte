<script lang="ts" generics="TData, TValue">
  import { Label } from '$lib/components/ui/label/index.js';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';
  import { pageMetadata } from '$lib/stores';
  import { onMount } from 'svelte';
  import { WEBSOCKET_URL } from '$lib/constants';
  import { toast } from 'svelte-sonner';
  import LogsTable from '../LogsTable.svelte';
  import type { Log } from '@shared/types';

  pageMetadata.set({
    title: 'Logs overview',
    description: 'Logs overview analytics about logs.',
    breadcrumbs: [{ name: 'Logs' }, { name: 'Details' }]
  });

  const { data } = $props();
  const { user } = data;

  let rows: Log[] = $state([]);
  let realTime: boolean = $state(true);
  let socket: WebSocket | undefined = $state();
  let table = $state();
  let pageSize = $state(30);

  // Fetches logs based on the specified log level
  async function fetchLogs(page: number = 0) {
    if (!socket) return;

    socket.send(JSON.stringify({ action: 'fetchLogs', page, pageSize: table.pageSize }));
  }

  // Connect to websocket and listen for new logs
  onMount(() => {
    socket = new WebSocket(WEBSOCKET_URL + '/logs');

    // Listen for messages
    socket.addEventListener('message', (event) => {
      const response = JSON.parse(event.data);

      // Handle errors
      if (!response.success) {
        toast.error('An error occurred while fetching logs');
        console.error(response.error);
        return;
      }

      switch (response.action) {
        // When the server is receiving new logs
        case 'newLogs': {
          if (realTime) {
            fetchLogs();
          }
          break;
        }

        // Response handling when fetching logs
        case 'fetchLogs': {
          rows = response.logs;
          table.table.setPageSize(response.pageSize);
          break;
        }

        // Response handling when I am deleting logs
        case 'deleteLogs': {
          table.table.getRowModel().rows.forEach((row) => {
            row.toggleSelected(false);
          });

          break;
        }

        // Response handling when another user deleted some logs
        case 'logsDeleted': {
          const logIds = response.logIds;

          // If the logs that were deleted are in the current page, we need to fetch the logs again
          if (logIds.some((id: number) => rows.some((log) => log.logId === id))) {
            fetchLogs();
          }
          break;
        }

        default: {
          break;
        }
      }
    });

    // Fetching initial logs on connection
    socket.addEventListener('open', () => {
      fetchLogs();
    });
  });

  const realTimeChange = (e: boolean) => {
    realTime = e;

    if (!socket) return;

    socket.send(JSON.stringify({ action: 'changeRealTime', realTime }));

    if (realTime) {
      fetchLogs();
    }
  };

  function fetchLogsPage({ pageNumber }: { pageNumber: number }) {
    fetchLogs(pageNumber);
  }
</script>

<div class="sm:px-6 sm:pb-6">
  <!-- Logs table -->
  <div class="rounded-md border">
    <LogsTable {user} getResults={fetchLogsPage} bind:this={table} bind:pageSize bind:rows>
      <!-- Real-time checkbox -->
      <div class="flex items-center space-x-2">
        <Checkbox id="realTimeLogs" checked={realTime} onCheckedChange={realTimeChange} />
        <Label
          for="realTimeLogs"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Real-time
        </Label>
      </div>
    </LogsTable>
  </div>
</div>
