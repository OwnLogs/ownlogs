<script lang="ts">
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Table from '$lib/components/ui/table/index.js';
  import { LoaderCircle, ChevronRight, ChevronLeft, Settings2 } from 'lucide-svelte';
  import { Label } from '$lib/components/ui/label/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { columns } from './columns';
  import { hasPermission, PERMISSIONS } from '@shared/roles';
  import { scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { cn } from '$lib/utils';
  import type { Log } from '@shared/types';
  import { toast } from '$lib/stores';
  import {
    getCoreRowModel,
    getPaginationRowModel,
    type VisibilityState,
    type RowSelectionState
  } from '@tanstack/table-core';
  import { API_URL } from '$lib/constants';
  import type { User } from '$lib/server/db/user';
  import LogDetailsModal from './LogDetailsModal.svelte';

  let {
    user,
    getResults,
    pageSize = $bindable(30),
    isLoading = $bindable(false),
    numberOfPages = $bindable(0),
    rows = $bindable([]),
    class: className = '',
    children
  }: {
    user: User | undefined;
    getResults: (params: { pageNumber: number; pageSize: number }) => void;
    pageSize?: number;
    isLoading?: boolean;
    numberOfPages?: number;
    rows?: Log[];
    class?: string;
    children?: () => any;
  } = $props();

  let currentPage = $state(0);
  let columnVisibility = $state<VisibilityState>({ logSource: false });
  let rowSelection = $state<RowSelectionState>({});
  let isDeletingLogs: boolean = $state(false);
  let deleteLogsConfirmModalVisible: boolean = $state(false);
  let selectedLog: Log | null = $state(null);

  export async function refresh() {
    isLoading = true;
    await getResults({ pageNumber: currentPage, pageSize });
    table.setPageSize(pageSize);
    isLoading = false;
  }

  async function nextPage() {
    if (currentPage >= numberOfPages - 1) {
      return;
    }
    currentPage += 1;
    await refresh();
  }

  async function previousPage() {
    if (currentPage <= 0) {
      return;
    }
    currentPage -= 1;
    await refresh();
  }

  async function deleteLogs() {
    isDeletingLogs = true;
    const res = await fetch(API_URL + `/deletedLogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ids: table.getFilteredSelectedRowModel().rows.map((row) => row.original.logId)
      })
    });
    if (!res.ok) {
      toast.error('Failed to delete logs');
      isDeletingLogs = false;
      return;
    }

    const data = await res.json();
    if (!data.success) {
      toast.error(data.message);
      isDeletingLogs = false;
      return;
    }

    toast.success('Logs deleted successfully');
    deleteLogsConfirmModalVisible = false;
    table.getRowModel().rows.forEach((row) => {
      row.toggleSelected(false);
    });
    isDeletingLogs = false;
    await refresh();
  }

  export const table = createSvelteTable({
    get data() {
      return rows;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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

  table.setPageSize(pageSize);

  function openLogDetails(log: Log) {
    selectedLog = log;
  }
</script>

<LogDetailsModal log={selectedLog} />

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

<div class={cn('flex w-full flex-col overflow-x-auto', className)}>
  <!-- Table heading -->
  <div class="flex flex-row items-center p-2">
    {#if children}
      <div class="mr-4">{@render children?.()}</div>
    {/if}
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
  <Table.Root class="min-w-[1000px]">
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
      {#if isLoading}
        <Table.Row>
          <Table.Cell colspan={columns.length} class="h-24">
            <div class="flex flex-row items-center justify-center gap-2">
              <LoaderCircle class="size-6 animate-spin" />
              Searching...
            </div>
          </Table.Cell>
        </Table.Row>
      {:else}
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row
            data-state={row.getIsSelected() && 'selected'}
            onclick={(e) => {
              if ((e.target as Element).closest('button')) return;
              openLogDetails(row.original as Log);
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
      {/if}
    </Table.Body>
  </Table.Root>
  <!-- Table footer -->
  {#if rows.length > 0}
    <div class="flex flex-row flex-wrap items-center justify-between gap-2 p-2">
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
            value={pageSize.toString()}
            onValueChange={async (e) => {
              pageSize = parseInt(e);
              table.setPageIndex(0);
              table.setPageSize(pageSize);
              await refresh();
            }}
          >
            <Select.Trigger class="w-[80px]">{pageSize}</Select.Trigger>
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
          Page {currentPage + 1} of {numberOfPages}
        </span>

        <!-- Pagination buttons -->
        <div class="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            class="aspect-square size-8 p-1"
            onclick={previousPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft class="size-full" />
          </Button>
          <Button
            variant="outline"
            class="aspect-square size-8 p-1"
            onclick={nextPage}
            disabled={currentPage >= numberOfPages - 1}
          >
            <ChevronRight class="size-full" />
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>
