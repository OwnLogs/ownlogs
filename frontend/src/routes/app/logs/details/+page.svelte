<script lang="ts" generics="TData, TValue">
  import { Label } from '$lib/components/ui/label/index.js';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';
  import { pageMetadata, toast } from '$lib/stores';
  import { onMount } from 'svelte';
  import { WEBSOCKET_URL } from '$lib/constants';
  import LogsTable from '../LogsTable.svelte';
  import type { Log } from '@shared/types';
  import { beforeNavigate } from '$app/navigation';

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
  let numberOfPages = $state(0);
  let isLoaded = $state(false);
  let toastId: string = $state('serverStatusInDetails');

  // Fetches logs based on the specified log level
  async function fetchLogs(page: number = 0) {
    if (!socket) return;

    socket.send(JSON.stringify({ action: 'fetchLogs', page, pageSize: pageSize }));
  }

  function webSocket(initial = true) {
    if(!initial) {
      toast.info('Connecting to the server...', { id: toastId });
    }
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
          numberOfPages = Math.ceil(response.totalLogs / response.pageSize);
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
      if(!initial) toast.info('Connected to the server', { id: toastId });
    });

    socket.addEventListener('close', () => {
      if (isLoaded)
        toast.error('The connection to the server was closed', {
          id: toastId,
          timeout: -1,
          action: {
            label: 'Reconnect',
            onClick: () => {
              webSocket(false);
            }
          }
        });
    });
  }

  // Connect to websocket and listen for new logs
  onMount(() => {
    isLoaded = true;
    webSocket();

    // Close the socket when the component is destroyed
    return () => {
      if (socket) socket?.close();
    };
  });

  beforeNavigate(() => {
    isLoaded = false;
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

  $effect(() => {
    if (socket === undefined) {
      toastId = '';
    }
  });
</script>

<div class="sm:px-6 sm:pb-6">
  <!-- Logs table -->
  <div class="rounded-md border">
    <LogsTable
      {user}
      getResults={fetchLogsPage}
      bind:this={table}
      bind:pageSize
      bind:rows
      bind:numberOfPages
    >
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
