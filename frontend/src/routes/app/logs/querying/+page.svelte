<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import { pageMetadata } from '$lib/stores';
  import { MediaQuery } from 'runed';
  import { Play } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Textarea } from '$lib/components/ui/textarea/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import * as Resizable from '$lib/components/ui/resizable/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as Drawer from '$lib/components/ui/drawer/index.js';

  pageMetadata.set({
    title: 'Querying',
    description: 'Query logs from the database',
    breadcrumbs: [{ name: 'Logs' }, { name: 'Querying' }]
  });

  let { form } = $props();

  const isDesktop = new MediaQuery('(min-width: 1024px)');

  let queryInputValue: string = $state('SELECT * \nFROM logs;');
  let isQuerying: boolean = $state(false);
  let rows: any[] = $state([]);
  let columns: string[] = $state([]);
  let databaseStructureModalVisible: boolean = $state(false);
  let mobileHelpModalVisible: boolean = $state(false);

  $effect(() => {
    if (!form) return;
    if (!form.success) {
      toast.error(form.message);
    } else {
      rows = Array.isArray(form.rows) ? form.rows : [];
      columns = Array.isArray(form.rows) && form.rows.length > 0 ? Object.keys(form.rows[0]) : [];
      console.log(columns);
      toast.success(form.message);
    }

    form = null;
  });
</script>

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

<Drawer.Root bind:open={mobileHelpModalVisible}>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Help</Drawer.Title>
    </Drawer.Header>
    <div class="flex w-full flex-col gap-4 p-4">
      <Button
        onclick={() => {
          mobileHelpModalVisible = false;
          databaseStructureModalVisible = true;
        }}>Database structure</Button
      >
    </div>
    <Drawer.Footer>
      <Drawer.Close>Cancel</Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

<Resizable.PaneGroup direction="vertical" class="h-full max-h-full">
  <Resizable.Pane defaultSize={30} minSize={20}>
    <Resizable.PaneGroup direction="horizontal">
      <!-- Query input -->
      <Resizable.Pane defaultSize={70} minSize={30}>
        <div class="flex h-full flex-col gap-2 overflow-auto p-4">
          <div class="flex-roe flex items-center justify-between">
            <h1 class="text-lg font-medium">Query builder</h1>
            <Button size="sm" onclick={() => (mobileHelpModalVisible = true)}>Help</Button>
          </div>
          <!-- Text editor -->
          <form
            action="?/runQuery"
            method="POST"
            class="flex grow flex-col gap-4"
            use:enhance={() => {
              isQuerying = true;
              return async ({ update }) => {
                isQuerying = false;
                update({ reset: false });
              };
            }}
          >
            <Textarea class="grow resize-none" name="query" bind:value={queryInputValue} />
            <Button disabled={isQuerying} loading={isQuerying} type="submit">
              <Play class="size-10" />
              Run
            </Button>
          </form>
        </div>
      </Resizable.Pane>
      {#if isDesktop.matches}
        <Resizable.Handle withHandle />
        <!-- Database graph -->
        <Resizable.Pane defaultSize={30} minSize={20}>
          <div class="flex flex-col gap-2 p-4">
            <h1 class="text-lg font-medium">Help</h1>
            <Button onclick={() => (databaseStructureModalVisible = true)}
              >Database structure</Button
            >
          </div>
        </Resizable.Pane>
      {/if}
    </Resizable.PaneGroup>
  </Resizable.Pane>
  <Resizable.Handle withHandle />
  <!-- Query result -->
  <Resizable.Pane class="flex flex-col gap-2 p-4" defaultSize={70} minSize={20}>
    <h1 class="text-lg font-medium">Results</h1>
    {#if columns.length > 0}
      <div class="max-h-full overflow-auto">
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
      </div>
    {:else}
      <div class="flex h-full items-center justify-center">
        <p class="text-gray-500">No results</p>
      </div>
    {/if}
  </Resizable.Pane>
</Resizable.PaneGroup>
