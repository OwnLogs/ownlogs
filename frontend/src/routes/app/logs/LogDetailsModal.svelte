<script lang="ts">
  import { buttonVariants } from '$lib/components/ui/button/index.js';
  import * as Drawer from '$lib/components/ui/drawer/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import * as Sheet from '$lib/components/ui/sheet/index.js';
  import { MediaQuery } from 'runed';
  import { columnsPrettyNames } from './columns';
  import type { ColumnsPrettyNames } from './columns';
  import type { Log } from '@shared/types';

  let { log }: { log: Log | null } = $props();

  let isOpen: boolean = $state(false);

  $effect(() => {
    if (log) {
      isOpen = true;
    } else {
      isOpen = false;
      log = null;
    }
  });

  const isDesktop = new MediaQuery('(min-width: 768px)');
</script>

{#if isDesktop.matches}
  <!-- On desktop -->
  <Sheet.Root bind:open={isOpen}>
    <Sheet.Content class="w-full sm:max-w-2xl">
      <Sheet.Header>
        <Sheet.Title>Log details</Sheet.Title>
      </Sheet.Header>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-[100px]">Key</Table.Head>
            <Table.Head>Value</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#if log}
            {#each Object.entries(log) as [key, value]}
              <Table.Row>
                <Table.Cell class="font-medium"
                  >{columnsPrettyNames[key as keyof ColumnsPrettyNames]}</Table.Cell
                >
                <Table.Cell>{value}</Table.Cell>
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>
    </Sheet.Content>
  </Sheet.Root>
{:else}
  <!-- On mobile -->
  <Drawer.Root bind:open={isOpen}>
    <Drawer.Content>
      <div class="mx-auto w-full max-w-screen-md">
        <Drawer.Header>
          <Drawer.Title>Log details</Drawer.Title>
        </Drawer.Header>

        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head class="w-[100px]">Key</Table.Head>
              <Table.Head>Value</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#if log}
              {#each Object.entries(log) as [key, value]}
                <Table.Row>
                  <Table.Cell class="font-medium"
                    >{columnsPrettyNames[key as keyof ColumnsPrettyNames]}</Table.Cell
                  >
                  <Table.Cell>{value}</Table.Cell>
                </Table.Row>
              {/each}
            {/if}
          </Table.Body>
        </Table.Root>

        <Drawer.Footer>
          <Drawer.Close class={buttonVariants({ variant: 'default' })}>Close</Drawer.Close>
        </Drawer.Footer>
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}
