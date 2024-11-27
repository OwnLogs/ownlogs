<script lang="ts">
  import { format, subDays, addDays } from 'date-fns';
  import { cn } from '$lib/utils';
  import { slide } from 'svelte/transition';

  interface MonitoringData {
    day: Date;
    errors: { message: string; timestamp: Date }[];
    duration: number;
    filled?: boolean;
  }

  let { monitoring = [] }: { monitoring: MonitoringData[] } = $props();
  const NUMBER_OF_COLUMNS = 90;
  const HEIGHTS_BASED_ON_DISTANCE: { [key: number]: string } = {
    0: 'h-11',
    1: 'h-9',
    2: 'h-8',
    3: 'h-7'
  };
  let isHoveringIndex = $state(-1);
  let showingDetailsTooltip = $state(false);

  const formatDuration = (duration: number) => {
    if (duration < 1000) {
      return `${duration.toFixed(2)}ms`;
    }
    return `${(duration / 1000).toFixed(2)}s`;
  };

  function fillGaps(data: MonitoringData[]) {
    const filledData = [];
    const startDate = subDays(new Date(), NUMBER_OF_COLUMNS - 1);

    for (let i = 0; i < NUMBER_OF_COLUMNS; i++) {
      const currentDate = addDays(startDate, i);
      const existingData = data.find(
        (d) => format(new Date(d.day), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
      );

      if (existingData) {
        filledData.push(existingData);
      } else {
        filledData.push({ day: currentDate, errors: [], duration: 0, filled: true });
      }
    }

    return filledData;
  }

  const filledMonitoring = fillGaps(monitoring);
</script>

<svelte:window
  onclick={(e) => {
    const target = e.target as Element;
    if (!target.closest('.uptimeGraph') && !target.closest('.uptimeGraphTooltip')) {
      showingDetailsTooltip = false;
      isHoveringIndex = -1;
    }
  }}
/>

{#if monitoring.length === 0}
  <div class="flex h-32 flex-col items-center justify-center">
    <p class="text-lg font-semibold text-muted-foreground">No monitoring data available</p>
  </div>
{:else}
  <div class="no-scrollbar w-full max-w-full overflow-x-auto">
    <!-- Top row with current server status -->
    {#if monitoring.length > 0}
      <div class="mb-1 flex flex-row items-center justify-end">
        <div
          class={cn(
            'text-sm font-semibold',
            monitoring[monitoring.length - 1].errors.length > 0 ? 'text-red-600' : 'text-green-600'
          )}
        >
          {monitoring[monitoring.length - 1].errors.length > 0
            ? 'Error' + (monitoring[monitoring.length - 1].errors.length > 1 ? 's' : '')
            : 'Operational'}
        </div>
      </div>
    {/if}
    <!-- Main graph -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      onmouseleave={() => {
        showingDetailsTooltip = false;
      }}
      class="uptimeGraph flex h-11 items-center justify-between"
    >
      {#each filledMonitoring as data, i}
        {@const distance =
          isHoveringIndex >= 0 && (showingDetailsTooltip || data.filled)
            ? Math.min(Math.abs(isHoveringIndex - i), 3)
            : 3}
        {@const height = HEIGHTS_BASED_ON_DISTANCE[distance]}
        {#if data.filled}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            class={cn(
              'flex shrink-0 grow flex-row items-center justify-center px-0.5 transition-all',
              height
            )}
            onclick={() => {
              showingDetailsTooltip = true;
              isHoveringIndex = i;
            }}
            onmouseenter={() => {
              showingDetailsTooltip = false;
              isHoveringIndex = i;
            }}
            onmouseleave={() => {
              showingDetailsTooltip = false;
              isHoveringIndex = -1;
            }}
          >
            <div class="h-full w-[7px] rounded-full bg-secondary"></div>
          </div>
        {:else}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            class={cn(
              'flex shrink-0 grow flex-row items-center justify-center px-0.5 transition-all',
              height
            )}
            onclick={() => {
              showingDetailsTooltip = true;
              isHoveringIndex = i;
            }}
            onmouseenter={() => {
              showingDetailsTooltip = true;
              isHoveringIndex = i;
            }}
          >
            <div
              class={cn(
                'h-full w-[7px] rounded-full',
                data.filled
                  ? 'bg-secondary'
                  : data.errors.length > 0
                    ? 'bg-red-600'
                    : 'bg-green-600'
              )}
            ></div>
          </div>
        {/if}
      {/each}
    </div>
    <!-- Bottom of graph: Dates -->
    <div
      class={cn(
        'flex h-6 w-full flex-row items-center justify-between overflow-hidden transition-all duration-300',
        showingDetailsTooltip && 'h-0 opacity-0'
      )}
    >
      <div class="text-sm text-muted-foreground">
        {NUMBER_OF_COLUMNS} days ago
      </div>
      <div class="text-sm text-muted-foreground">Today</div>
    </div>
  </div>
  <!-- Tooltip -->
  {#if showingDetailsTooltip && isHoveringIndex > -1 && filledMonitoring[isHoveringIndex]}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="uptimeGraphTooltip z-10 pt-4"
      onmouseleave={() => {
        showingDetailsTooltip = false;
        isHoveringIndex = -1;
      }}
      onmouseenter={() => (showingDetailsTooltip = true)}
      transition:slide={{ axis: 'y', duration: 300 }}
    >
      <div class="grid w-full grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Date card -->
        <div class="space-y-2 rounded-lg bg-primary-foreground p-6">
          <p class="text-sm font-medium text-muted-foreground">Date</p>
          <p class="text-base font-semibold">
            {format(new Date(filledMonitoring[isHoveringIndex].day), 'MMM dd yyyy')}
          </p>
        </div>
        {#if filledMonitoring[isHoveringIndex].errors.length > 0}
          <!-- Errors list card -->
          <div
            class="space-y-2 rounded-lg bg-destructive p-6 text-primary-foreground dark:text-primary lg:col-span-2"
          >
            <p class="text-sm font-medium">
              Error{filledMonitoring[isHoveringIndex].errors.length > 1 ? 's' : ''}
            </p>
            <div class="h-18 overflow-y-auto">
              {#each filledMonitoring[isHoveringIndex].errors as error}
                <div class="flex flex-row items-center gap-2">
                  <time datetime={error.timestamp.toString()} class="font-mono text-sm">
                    {format(new Date(error.timestamp), 'HH:mm')}
                  </time>
                  <p class="text-base font-semibold">{error.message}</p>
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <!-- Ping card -->
          <div class="space-y-2 rounded-lg bg-primary-foreground p-6">
            <p class="text-sm font-medium text-muted-foreground">Ping</p>
            <p class="text-base font-semibold">
              {formatDuration(filledMonitoring[isHoveringIndex].duration)}
            </p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
{/if}
