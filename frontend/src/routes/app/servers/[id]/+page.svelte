<script lang="ts">
  import ServiceStatus from '$lib/components/ServiceStatus.svelte';
  import * as Card from '$lib/components/ui/card';
  import { pageMetadata } from '$lib/stores';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
  import { toast } from 'svelte-sonner';
  import { enhance } from '$app/forms';
  import { EllipsisVertical, Trash2, Pencil } from 'lucide-svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import type { Server } from '@shared/types';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { cn } from '$lib/utils';

  const { data, form } = $props();
  const { server } = data;

  let deleteServerModalOpen: boolean = $state(false);
  let deleteServerNameConfirmValue: string = $state('');
  let isDeletingServer: boolean = $state(false);
  let editServerModalOpen: boolean = $state(false);
  let editServerNewServer: Server = $state(server);
  let isEditingServer: boolean = $state(false);

  pageMetadata.set({
    title: server.name,
    description: 'Manage ' + server.name,
    breadcrumbs: [{ name: 'Servers', url: '/app/servers' }, { name: server.name }]
  });

  $effect(() => {
    if (form?.error) {
      toast.error(form.message);
    } else if (form?.success) {
      toast.success(form.message);
      deleteServerModalOpen = false;
      editServerModalOpen = false;
    }
  });
</script>

<!-- Edit server modal -->
<Dialog.Root bind:open={editServerModalOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit server</Dialog.Title>
    </Dialog.Header>
    <form
      action="?/editServer"
      method="POST"
      class="grid gap-4"
      use:enhance={() => {
        isDeletingServer = true;
        return async ({ update }) => {
          isDeletingServer = false;
          update();
        };
      }}
    >
      <div class="flex flex-col gap-2">
        <Label for="deleteServerNameInput">Name</Label>
        <Input
          id="deleteServerNameInput"
          name="deleteServerNameInput"
          bind:value={editServerNewServer.name}
        />
      </div>
      <div class="flex flex-col">
        <Label for="deleteServerDescriptionInput">Description</Label>
        <Input
          id="deleteServerDescriptionInput"
          name="deleteServerDescriptionInput"
          class="mt-2"
          bind:value={editServerNewServer.description}
        />
        <p class="text-sm text-muted-foreground">(Optional)</p>
      </div>
      <div class="flex flex-col">
        <Label for="deleteServerPublicUrlInput">Public URL</Label>
        <Input
          id="deleteServerPublicUrlInput"
          name="deleteServerPublicUrlInput"
          class="mt-2"
          bind:value={editServerNewServer.publicUrl}
        />
        <p class="text-sm text-muted-foreground">(Optional): Used for uptime monitoring.</p>
      </div>
      <Dialog.Footer>
        <Button type="submit" disabled={isEditingServer} loading={isEditingServer}>Save</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

<!-- Delete server modal -->
<AlertDialog.Root bind:open={deleteServerModalOpen}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This action cannot be undone. This will permanently delete this server and all the logs
        associated with it. Please type the name of the server to confirm.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <form
      action="?/deleteServer"
      method="POST"
      class="grid gap-4"
      use:enhance={() => {
        isDeletingServer = true;
        return async ({ update }) => {
          isDeletingServer = false;
          update();
        };
      }}
    >
      <div class="flex flex-col gap-2">
        <Label for="deleteServerNameConfirmValue">To confirm, type "{server.name}" below</Label>
        <Input
          id="deleteServerNameConfirmValue"
          name="deleteServerNameConfirmValue"
          bind:value={deleteServerNameConfirmValue}
        />
      </div>
      <AlertDialog.Footer>
        <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
        <Button
          type="submit"
          disabled={deleteServerNameConfirmValue !== server.name || isDeletingServer}
          loading={isDeletingServer}>Delete</Button
        >
      </AlertDialog.Footer>
    </form>
  </AlertDialog.Content>
</AlertDialog.Root>

<div class="flex w-full flex-col">
  <div class="gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
    <Card.Root>
      <Card.Header>
        <div class="flex flex-row items-center gap-2">
          {#if server?.publicUrl}
            <ServiceStatus isOnline={server?.isOnline} />
          {/if}
          <Card.Title>{server?.name}</Card.Title>
          <div class="ml-auto">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger class={cn(buttonVariants({ variant: 'outline' }), 'size-8')}
                ><EllipsisVertical class="size-6" /></DropdownMenu.Trigger
              >
              <DropdownMenu.Content class="w-56">
                <DropdownMenu.Group>
                  <DropdownMenu.GroupHeading>Server options</DropdownMenu.GroupHeading>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Group>
                    <DropdownMenu.Item onclick={() => (editServerModalOpen = true)}>
                      <Pencil class="mr-2 size-4" />
                      <span>Edit</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onclick={() => (deleteServerModalOpen = true)}>
                      <Trash2 class="mr-2 size-4 text-red-600" />
                      <span>Delete</span>
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Group>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
        <div class="flex flex-row items-center gap-2">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger>
                <div
                  class="flex flex-row items-center gap-1 rounded border border-border p-1 font-mono"
                >
                  <span class="font-base text-sm">ID:</span><span class="text-base font-bold"
                    >{server.id}</span
                  >
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>Use this id for the logger's config</p>
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
          {#if server?.description}
            <Card.Description>{server.description}</Card.Description>
          {/if}
        </div>
      </Card.Header>
      <Card.Content>
        {#if server?.publicUrl}
          <Button href={server.publicUrl} target="_blank" variant="link" size="sm">
            Go to server
          </Button>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
</div>
