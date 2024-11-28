<script lang="ts">
  import { Timer, Container, TriangleAlert, Info, OctagonAlert } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';

  class PeriodicLogs {
    logList: { title: string; description: string; icon: any; color: string; id: string }[] =
      $state([]);
    interval: ReturnType<typeof setInterval> | null;
    MAX_NUMBER_OF_LOGS = 5;
    lastIndex: number = -1;
    possibleLogs = [
      {
        title: 'Error',
        description: 'An error occurred while processing the request.',
        icon: OctagonAlert,
        color: 'text-red-600'
      },
      {
        title: 'Warning',
        description: 'Pruning old data is taking an unexpected amount of time.',
        icon: TriangleAlert,
        color: 'text-amber-600'
      },
      {
        title: 'Info',
        description: 'A new order has just been submitted.',
        icon: Info,
        color: 'text-blue-600'
      },
      {
        title: 'Error',
        description: 'Server has timed out.',
        icon: OctagonAlert,
        color: 'text-red-600'
      },
      {
        title: 'Warning',
        description: 'A request has been made to the server from an unknown IP.',
        icon: TriangleAlert,
        color: 'text-amber-600'
      }
    ];

    constructor() {
      this.interval = null;
    }

    addLog() {
      this.lastIndex = (this.lastIndex + 1) % this.possibleLogs.length;
      const newLog = { ...this.possibleLogs[this.lastIndex], id: Math.random().toString() };
      this.logList.unshift(newLog);
      if (this.logs.length > this.MAX_NUMBER_OF_LOGS) {
        this.logList = this.logs.slice(0, this.MAX_NUMBER_OF_LOGS);
      }
    }

    start() {
      this.interval = setInterval(this.addLog.bind(this), 2000);
    }

    stop() {
      if (this.interval) clearInterval(this.interval);
    }

    get logs() {
      return this.logList;
    }
  }

  const logs: PeriodicLogs = new PeriodicLogs();
  let isBentoVisible = $state(false);
  let bentoGrid: HTMLElement | undefined = $state();

  onMount(() => {
    const checkBentoVisibility = () => {
      if (!bentoGrid) {
        isBentoVisible = false;
        return;
      }
      const rect = bentoGrid.getBoundingClientRect();
      const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
      isBentoVisible = !(rect.bottom < 0 || rect.top - viewHeight >= 0);
    };

    checkBentoVisibility();
    window.addEventListener('scroll', checkBentoVisibility);

    // Add first log to logs list
    logs.addLog();

    return () => {
      window.removeEventListener('scroll', checkBentoVisibility);
    };
  });

  // When the bento grid is visible, add logs toasts, else stop
  $effect(() => {
    if (isBentoVisible) {
      logs.start();
    } else {
      logs.stop();
    }
  });
</script>

