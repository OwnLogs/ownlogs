<script lang="ts">
  import { pageMetadata } from '$lib/stores';
  import { onMount } from 'svelte';
  import { MediaQuery } from 'runed';
  import { Play, LoaderCircle, OctagonAlert, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import Editor from './Editor.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Table from '$lib/components/ui/table/index.js';
  import * as Resizable from '$lib/components/ui/resizable/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as Drawer from '$lib/components/ui/drawer/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { toast } from 'svelte-sonner';

  pageMetadata.set({
    title: 'Querying',
    description: 'Query logs from the database',
    breadcrumbs: [{ name: 'Logs' }, { name: 'Querying' }]
  });

  const isDesktop = new MediaQuery('(min-width: 1024px)');

  let queryInputValue: string = $state('SELECT * \nFROM logs;');
  let isQuerying: boolean = $state(false);
  let rows: any[] = $state([]);
  let columns: string[] = $state([]);
  let databaseStructureModalVisible: boolean = $state(false);
  let mobileHelpModalVisible: boolean = $state(false);
  let error: string = $state('');
  let editor: Editor | undefined = $state();
  let currentPage = $state(0);
  let numberOfPages = $state(0);
  let lastQueryValue = $state('');
  let requestsHistory: { req: string; timestamp: Date }[] = $state([]);
  let useQueryFromHistoryConfirmModal = $state({ visible: false, value: '' });
  let mobileHistoryModalVisible: boolean = $state(false);
  let exportLogsModalOpen = $state(false);
  const availableExportFormat = ['JSON', 'CSV'];
  let exportLogsFormat: string = $state('');
  let exportLogsAmount: 'all' | 'current' = $state('current');
  let isExporting = $state(false);

  async function runQuery() {
    isQuerying = true;
    const res = await fetch('/api/logs/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: queryInputValue, lastQueryValue, currentPage })
    });

    if (queryInputValue !== lastQueryValue) {
      requestsHistory.unshift({ req: queryInputValue, timestamp: new Date() });
      setRequestHistory();
    }

    if (!res.ok) {
      error = 'An error occurred while fetching the data';
      isQuerying = false;
      return;
    }

    const data = await res.json();
    isQuerying = false;
    lastQueryValue = queryInputValue;
    error = '';
    if (data.error) {
      error = data.message;
      // Uncomment below to ser error messages in editor
      // const lineNumber = extractLineFromError();
      // if(lineNumber) editor?.setError(error, lineNumber, lineNumber+1);
      return;
    }
    rows = Array.isArray(data.rows) ? data.rows : [];
    columns = Array.isArray(data.rows) && data.rows.length > 0 ? Object.keys(data.rows[0]) : [];
    currentPage = data.currentPage;
    numberOfPages = data.numberOfPages;
  }

  function nextPage() {
    if (currentPage < numberOfPages && !isQuerying) {
      currentPage++;
      runQuery();
    }
  }

  function previousPage() {
    if (currentPage > 0 && !isQuerying) {
      currentPage--;
      runQuery();
    }
  }

  function getRequestsHistory() {
    return JSON.parse(localStorage.getItem('requestsHistory') || '[]').map(
      (e: { req: string; timestamp: Date }) => {
        return {
          ...e,
          timestamp: new Date(e.timestamp)
        };
      }
    );
  }

  function setRequestHistory() {
    if (requestsHistory.length > 5) {
      requestsHistory = requestsHistory.slice(0, 5);
    }
    localStorage.setItem('requestsHistory', JSON.stringify(requestsHistory));
  }

  onMount(() => {
    requestsHistory = getRequestsHistory();
    if (requestsHistory.length > 0) {
      queryInputValue = requestsHistory[0].req;
      lastQueryValue = requestsHistory[0].req;
    }
  });

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const formatTimestampHistory = (d: Date) => {
    const addZeros = (n: number) => (n < 10 ? `0${n}` : n);
    return isToday(d)
      ? addZeros(d.getHours()) + ':' + addZeros(d.getMinutes())
      : d.toLocaleDateString();
  };

  const extractLineFromError = () => {
    const match = error.match(/line (\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  async function exportQueryResults() {
    const filename = 'logify-results';
    isExporting = true;
    let dataToExport = rows;
    if (exportLogsAmount === 'all') {
      const res = await fetch('/api/logs/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: queryInputValue, all: true })
      });
      if (!res.ok) {
        toast.error('An error occurred while fetching the data');
        return;
      }
      const data = await res.json();
      if (data.error) {
        toast.error(data.message);
        return;
      }
      dataToExport = data.rows;
    }
    const exportCSV = () => {
      const data = [columns, ...dataToExport.map((row) => columns.map((column) => row[column]))];
      const csv = data.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename + '.csv';
      a.click();
      URL.revokeObjectURL(url);
    };
    const exportJSON = () => {
      const data = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename + '.json';
      a.click();
      URL.revokeObjectURL(url);
    };
    switch (exportLogsFormat) {
      case 'JSON':
        exportJSON();
        break;
      case 'CSV':
        exportCSV();
        break;
      default:
        toast.error('Unknown export format');
        break;
    }
    isExporting = false;
  }
</script>

<!-- Export logs modal -->
<Dialog.Root bind:open={exportLogsModalOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Export logs</Dialog.Title>
      <Dialog.Description>
        Export logs in your favorite format: {availableExportFormat.join(', ')}.
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col">
      <h2 class="text-base font-semibold">Amount</h2>
      <RadioGroup.Root bind:value={exportLogsAmount}>
        <div class="flex flex-row items-center gap-2">
          <RadioGroup.Item value="current" id="export-current" />
          <Label for="export-current" class="text-sm">Current</Label>
        </div>
        <div class="flex flex-row items-center gap-2">
          <RadioGroup.Item value="all" id="export-all" />
          <Label for="export-all" class="text-sm">All</Label>
        </div>
      </RadioGroup.Root>
      <h2 class="mt-4 text-base font-semibold">Format</h2>
      <RadioGroup.Root bind:value={exportLogsFormat}>
        {#each availableExportFormat as format}
          <div class="flex flex-row items-center gap-2">
            <RadioGroup.Item value={format} id="export-{format}" />
            <Label for="export-{format}" class="text-sm">
              {format}
            </Label>
          </div>
        {/each}
      </RadioGroup.Root>
    </div>
    <Dialog.Footer>
      <Button variant="secondary" onclick={() => (exportLogsModalOpen = false)}>Cancel</Button>
      <Button
        variant="default"
        disabled={!exportLogsFormat || isExporting}
        loading={isExporting}
        onclick={exportQueryResults}>Export</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Database structure modal -->
<Dialog.Root
  bind:open={databaseStructureModalVisible}
  onOpenChange={(e) => {
    if (!e && !isDesktop.matches) mobileHelpModalVisible = true;
  }}
>
  <Dialog.Content class="h-fit w-full max-w-screen-xl">
    <Dialog.Header>
      <Dialog.Title>Database structure</Dialog.Title>
    </Dialog.Header>
    <img
      src="/DatabaseStructureGraph.webp"
      alt=""
      class="aspect-video h-full w-full object-contain"
    />
  </Dialog.Content>
</Dialog.Root>

<!-- Requests history mobile modal -->
<Dialog.Root
  bind:open={mobileHistoryModalVisible}
  onOpenChange={(e) => {
    if (!e && !isDesktop.matches) mobileHelpModalVisible = true;
  }}
>
  <Dialog.Content class="h-fit w-full max-w-screen-xl">
    <Dialog.Header>
      <Dialog.Title>History</Dialog.Title>
    </Dialog.Header>
    <div class="flex w-full flex-col gap-2">
      {#each requestsHistory as request}
        <div class="relative flex flex-row items-start gap-2 border-t pt-1">
          <span class="mt-0.5 text-sm text-muted-foreground"
            >{formatTimestampHistory(request.timestamp)}</span
          >
          <button
            onclick={() => {
              useQueryFromHistoryConfirmModal = { visible: true, value: request.req };
            }}
            class="line-clamp-3 text-start font-mono text-base text-primary">{request.req}</button
          >
        </div>
      {/each}
    </div>
  </Dialog.Content>
</Dialog.Root>

<!-- Get help mobile drawer -->
<Drawer.Root bind:open={mobileHelpModalVisible}>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Help</Drawer.Title>
    </Drawer.Header>
    <div class="flex w-full flex-col gap-4 p-4">
      <Button
        variant="outline"
        onclick={() => {
          mobileHelpModalVisible = false;
          databaseStructureModalVisible = true;
        }}>Database structure</Button
      >
      <Button
        variant="outline"
        onclick={() => {
          mobileHistoryModalVisible = true;
          mobileHelpModalVisible = false;
        }}>History</Button
      >
    </div>
    <Drawer.Footer>
      <Button onclick={() => (mobileHelpModalVisible = false)} variant="default">Close</Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

<!-- Use query from history confirm modal -->
<Dialog.Root bind:open={useQueryFromHistoryConfirmModal.visible}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Confirm</Dialog.Title>
      <Dialog.Description>
        You will loose the query currently in the editor. Are you sure you want to continue?
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (useQueryFromHistoryConfirmModal.visible = false)}
        >Cancel</Button
      >
      <Button
        onclick={() => {
          queryInputValue = useQueryFromHistoryConfirmModal.value;
          editor?.setValue(queryInputValue);
          useQueryFromHistoryConfirmModal.visible = false;
        }}
      >
        Apply
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<Resizable.PaneGroup direction="vertical" class="h-full max-h-full">
  <Resizable.Pane
    onResize={() => {
      editor?.resizeEditor();
    }}
    defaultSize={30}
    minSize={20}
  >
    <!-- Upper part -->
    <Resizable.PaneGroup direction="horizontal">
      <!-- Query input -->
      <Resizable.Pane defaultSize={70} minSize={30}>
        <div class="flex h-full flex-col gap-2 overflow-auto p-4">
          <div class="flex-roe flex items-center justify-between">
            <h1 class="text-lg font-medium">Query builder</h1>
            <Button size="sm" class="lg:hidden" onclick={() => (mobileHelpModalVisible = true)}
              >Help</Button
            >
          </div>
          <!-- Text editor -->
          <Editor bind:this={editor} bind:value={queryInputValue} />
          <Button disabled={isQuerying} loading={isQuerying} onclick={runQuery}>
            <Play class="size-10" />
            Run
          </Button>
        </div>
      </Resizable.Pane>
      {#if isDesktop.matches}
        <Resizable.Handle withHandle />
        <!-- Database graph -->
        <Resizable.Pane defaultSize={30} minSize={20}>
          <div class="flex h-full flex-col gap-2 p-4">
            <h1 class="text-lg font-medium">Help</h1>
            <Button onclick={() => (databaseStructureModalVisible = true)}
              >Database structure</Button
            >
            {#if requestsHistory.length > 0}
              <h1 class="text-lg font-medium">History</h1>
              <div class="flex h-full w-full grow flex-col gap-2 overflow-y-auto">
                {#each requestsHistory as request}
                  <div class="relative flex flex-row items-start gap-2 border-t pt-1">
                    <span class="mt-0.5 text-sm text-muted-foreground"
                      >{formatTimestampHistory(request.timestamp)}</span
                    >
                    <button
                      onclick={() => {
                        useQueryFromHistoryConfirmModal = { visible: true, value: request.req };
                      }}
                      class="line-clamp-3 text-start font-mono text-base text-primary"
                      >{request.req}</button
                    >
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </Resizable.Pane>
      {/if}
    </Resizable.PaneGroup>
  </Resizable.Pane>
  <Resizable.Handle withHandle />
  <!-- Query result -->
  <Resizable.Pane class="flex flex-col gap-2 p-4" defaultSize={70} minSize={20}>
    <h1 class="text-lg font-medium">Results</h1>
    {#if isQuerying}
      <div class="flex h-full items-center justify-center gap-2">
        <LoaderCircle class="animate-spin" />
        <p class="text-muted-foreground">Loading results</p>
      </div>
    {:else if error}
      <Alert.Root>
        <OctagonAlert class="size-4" />
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>
          {error}
        </Alert.Description>
      </Alert.Root>
    {:else if columns.length > 0}
      <div class="no-scrollbar max-h-full overflow-auto">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {#each columns as column}
                <Table.Head>{column}</Table.Head>
              {/each}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each rows as row}
              <Table.Row>
                {#each columns as column}
                  {@const value =
                    row[column] instanceof Date ? row[column].toLocaleString() : row[column]}
                  <Table.Cell class="min-w-[100px]">{value}</Table.Cell>
                {/each}
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
        <!-- Table footer -->
        <div class="mt-2 flex flex-row items-center justify-between gap-6">
          <div class="flex flex-row items-center">
            <Button size="sm" onclick={() => (exportLogsModalOpen = true)}>Export</Button>
          </div>
          <div class="items-cente flex flex-row gap-6">
            <!-- Current page index / Total pages -->
            <span class="text-sm font-semibold">
              Page {currentPage + 1} / {numberOfPages}
            </span>
            <!-- Pagination buttons -->
            <div class="flex items-center space-x-2">
              <Button
                variant="outline"
                class="aspect-square size-8 p-1"
                onclick={previousPage}
                disabled={currentPage === 0 || isQuerying}
              >
                <ChevronLeft class="size-full" />
              </Button>
              <Button
                variant="outline"
                class="aspect-square size-8 p-1"
                onclick={nextPage}
                disabled={currentPage >= numberOfPages - 1 || isQuerying}
              >
                <ChevronRight class="size-full" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div class="flex h-full items-center justify-center">
        <p class="text-muted-foreground">No results</p>
      </div>
    {/if}
  </Resizable.Pane>
</Resizable.PaneGroup>
