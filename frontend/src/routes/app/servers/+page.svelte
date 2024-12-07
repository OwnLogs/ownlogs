<script lang="ts">
  import type { PageData } from './$types';
  import * as Card from '$lib/components/ui/card';
  import Button from '$lib/components/ui/button/button.svelte';
  import { pageMetadata } from '$lib/stores';
  import { Plus } from 'lucide-svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import NewServerForm from './NewServerForm.svelte';
  import { hasPermission, PERMISSIONS } from '@shared/roles';

  pageMetadata.set({
    title: 'Servers',
    description: 'Manage your servers',
    breadcrumbs: [{ name: 'Servers' }]
  });

  const { data }: { data: PageData } = $props();
  const { user } = data;

  let addServerModalOpen: boolean = $state(false);
</script>

<!-- Create a server modal -->
{#if hasPermission(user?.role, PERMISSIONS.CREATE_SERVER)}
  <Dialog.Root bind:open={addServerModalOpen}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Add a new server</Dialog.Title>
      </Dialog.Header>

      <NewServerForm data={data.newServerForm} bind:open={addServerModalOpen} />
    </Dialog.Content>
  </Dialog.Root>
{/if}

<div class="flex w-full flex-col">
  <div class="p-4 sm:px-6 sm:py-0">
    <Card.Root>
      <Card.Header>
        <Card.Title>Your servers</Card.Title>
        <Card.Description
          >Here you can gat an at-a-glance overview of your servers.</Card.Description
        >
      </Card.Header>
      <Card.Content class="space-y-8">
        {#if hasPermission(user?.role, PERMISSIONS.CREATE_SERVER)}
          <Button onclick={() => (addServerModalOpen = true)}>
            <Plus class="size-6" />
            Add a server
          </Button>
        {/if}

        {#if hasPermission(user?.role, PERMISSIONS.READ_SERVER)}
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            {#each data.servers as server}
              <Card.Root>
                <Card.Header>
                  <div class="flex flex-row items-center justify-between">
                    <div class="flex flex-row items-center gap-2">
                      <Card.Title>{server.name}</Card.Title>
                    </div>
                    <div
                      class="flex flex-row items-center gap-1 rounded border border-border p-1 font-mono"
                    >
                      <span class="font-base text-sm">ID:</span><span class="text-base font-bold"
                        >{server.id}</span
                      >
                    </div>
                  </div>
                </Card.Header>
                <Card.Content>
                  <div class="flex justify-between">
                    <div>
                      <Button href="/app/servers/{server.id}">Manage</Button>
                    </div>
                  </div>
                </Card.Content>
              </Card.Root>
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
</div>
