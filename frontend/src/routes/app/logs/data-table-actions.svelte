<script lang="ts">
  import { Trash2, Ellipsis } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { API_URL } from '$lib/constants';
  import { toast } from 'svelte-sonner';

  let { id }: { id: number } = $props();

  async function deleteLog() {
    const res = await fetch(API_URL + '/deleteLog', {
      method: 'DELETE',
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      toast.error('Failed to delete log');
      console.error('Failed to delete log');
    }
    const data = await res.json();
    if (!data.success) {
      toast.error(data.error);
      console.error(data.error);
    }

    toast.success('Log deleted');

    // Refresh the table
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
        <span class="sr-only">Open menu</span>
        <Ellipsis class="size-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
      <DropdownMenu.Item onclick={deleteLog}>
        <Trash2 class="size-4" />
        Delete
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
