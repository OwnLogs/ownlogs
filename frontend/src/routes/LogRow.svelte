<script lang="ts">
  import { type Log, type LogLevel } from '../app.d';
  import { Info, TriangleAlert, OctagonAlert, Skull } from 'lucide-svelte';
  import { cn } from '$lib/utils';

	interface Props {
    log: Log;
    class?: string;
	}

	const { log, class: className }: Props = $props();

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const rowClasses = new Map<LogLevel, string>([
    ['info' as LogLevel, 'bg-blue-600/10 text-blue-500'],
    ['warn' as LogLevel, 'bg-amber-600/10 text-amber-500'],
    ['error' as LogLevel, 'bg-red-600/10 text-red-500'],
    ['fatal' as LogLevel, 'bg-rose-600/10 text-rose-500'],
  ]);
</script>

<div class={cn("rounded-lg flex items-center flex-row px-2 py-1 text-neutral-400", className, rowClasses.get(log.level))}>
  <div class="flex items-center flex-row gap-2 w-[200px]">
    <!-- Icon -->
    {#if log.level === 'info'}
      <Info class="size-5 inline-block" />
    {:else if log.level === 'warn'}
      <TriangleAlert class="size-5 inline-block" />
    {:else if log.level === 'error'}
      <OctagonAlert class="size-5 inline-block" />
    {:else if log.level === 'fatal'}
      <Skull class="size-5 inline-block" />
    {:else}
      <div class="size-5 inline-block"></div>
    {/if}
    {formatTimestamp(log.timestamp)}
  </div>
  <div>
    {log.message}
  </div>
</div>