<div class="flex flex-col">
  <h2 class="text-center text-4xl font-semibold text-neutral-800">Everything You Need</h2>
  <h3 class="text-center text-lg font-medium text-neutral-600">
    Powerful features to help you manage and understand your logs better
  </h3>
  <div class="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-3" bind:this={bentoGrid}>
    <div
      class="flex flex-col items-center justify-between gap-1 rounded-xl border border-border bg-secondary lg:col-span-2"
    >
      <div class="relative h-[400px] grow overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-24" viewBox="0 0 128 128">
          <path
            fill="#3a4d54"
            fill-rule="evenodd"
            d="M73.8 50.8h11.3v11.5h5.7c2.6 0 5.3-.5 7.8-1.3c1.2-.4 2.6-1 3.8-1.7c-1.6-2.1-2.4-4.7-2.6-7.3c-.3-3.5.4-8.1 2.8-10.8l1.2-1.4l1.4 1.1c3.6 2.9 6.5 6.8 7.1 11.4c4.3-1.3 9.3-1 13.1 1.2l1.5.9l-.8 1.6c-3.2 6.2-9.9 8.2-16.4 7.8c-9.8 24.3-31 35.8-56.8 35.8c-13.3 0-25.5-5-32.5-16.8l-.1-.2l-1-2.1c-2.4-5.2-3.1-10.9-2.6-16.6l.2-1.7h9.6V50.8h11.3V39.6h22.5V28.3h13.5z"
            clip-rule="evenodd"
          />
          <path
            fill="#00aada"
            d="M110.4 55.1c.8-5.9-3.6-10.5-6.4-12.7c-3.1 3.6-3.6 13.2 1.3 17.2c-2.8 2.4-8.5 4.7-14.5 4.7H18.6c-.6 6.2.5 11.9 3 16.8l.8 1.5c.5.9 1.1 1.7 1.7 2.6c3 .2 5.7.3 8.2.2c4.9-.1 8.9-.7 12-1.7c.5-.2.9.1 1.1.5c.2.5-.1.9-.5 1.1c-.4.1-.8.3-1.3.4c-2.4.7-5 1.1-8.3 1.3h-.6c-1.3.1-2.7.1-4.2.1c-1.6 0-3.1 0-4.9-.1c6 6.8 15.4 10.8 27.2 10.8c25 0 46.2-11.1 55.5-35.9c6.7.7 13.1-1 16-6.7c-4.5-2.7-10.5-1.8-13.9-.1"
          />
          <path
            fill="#28b8eb"
            d="M110.4 55.1c.8-5.9-3.6-10.5-6.4-12.7c-3.1 3.6-3.6 13.2 1.3 17.2c-2.8 2.4-8.5 4.7-14.5 4.7h-68c-.3 9.5 3.2 16.7 9.5 21c4.9-.1 8.9-.7 12-1.7c.5-.2.9.1 1.1.5c.2.5-.1.9-.5 1.1c-.4.1-.8.3-1.3.4c-2.4.7-5.2 1.2-8.5 1.4l-.1-.1c8.5 4.4 20.8 4.3 35-1.1c15.8-6.1 30.6-17.7 40.9-30.9c-.2.1-.4.1-.5.2"
          />
          <path
            fill="#028bb8"
            d="M18.7 71.8c.4 3.3 1.4 6.4 2.9 9.3l.8 1.5c.5.9 1.1 1.7 1.7 2.6c3 .2 5.7.3 8.2.2c4.9-.1 8.9-.7 12-1.7c.5-.2.9.1 1.1.5c.2.5-.1.9-.5 1.1c-.4.1-.8.3-1.3.4c-2.4.7-5.2 1.2-8.5 1.4h-.4c-1.3.1-2.7.1-4.1.1c-1.6 0-3.2 0-4.9-.1c6 6.8 15.5 10.8 27.3 10.8c21.4 0 40-8.1 50.8-26H18.7z"
          />
          <path
            fill="#019bc6"
            d="M23.5 71.8c1.3 5.8 4.3 10.4 8.8 13.5c4.9-.1 8.9-.7 12-1.7c.5-.2.9.1 1.1.5c.2.5-.1.9-.5 1.1c-.4.1-.8.3-1.3.4c-2.4.7-5.2 1.2-8.6 1.4c8.5 4.4 20.8 4.3 34.9-1.1c8.5-3.3 16.8-8.2 24.2-14.1z"
          />
          <path
            fill="#00acd3"
            fill-rule="evenodd"
            d="M28.4 52.7h9.8v9.8h-9.8zm.8.8h.8v8.1h-.8zm1.4 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm3-12h9.8v9.8h-9.8zm.9.8h.8v8.1h-.8zm1.4 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.4 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8z"
            clip-rule="evenodd"
          />
          <path
            fill="#23c2ee"
            fill-rule="evenodd"
            d="M39.6 52.7h9.8v9.8h-9.8zm.9.8h.8v8.1h-.8zm1.4 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.4 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8z"
            clip-rule="evenodd"
          />
          <path
            fill="#00acd3"
            fill-rule="evenodd"
            d="M50.9 52.7h9.8v9.8h-9.8zm.8.8h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.4 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8z"
            clip-rule="evenodd"
          />
          <path
            fill="#23c2ee"
            fill-rule="evenodd"
            d="M50.9 41.5h9.8v9.8h-9.8zm.8.8h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.4 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm3.1 10.4H72v9.8h-9.8zm.8.8h.8v8.1H63zm1.5 0h.8v8.1h-.8zm1.4 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8z"
            clip-rule="evenodd"
          />
          <path
            fill="#00acd3"
            fill-rule="evenodd"
            d="M62.2 41.5H72v9.8h-9.8zm.8.8h.8v8.1H63zm1.5 0h.8v8.1h-.8zm1.4 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8z"
            clip-rule="evenodd"
          />
          <path
            fill="#23c2ee"
            fill-rule="evenodd"
            d="M62.2 30.2H72V40h-9.8zm.8.8h.8v8.1H63zm1.5 0h.8v8.1h-.8zm1.4 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8z"
            clip-rule="evenodd"
          />
          <path
            fill="#00acd3"
            fill-rule="evenodd"
            d="M73.5 52.7h9.8v9.8h-9.8zm.8.8h.8v8.1h-.8zm1.4 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8zm1.5 0h.8v8.1h-.8z"
            clip-rule="evenodd"
          />
          <path
            fill="#d4eef1"
            fill-rule="evenodd"
            d="M48.8 78.3c1.5 0 2.7 1.2 2.7 2.7s-1.2 2.7-2.7 2.7s-2.7-1.2-2.7-2.7s1.2-2.7 2.7-2.7"
            clip-rule="evenodd"
          />
          <path
            fill="#3a4d54"
            fill-rule="evenodd"
            d="M48.8 79.1c.2 0 .5 0 .7.1c-.2.1-.4.4-.4.7c0 .4.4.8.8.8c.3 0 .6-.2.7-.4c.1.2.1.5.1.7c0 1.1-.9 1.9-1.9 1.9c-1.1 0-1.9-.9-1.9-1.9s.8-1.9 1.9-1.9M1.1 72.8h125.4c-2.7-.7-8.6-1.6-7.7-5.2c-5 5.7-16.9 4-20 1.2c-3.4 4.9-23 3-24.3-.8c-4.2 5-17.3 5-21.5 0c-1.4 3.8-21 5.7-24.3.8c-3 2.8-15 4.5-20-1.2c1.1 3.5-4.9 4.5-7.6 5.2"
            clip-rule="evenodd"
          />
          <path
            fill="#bfdbe0"
            d="M56 97.8c-6.7-3.2-10.3-7.5-12.4-12.2c-2.5.7-5.5 1.2-8.9 1.4c-1.3.1-2.7.1-4.1.1c-1.7 0-3.4 0-5.2-.1c6 6 13.6 10.7 27.5 10.8z"
          />
          <path
            fill="#d4eef1"
            d="M46.1 89.9c-.9-1.3-1.8-2.8-2.5-4.3c-2.5.7-5.5 1.2-8.9 1.4c2.3 1.2 5.7 2.4 11.4 2.9"
          />
        </svg>
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

    <div
      class="flex flex-col items-center justify-between gap-1 rounded-xl border border-border bg-secondary"
    >
      <div class="relative h-[400px] grow overflow-hidden">
        <div class="flex w-full grow flex-col justify-start gap-2 p-6">
          {#each logs.logs as l (l.id)}
            <div
              class="flex w-full flex-row gap-2 rounded-lg bg-background p-3"
              animate:flip={{ duration: 300 }}
              transition:fly={{ x: '100%', duration: 300, delay: 100 }}
            >
              <l.icon class="{l.color} mt-1 size-6" />
              <div class="flex flex-col">
                <span class="text-base font-medium">{l.title}</span>
                <span class="text-sm text-muted-foreground">{l.description}</span>
              </div>
            </div>
          {/each}
        </div>
        <div
          class="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-b from-transparent to-secondary to-40%"
        ></div>
      </div>
      <div class="p-6 pt-0">
        <span class="text-base font-medium text-neutral-700">
          <Timer class="inline size-[18px] align-middle" />
          Real-time logs.
        </span>
        <span class="text-base text-neutral-500">View logs in real-time as they are generated</span>
      </div>
    </div>
  </div>
</div>
