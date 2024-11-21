import type { Log } from '@shared/types';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import type { ColumnDef } from '@tanstack/table-core';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import { createRawSnippet } from 'svelte';
import { formatTimestamp } from '$lib/utils';
// import DataTableActions from './data-table-actions.svelte';
import LogLevel from '$lib/components/LogLevel.svelte';

export interface Logs {
  logs: Log[];
  totalLogs: number;
  page: number;
  pageSize: number;
}

export const columns: ColumnDef<Log>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      renderComponent(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
        onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
        controlledChecked: true,
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value) => row.toggleSelected(!!value),
        controlledChecked: true,
        'aria-label': 'Select row'
      }),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'level',
    header: 'Level',
    cell: ({ row }) => {
      return renderComponent(LogLevel, { level: row.original.level });
    }
  },
  {
    accessorKey: 'serverName',
    header: 'Server Name',
    cell: ({ row }) => {
      const serverNameCellSnippet = createRawSnippet<[Date]>((getServerName) => {
        const serverName = getServerName();
        return {
          render: () => `<span class="font-bold text-foreground">${serverName}</span>`
        };
      });

      return renderSnippet(serverNameCellSnippet, row.getValue('serverName'));
    }
  },
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ row }) => {
      const timestampCellSnippet = createRawSnippet<[Date]>((getTimesatmp) => {
        const timestamp = getTimesatmp();
        return {
          render: () =>
            `<span class="font-medium text-muted-foreground">${formatTimestamp(timestamp)}</span>`
        };
      });

      return renderSnippet(timestampCellSnippet, row.getValue('timestamp'));
    }
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => {
      const sourceCellSnippet = createRawSnippet<[Date]>((getSource) => {
        const source = getSource();
        return {
          render: () => `<span class="font-mono">${source}</span>`
        };
      });

      return renderSnippet(sourceCellSnippet, row.getValue('source'));
    }
  },
  {
    accessorKey: 'message',
    header: 'Message'
  }

  // Tried to get the row action working but the component cannot communicate with the table to insert a new row upon deletion
  // {
  //   id: 'actions',
  //   cell: ({ row }) => {
  //     // You can pass whatever you need from `row.original` to the component
  //     return renderComponent(DataTableActions, { id: row.original.id });
  //   }
  // }
];
