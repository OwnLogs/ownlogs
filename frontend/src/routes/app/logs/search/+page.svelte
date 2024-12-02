<script lang="ts">
  import { toast } from 'svelte-sonner';
  import { pageMetadata } from '$lib/stores';
  import { Input } from '$lib/components/ui/input/index.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import LogsTable from '../LogsTable.svelte';

  pageMetadata.set({
    title: 'Search logs',
    description: 'Search for logs',
    breadcrumbs: [{ name: 'Logs' }, { name: 'Search' }]
  });

  const { data } = $props();
  const { user } = data;

  let searchValue = $state('');
  let isLoading = $state(false);
  let numberOfPages = $state(0);
  let results = $state([]);
  let pageSize = $state(30);
  let table = $state();

  async function search({ pageNumber }: { pageNumber: number }) {
    const res = await fetch(`/api/logs/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: searchValue, page: pageNumber, resultsPerPage: pageSize })
    });
    if (!res.ok) {
      toast.error('Failed to search logs');
      return null;
    }

    const data = await res.json();
    if (data.error) {
      toast.error(data.message);
      return null;
    }

    numberOfPages = data.numberOfPages;
    results = data.results;
  }
</script>

<div class="flex w-full flex-col">
  <div class="gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
    <Card.Root>
      <Card.Header>
        <Card.Title>Search</Card.Title>
        <Card.Description>Search for logs.</Card.Description>
      </Card.Header>
      <Card.Content>
        <form
          onsubmitcapture={() => {
            table.refresh();
          }}
        >
          <div class="flex flex-row gap-4">
            <Input bind:value={searchValue} placeholder="Search" />
            <Button type="submit" loading={isLoading} disabled={isLoading}>Search</Button>
          </div>
        </form>
      </Card.Content>
    </Card.Root>
    <LogsTable
      {user}
      class="mt-6"
      getResults={search}
      bind:this={table}
      bind:rows={results}
      bind:pageSize
      bind:isLoading
      bind:numberOfPages
    />
  </div>
</div>
