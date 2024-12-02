<script lang="ts">
  import { Container, MousePointer2, Loader, Power, Check, BadgeCheck } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { flip } from 'svelte/animate';
  import { fade, fly, scale, slide } from 'svelte/transition';

  interface callback {
    currentTimelineIndex: number;
    mousePointer: HTMLElement;
    actionsBehind: string[];
  }

  let mousePointer: HTMLElement | undefined = $state();
  let getStartedButton: HTMLElement | undefined = $state();
  let currentTimelineIndex = $state(0);
  let actionsBehind: string[] = $state([]);
  const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const possibleActions = [
    'Creating virtual environment...',
    'Installing dependencies...',
    'Building project...',
    'Starting server...',
    'Running tests...',
    'Deploying...',
    'Finishing up...'
  ];

  const DELAY_BETWEEN_ACTIONS = 1000;
  const mouseAnimationTimeline = [
    {
      callback: async ({ mousePointer }: callback) => {
        mousePointer.style.top = '70%';
        mousePointer.style.left = '70%';
        mousePointer.style.opacity = '1';
        mousePointer.style.transform = 'scale(1)';
        await delay(DELAY_BETWEEN_ACTIONS);
      }
    },
    {
      callback: async ({ mousePointer }: callback) => {
        mousePointer.style.top = '50%';
        mousePointer.style.left = '50%';
        await delay(DELAY_BETWEEN_ACTIONS);
      }
    },
    {
      callback: async ({ mousePointer }: callback) => {
        mousePointer.style.top = '50%';
        mousePointer.style.left = '50%';
        mousePointer.style.transform = 'scale(0)';
        await delay(300);
        mousePointer.style.top = '70%';
        mousePointer.style.left = '70%';
      }
    },
    {
      callback: async ({ actionsBehind }: callback) => {
        for (const action of possibleActions) {
          actionsBehind.unshift(action);
          await delay(DELAY_BETWEEN_ACTIONS);
        }
      }
    },
    {
      callback: async () => {
        actionsBehind = [];
        await delay(DELAY_BETWEEN_ACTIONS * 3);
      }
    }
  ];

  onMount(() => {
    const next = async () => {
      await mouseAnimationTimeline[currentTimelineIndex]?.callback?.({
        currentTimelineIndex,
        mousePointer,
        actionsBehind
      } as callback);
      currentTimelineIndex =
        currentTimelineIndex >= mouseAnimationTimeline.length - 1 ? 0 : currentTimelineIndex + 1;
      next();
    };

    next();
  });
</script>

<div
  class="flex flex-col items-center justify-between gap-1 rounded-xl border border-border bg-secondary lg:col-span-2"
>
  <div class="relative h-[400px] w-full grow overflow-hidden">
    {#if currentTimelineIndex <= 3}
      <!-- Actions list -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-start gap-2 overflow-y-hidden p-4"
      >
        {#each actionsBehind as action (action)}
          <div
            in:fly={{ y: '-100%', duration: 300 }}
            out:fade={{ duration: 300 }}
            animate:flip={{ duration: 300 }}
            class="text-md w-min min-w-[300px] rounded-lg border border-border bg-background p-4 font-medium text-primary"
          >
            {action}
          </div>
        {/each}
      </div>
      <!-- Semi transparent bg -->
      <div class="absolute inset-0 bg-secondary/50"></div>
      <!-- Bottom mask -->
      <div
        class="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-b from-transparent to-secondary"
      ></div>

      <!-- Get started button -->
      <button
        transition:scale={{ start: 0 }}
        class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-row items-center rounded-xl border border-border bg-background px-4 py-2 text-lg font-semibold text-primary shadow-lg transition-all"
        bind:this={getStartedButton}
      >
        <div class="relative mr-2 size-6">
          {#if currentTimelineIndex === 3}
            <span in:scale={{ duration: 300, start: 0 }}>
              <Loader class="absolute size-full animate-spin" />
            </span>
          {:else if currentTimelineIndex === 4}
            <span in:scale={{ duration: 300, start: 0 }}>
              <Check class="absolute size-full stroke-2 text-green-600" />
            </span>
          {:else}
            <span in:scale={{ duration: 300, start: 0 }}>
              <Power class="absolute size-full stroke-2" />
            </span>
          {/if}
        </div>
        Get started
      </button>
    {:else}
      <div class="flex size-full flex-row items-center justify-center">
        <span in:scale={{ start: 0, duration: 400, delay: 400 }} out:scale>
          <BadgeCheck class="size-16 text-green-600" />
        </span>
        <span
          in:slide={{ axis: 'x', duration: 400, delay: 800 }}
          out:scale
          class="ml-4 whitespace-nowrap text-2xl font-semibold">Deployed successfully</span
        >
      </div>
    {/if}
    <!-- Mouse cursor -->
    <div class="group absolute size-10 transition-all" style="opacity: 0;" bind:this={mousePointer}>
      <div class="relative size-full">
        <MousePointer2 class="absolute size-full fill-background text-primary transition-opacity" />
      </div>
    </div>
  </div>
  <div class="p-6 pt-0">
    <span class="text-base font-medium text-neutral-700">
      <Container class="inline size-[18px] align-middle" />
      Docker powered.
    </span>
    <span class="text-base text-neutral-500"
      >Deploy anywhere with our Docker containers. Simple setup, seamless scaling.</span
    >
  </div>
</div>
