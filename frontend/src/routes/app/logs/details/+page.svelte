<script lang="ts" generics="TData, TValue">
  import { Button } from '$lib/components/ui/button/index.js';
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';
  import { pageMetadata } from '$lib/stores';
  import {
    type VisibilityState,
    type RowSelectionState,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel
  } from '@tanstack/table-core';
  import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-svelte';

  import { onMount } from 'svelte';
  import { WEBSOCKET_URL } from '$lib/constants';
  import { toast } from 'svelte-sonner';
  import { columns, type Logs } from './columns';
  import type { Log } from '@shared/types';
  import { scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import LogDetailsModal from './LogDetailsModal.svelte';
  import { hasPermission, PERMISSIONS } from '@shared/roles';

  pageMetadata.set({
    title: 'Logs overview',
    description: 'Logs overview analytics about logs.',
    breadcrumbs: [{ name: 'Logs' }, { name: 'Details' }]
  });

  const { data } = $props();
  const { user } = data;

  let logs: Logs = $state({
    logs: [],
    totalLogs: 0,
    page: 0,
    pageSize: 30
  });
  let realTime: boolean = $state(true);
  let socket: WebSocket | undefined = $state();
  let columnVisibility = $state<VisibilityState>({ logSource: false });
  let rowSelection = $state<RowSelectionState>({});
  let deleteLogsConfirmModalVisible: boolean = $state(false);
  let selectedLog: Record<string, any> | null = $state(null);
  let isDeletingLogs: boolean = $state(false);

  // Fetches logs based on the specified log level
  async function fetchLogs(page: number = 0) {
    if (!socket) return;

    socket.send(JSON.stringify({ action: 'fetchLogs', page, pageSize: logs.pageSize }));
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
          logs = response;
          table.setPageSize(logs.pageSize);
          break;
        }

        // Response handling when I am deleting logs
        case 'deleteLogs': {
          deleteLogsConfirmModalVisible = false;
          table.getRowModel().rows.forEach((row) => {
            row.toggleSelected(false);
          });

          isDeletingLogs = false;

          break;
        }

        // Response handling when another user deleted some logs
        case 'logsDeleted': {
          const logIds = response.logIds;

          // If the logs that were deleted are in the current page, we need to fetch the logs again
          if (logIds.some((id: number) => logs.logs.some((log) => log.logId === id))) {
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

  function nextPage() {
    if (logs.page === Math.ceil(logs.totalLogs / logs.pageSize) - 1) return;
    fetchLogs(logs.page + 1);
  }

  function previousPage() {
    if (logs.page === 0) return;
    fetchLogs(logs.page - 1);
  }

  async function deleteLogs() {
    if (!socket) return;

    isDeletingLogs = true;

    const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original.logId);
    socket.send(
      JSON.stringify({
        action: 'deleteLogs',
        logIds: selectedRows,
        page: logs.page,
        pageSize: logs.pageSize
      })
    );
  }

  const table = createSvelteTable({
    get data() {
      return logs.logs;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: (updater) => {
      if (typeof updater === 'function') {
        columnVisibility = updater(columnVisibility);
      } else {
        columnVisibility = updater;
      }
    },
    onRowSelectionChange: (updater) => {
      if (typeof updater === 'function') {
        rowSelection = updater(rowSelection);
      } else {
        rowSelection = updater;
      }
    },
    state: {
      get columnVisibility() {
        return columnVisibility;
      },
      get rowSelection() {
        return rowSelection;
      }
    }
  });

  const realTimeChange = (e: boolean) => {
    realTime = e;

    if (!socket) return;

    socket.send(JSON.stringify({ action: 'changeRealTime', realTime }));

    if (realTime) {
      fetchLogs();
    }
  };

  function openLogDetails(log: Log) {
    selectedLog = log;
  }
</script>

<!-- Delete logs confirm modal -->
{#if hasPermission(user?.role, PERMISSIONS.DELETE_LOG)}
  <AlertDialog.Root bind:open={deleteLogsConfirmModalVisible}>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
        <AlertDialog.Description>
          This action cannot be undone. This will permanently delete {table.getFilteredSelectedRowModel()
            .rows.length} log{table.getFilteredSelectedRowModel().rows.length > 1 ? 's' : ''}.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <Button disabled={isDeletingLogs} loading={isDeletingLogs} onclick={deleteLogs}
          >Continue</Button
        >
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/if}

<LogDetailsModal log={selectedLog} />

<div class="flex w-full flex-col">
  <div class="gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
    <!-- Table heading -->
    <div class="flex items-center gap-6 py-4">
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
      <!-- Delete selected row(s) button -->
      {#if table.getFilteredSelectedRowModel().rows.length > 0 && hasPermission(user?.role, PERMISSIONS.DELETE_LOG)}
        <div transition:scale={{ duration: 400, easing: backOut, start: 0, opacity: 0 }}>
          <Button
            variant="destructive"
            size="sm"
            onclick={() => (deleteLogsConfirmModalVisible = true)}
          >
            Delete {table.getFilteredSelectedRowModel().rows.length} log{table.getFilteredSelectedRowModel()
              .rows.length > 1
              ? 's'
              : ''}
          </Button>
        </div>
      {/if}
      <!-- Toggle table column visibility -->
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline" size="sm" class="ml-auto">
              <Settings2 class="size-6" />
              View
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Group>
            <DropdownMenu.GroupHeading>Toggle columns</DropdownMenu.GroupHeading>
            <DropdownMenu.Separator />
            {#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
              <DropdownMenu.CheckboxItem
                class="capitalize"
                controlledChecked
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.columnDef.header}
              </DropdownMenu.CheckboxItem>
            {/each}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
    <!-- Logs table -->
    <div class="rounded-md border">
      <Table.Root>
        <Table.Header>
          {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
            <Table.Row>
              {#each headerGroup.headers as header (header.id)}
                <Table.Head>
                  {#if !header.isPlaceholder}
                    <FlexRender
                      content={header.column.columnDef.header}
                      context={header.getContext()}
                    />
                  {/if}
                </Table.Head>
              {/each}
            </Table.Row>
          {/each}
        </Table.Header>
        <Table.Body>
          {#each table.getRowModel().rows as row (row.id)}
            <Table.Row
              data-state={row.getIsSelected() && 'selected'}
              onclick={(e) => {
                if ((e.target as Element).closest('button')) return;
                openLogDetails(row.original);
              }}
            >
              {#each row.getVisibleCells() as cell (cell.id)}
                <Table.Cell>
                  <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
                </Table.Cell>
              {/each}
            </Table.Row>
          {:else}
            <Table.Row>
              <Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
    <!-- Table footer -->
    <div class="flex flex-row items-center justify-between py-4">
      <!-- Page number / Total pages -->
      <div class="text-sm font-medium text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div class="flex flex-row items-center space-x-6 lg:space-x-8">
        <!-- Page size selection -->
        <div class="flex flex-row items-center gap-2">
          <Label for="pageSizeSelect">Rows per page</Label>
          <Select.Root
            type="single"
            name="pageSizeSelect"
            value={logs.pageSize.toString()}
            onValueChange={(e) => {
              logs.pageSize = parseInt(e);
              table.setPageIndex(0);
              table.setPageSize(logs.pageSize);
              fetchLogs();
            }}
          >
            <Select.Trigger class="w-[80px]">{logs.pageSize}</Select.Trigger>
            <Select.Content>
              <Select.Item value="10">10</Select.Item>
              <Select.Item value="30">30</Select.Item>
              <Select.Item value="50">50</Select.Item>
              <Select.Item value="100">100</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <!-- Current page index / Total pages -->
        <span class="text-sm font-semibold">
          Page {logs.page + 1} of {Math.ceil(logs.totalLogs / logs.pageSize) === 0
            ? 1
            : Math.ceil(logs.totalLogs / logs.pageSize)}
        </span>

        <!-- Pagination buttons -->
        <div class="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            class="aspect-square size-8 p-1"
            onclick={previousPage}
            disabled={logs.page === 0}
          >
            <ChevronLeft class="size-full" />
          </Button>
          <Button
            variant="outline"
            class="aspect-square size-8 p-1"
            onclick={nextPage}
            disabled={Math.ceil(logs.totalLogs / logs.pageSize) === 0
              ? true
              : logs.page === Math.ceil(logs.totalLogs / logs.pageSize) - 1}
          >
            <ChevronRight class="size-full" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>
