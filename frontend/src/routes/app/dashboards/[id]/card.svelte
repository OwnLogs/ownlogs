<script lang="ts">
  import type { Card } from '$lib/server/db/dashboard';
  import { GripVertical, Trash2, Pencil, LoaderCircle } from 'lucide-svelte';
  import * as CardComponent from '$lib/components/ui/card/index.js';
  import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Textarea } from '$lib/components/ui/textarea/index.js';

  let {
    card = $bindable(),
    onDragStart,
    onDragEnd,
    deleteCard,
    onEditCard
  }: {
    card: Card;
    onDragStart: (card: Card) => void;
    onDragEnd: () => void;
    deleteCard: (card: Card) => void;
    onEditCard: () => void;
  } = $props();

  let editCardModalOpen = $state(false);
  let isEditingCard = $state(false);
  let isDeletingThisCard = $state(false);
  let deleteCardConfirmModalOpen = $state(false);
  let editCardData = $state(JSON.parse(JSON.stringify(card)));

  function editCard(): void {
    card = JSON.parse(JSON.stringify(editCardData));
    onEditCard();
    editCardModalOpen = false;
  }

  async function deleteThisCard(): Promise<void> {
    isDeletingThisCard = true;
    await deleteCard(card);
    isDeletingThisCard = false;
  }
</script>

<!-- Edit card modal -->
<Dialog.Root bind:open={editCardModalOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit card</Dialog.Title>
    </Dialog.Header>
    <form onsubmitcapture={editCard} class="space-y-4">
      <div class="flex flex-col gap-1">
        <Label for="title">Card title</Label>
        <Input type="text" name="title" placeholder="Title" bind:value={editCardData.title} />
      </div>

      <div class="flex flex-col gap-1">
        <Label for="description">Card description</Label>
        <Input
          type="text"
          name="description"
          placeholder="Description"
          bind:value={editCardData.description}
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <Label for="description">Card type</Label>
          <Select.Root type="single" bind:value={editCardData.type}>
            <Select.Trigger>{editCardData.type}</Select.Trigger>
            <Select.Content>
              <Select.Item value="table">Table</Select.Item>
              <Select.Item value="graph">Graph</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        <div class="flex flex-col gap-1">
          <Label for="description">Col span</Label>
          <Select.Root type="single" bind:value={editCardData.colSpan}>
            <Select.Trigger>{editCardData.colSpan}</Select.Trigger>
            <Select.Content>
              {#each Array(3) as _, index}
                <Select.Item value={(index + 1).toString()}>{index + 1}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <Label for="query">Query</Label>
        <Textarea name="query" bind:value={editCardData.request} />
      </div>

      <div class="flex flex-row justify-end gap-2">
        <Button type="button" variant="outline" onclick={() => (editCardModalOpen = false)}
          >Cancel</Button
        >
        <Button type="submit" disabled={isEditingCard} loading={isEditingCard}>Save</Button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>

<!-- Delete card confirm modal -->
<AlertDialog.Root bind:open={deleteCardConfirmModalOpen}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This action cannot be undone. This will permanently delete the card and all of it's data.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={deleteThisCard}>Continue</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

{#snippet DataCardComponent(card: Card)}
  {#if card?.data}
    {@const cols = card.data.length > 0 ? Object.keys(card.data[0] as object) : []}
    <div class="max-h-[500px] w-full overflow-auto">
      <table>
        <thead>
          <tr>
            {#each cols as k}
              <th>{k}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each card.data as data}
            <tr>
              {#each Object.values(data as object) as v}
                <td>{v}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
{/snippet}

{#snippet GraphCardComponent(card: Card)}
  <div>
    <pre>{JSON.stringify(card.config, null, 2)}</pre>
  </div>
{/snippet}

<ContextMenu.Root>
  <ContextMenu.Trigger>
    <CardComponent.Root class="group">
      <CardComponent.Header>
        <div class="flex flex-row">
          {#if card?.title}
            <CardComponent.Title>{card.title}</CardComponent.Title>
          {/if}
          <div
            class="ml-auto flex h-6 w-4 translate-x-full flex-col items-center justify-center rounded-sm border bg-border opacity-0 transition-opacity hover:cursor-move group-hover:opacity-100"
          >
            <GripVertical class="size-2.5" />
          </div>
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            draggable="true"
            ondragstart={() => onDragStart(card)}
            ondragend={onDragEnd}
            class="-z-10 h-6 w-4 group-hover:z-10"
          ></div>
        </div>
        {#if card.description}
          <CardComponent.Description>{card.description}</CardComponent.Description>
        {/if}
      </CardComponent.Header>
      <CardComponent.Content>
        {#if typeof card === 'object' && 'data' in card}
          {@render DataCardComponent(card)}
        {:else if typeof card === 'object' && 'config' in card}
          {@render GraphCardComponent(card)}
        {/if}
      </CardComponent.Content>
    </CardComponent.Root>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item
      class="flex flex-row items-center gap-2"
      onclick={() => (editCardModalOpen = true)}
    >
      <Pencil class="size-5" />
      Edit
    </ContextMenu.Item>
    <ContextMenu.Item
      variant="destructive"
      class="flex flex-row items-center gap-2"
      onclick={() => (deleteCardConfirmModalOpen = true)}
    >
      {#if isDeletingThisCard}
        <LoaderCircle class="size-5 animate-spin" />
      {:else}
        <Trash2 class="size-5" />
      {/if}
      Delete
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
