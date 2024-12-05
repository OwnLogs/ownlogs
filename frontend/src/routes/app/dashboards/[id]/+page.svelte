<script lang="ts">
  import Grid from './grid.svelte';
  import { pageMetadata } from '$lib/stores';
  import type { PageData } from './$types';
  import type { Card, Dashboard } from '$lib/server/db/dashboard';
  import { toast } from 'svelte-sonner';
  import { Plus } from 'lucide-svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Textarea } from '$lib/components/ui/textarea/index.js';

  let { data }: { data: PageData } = $props();
  let dashboard: Dashboard = $state(data.dashboard);
  let addCardModalOpen = $state(false);
  let isAddingCard = $state(false);
  let addCardModalFormValues = $state({
    title: '',
    description: '',
    type: 'table',
    colSpan: '1',
    request: ''
  });

  $effect(() => {
    pageMetadata.set({
      title: dashboard.title,
      description: dashboard.description || '',
      breadcrumbs: [{ name: 'Dashboards' }, { name: dashboard.title }]
    });
  });

  const onSwap = (cards: Card[]) => {
    cards = cards.map((card, index) => ({ ...card, rank: index }));
    dashboard.cards = cards;
    saveDashboard();
  };

  async function saveDashboard(d?: Dashboard) {
    if (!d) d = dashboard;
    const res = await fetch(`/api/dashboard/save`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dashboard: d })
    });
    if (!res.ok) {
      toast.error('Failed to save dashboard');
    }
    const data = await res.json();
    if (data.error) {
      toast.error(data.message);
    } else {
      dashboard = data.dashboard;
    }
  }

  async function addCard(event: Event) {
    isAddingCard = true;
    event.preventDefault();
    const card = {
      title: addCardModalFormValues.title,
      description: addCardModalFormValues.description,
      type: addCardModalFormValues.type,
      colSpan: parseInt(addCardModalFormValues.colSpan),
      rank: dashboard.cards.length,
      request: addCardModalFormValues.request
    };
    dashboard.cards.push(card as Card);
    await saveDashboard();
    addCardModalFormValues = {
      title: '',
      description: '',
      type: 'table',
      colSpan: '1',
      request: ''
    };
    addCardModalOpen = false;
    isAddingCard = false;
  }

  async function deleteCard(card: Card) {
    let d = dashboard;
    d.cards = d.cards.filter((c) => c !== card);
    await saveDashboard(d);
  }

  async function onCardsEdit() {
    await saveDashboard();
  }
</script>

<Dialog.Root bind:open={addCardModalOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Add card</Dialog.Title>
    </Dialog.Header>
    <form onsubmitcapture={addCard} class="space-y-4">
      <div class="flex flex-col gap-1">
        <Label for="title">Card title</Label>
        <Input
          type="text"
          name="title"
          placeholder="Title"
          bind:value={addCardModalFormValues.title}
        />
      </div>

      <div class="flex flex-col gap-1">
        <Label for="description">Card description</Label>
        <Input
          type="text"
          name="description"
          placeholder="Description"
          bind:value={addCardModalFormValues.description}
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <Label for="description">Card type</Label>
          <Select.Root type="single" bind:value={addCardModalFormValues.type}>
            <Select.Trigger>{addCardModalFormValues.type}</Select.Trigger>
            <Select.Content>
              <Select.Item value="table">Table</Select.Item>
              <Select.Item value="graph">Graph</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        <div class="flex flex-col gap-1">
          <Label for="description">Col span</Label>
          <Select.Root type="single" bind:value={addCardModalFormValues.colSpan}>
            <Select.Trigger>{addCardModalFormValues.colSpan}</Select.Trigger>
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
        <Textarea name="query" bind:value={addCardModalFormValues.request} />
      </div>

      <div class="flex flex-row justify-end gap-2">
        <Button type="button" variant="outline" onclick={() => (addCardModalOpen = false)}
          >Cancel</Button
        >
        <Button type="submit" disabled={isAddingCard} loading={isAddingCard}>Add card</Button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>

<div class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
  <div class="flex flex-row items-center justify-between">
    <h1 class="text-lg font-semibold">{dashboard.title}</h1>
    <Button onclick={() => (addCardModalOpen = true)}><Plus class="size-6" />Add card</Button>
  </div>
  <Grid bind:cards={dashboard.cards} {onSwap} {deleteCard} {onCardsEdit} />
</div>
