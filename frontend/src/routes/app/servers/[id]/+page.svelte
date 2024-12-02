<script lang="ts">
  import { pageMetadata } from '$lib/stores';
  import { enhance } from '$app/forms';
  import { cn } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import { EllipsisVertical, Trash2, Pencil } from 'lucide-svelte';
  import { MediaQuery } from 'runed';
  import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import * as Card from '$lib/components/ui/card';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import * as Sheet from '$lib/components/ui/sheet/index.js';
  import * as Drawer from '$lib/components/ui/drawer/index.js';
  import MonitoringGraph from './MonitoringGraph.svelte';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';
  import { hasAtLeastOnePermission, hasPermission, PERMISSIONS } from '@shared/roles';

  let { data, form } = $props();
  let { server, monitoring, mailingEnabled, user } = data;
  const isDesktop = new MediaQuery('(min-width: 768px)');

  let deleteServerModalOpen: boolean = $state(false);
  let deleteServerNameConfirmValue: string = $state('');
  let isDeletingServer: boolean = $state(false);
  let editServerModalOpen: boolean = $state(false);
  let editServerNewServer = $state({ ...server, mailingEnabled: mailingEnabled });
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

    // Reset form state to prevent infinite reactivity due to updating parent variables in here
    if (form?.success) form.success = false;
    if (form?.error) form.error = false;
  });
</script>

<!-- Edit servers modal -->
{#if hasPermission(user?.role, PERMISSIONS.UPDATE_SERVER)}
  {#if isDesktop.matches}
    <!-- On desktop -->
    <Sheet.Root bind:open={editServerModalOpen}>
      <Sheet.Content class="w-full max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>Edit server</Sheet.Title>
        </Sheet.Header>

        <form
          action="?/editServer"
          method="POST"
          class="mt-4 grid gap-8"
          use:enhance={(e) => {
            e.formData.append('emailAlerts', editServerNewServer.mailingEnabled.toString());
            isDeletingServer = true;
            return async ({ update }) => {
              isDeletingServer = false;
              update({ reset: false });
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

          <div class="flex flex-row items-center gap-4">
            <Checkbox
              name="emailAlerts"
              id="emailAlerts"
              bind:checked={editServerNewServer.mailingEnabled}
            />
            <Label for="emailAlerts">Enable email alerts</Label>
          </div>

          <div class="flex flex-row items-center gap-4">
            <Checkbox
              name="monitored"
              id="monitored"
              bind:checked={editServerNewServer.monitored}
            />
            <Label for="monitored">Enable server monitoring</Label>
          </div>

          <Button type="submit" disabled={isEditingServer} loading={isEditingServer}>Save</Button>
        </form>
      </Sheet.Content>
    </Sheet.Root>
  {:else}
    <!-- On mobile -->
    <Drawer.Root bind:open={editServerModalOpen}>
      <Drawer.Content>
        <form
          action="?/editServer"
          method="POST"
          class="mx-auto w-full max-w-screen-md"
          use:enhance={() => {
            isDeletingServer = true;
            return async ({ update }) => {
              isDeletingServer = false;
              update({ reset: false });
            };
          }}
        >
          <Drawer.Header>
            <Drawer.Title>Edit server</Drawer.Title>
          </Drawer.Header>

          <div class="mb-4 grid gap-8 px-4">
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

            <div class="flex flex-row items-center gap-4">
              <Checkbox
                name="emailAlerts"
                id="emailAlerts"
                bind:checked={editServerNewServer.mailingEnabled}
              />
              <Label for="emailAlerts">Enable email alerts</Label>
            </div>

            <div class="flex flex-row items-center gap-4">
              <Checkbox
                name="monitored"
                id="monitored"
                bind:checked={editServerNewServer.monitored}
              />
              <Label for="monitored">Enable server monitoring</Label>
            </div>
          </div>

          <Drawer.Footer>
            <Button type="submit" disabled={isEditingServer} loading={isEditingServer}>Save</Button>
            <Drawer.Close type="button" class={buttonVariants({ variant: 'outline' })}
              >Close</Drawer.Close
            >
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer.Root>
  {/if}
{/if}

<!-- Delete server modal -->
{#if hasPermission(user?.role, PERMISSIONS.DELETE_SERVER)}
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
            update({ reset: false });
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
{/if}

{#if hasPermission(user?.role, PERMISSIONS.READ_SERVER)}
  <div class="flex w-full flex-col">
    <div class="gap-4 space-y-8 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card.Root>
        <Card.Header>
          <div class="flex flex-row items-center gap-2">
            <Card.Title>{server?.name}</Card.Title>
            {#if hasAtLeastOnePermission(user?.role, PERMISSIONS.UPDATE_SERVER, PERMISSIONS.DELETE_SERVER)}
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
                        {#if hasPermission(user?.role, PERMISSIONS.UPDATE_SERVER)}
                          <DropdownMenu.Item onclick={() => (editServerModalOpen = true)}>
                            <Pencil class="mr-2 size-4" />
                            <span>Edit</span>
                          </DropdownMenu.Item>
                        {/if}

                        <!-- Disable the delete button on the logs server -->
                        {#if hasPermission(user?.role, PERMISSIONS.DELETE_SERVER)}
                          <DropdownMenu.Item
                            disabled={server.id === 1}
                            onclick={() => (deleteServerModalOpen = true)}
                          >
                            <Trash2 class="mr-2 size-4 text-red-600" />
                            <span>Delete</span>
                          </DropdownMenu.Item>
                        {/if}
                      </DropdownMenu.Group>
                    </DropdownMenu.Group>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
            {/if}
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

      <Card.Root>
        <Card.Header>
          <Card.Title>Status</Card.Title>
        </Card.Header>

        <Card.Content>
          <MonitoringGraph {monitoring} />
        </Card.Content>
      </Card.Root>
    </div>
  </div>
{/if}
