<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import * as Table from '$lib/components/ui/table';
  import { Logs, ArrowUpRight, OctagonAlert, Skull, TriangleAlert } from 'lucide-svelte';
  import { pageMetadata } from '$lib/stores';
  import { API_URL } from '$lib/constants';
  import { type LogLevel as LogLevelType, type Log } from '../../app.d';
  import { toast } from 'svelte-sonner';
  import { onMount } from 'svelte';
  import { cn, formatTimestamp } from '$lib/utils';
  import LogLevel from '$lib/components/LogLevel.svelte';

  const { data } = $props();
  const { token } = data;

  pageMetadata.set({
    title: 'Logs overview',
    description: 'Logs overview analytics about logs.',
    breadcrumbs: [{ name: 'Logs' }, { name: 'Overview' }]
  });

  let statistics:
    | ({ [key in LogLevelType]: number } & { recentLogs: Log[]; total: number })
    | undefined = $state();

  async function getStatistics() {
    const res = await fetch(`${API_URL}/getLogsOverviewStatistics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      toast.error('Failed to fetch statistics');
      throw new Error('Failed to fetch statistics');
    }
    const data = await res.json();
    statistics = { ...data, total: data.warn + data.error + data.fatal + data.info + data.debug };
  }

  onMount(getStatistics);
</script>

<div class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
  <div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Total Logs</Card.Title>
        <Logs class="size-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{statistics?.total ?? 0}</div>
        <!-- <p class="text-muted-foreground text-xs">	20 today</p> -->
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Warnings</Card.Title>
        <TriangleAlert
          class={cn(
            'size-4 text-muted-foreground',
            (statistics?.warn ?? 0) > 0 && 'text-amber-600'
          )}
        />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{statistics?.warn ?? ''}</div>
        <!-- <p class="text-muted-foreground text-xs">+180.1% from last month</p> -->
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Errors</Card.Title>
        <OctagonAlert
          class={cn('size-4 text-muted-foreground', (statistics?.error ?? 0) > 0 && 'text-red-600')}
        />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{statistics?.error ?? ''}</div>
        <!-- <p class="text-muted-foreground text-xs">+19% from last month</p> -->
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Fatal errors</Card.Title>
        <Skull
          class={cn(
            'size-4 text-muted-foreground',
            (statistics?.fatal ?? 0) > 0 && 'text-rose-600'
          )}
        />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{statistics?.fatal ?? ''}</div>
        <!-- <p class="text-muted-foreground text-xs">+201 since last hour</p> -->
      </Card.Content>
    </Card.Root>
  </div>
  <div class="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
    <Card.Root class="xl:col-span-2">
      <Card.Header class="flex flex-row items-center">
        <div class="grid gap-2">
          <Card.Title>Logs</Card.Title>
          <Card.Description>Most recent logs.</Card.Description>
        </div>
        <Button href="/app/logs" size="sm" class="ml-auto gap-1">
          View All
          <ArrowUpRight class="size-4" />
        </Button>
      </Card.Header>
      <Card.Content>
        <!-- Recent logs list -->
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Status</Table.Head>
              <Table.Head>Timestamp</Table.Head>
              <Table.Head>Message</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each statistics?.recentLogs ?? [] as log}
              <Table.Row>
                <Table.Cell>
                  <LogLevel level={log.level} />
                </Table.Cell>
                <Table.Cell>{formatTimestamp(log.timestamp)}</Table.Cell>
                <Table.Cell>{log.message}</Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </Card.Content>
    </Card.Root>
  </div>
</div>
