<script lang="ts">
  import { toasts, toast, type ToastType } from "$lib/stores";
  import { slide, scale, fade } from "svelte/transition";
  import { tv } from 'tailwind-variants';
  import { cn } from '$lib/utils';
  import { Info, TriangleAlert, CheckCheck, X } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button/index.js';

  const buttonVariants = tv({
    base: 'flex flex-row items-center justify-between py-2 px-4 border-b transition-colors',
    variants: {
      variant: {
        info: 'bg-blue-600/10 text-blue-600 border-blue-600 dark:bg-blue-400/20 dark:text-blue-400',
        error: 'bg-destructive/10 dark:bg-red-400/20 dark:text-red-400 text-destructive border-destructive',
        success: 'bg-emerald-600/10 text-emerald-600 border-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400'
      },
    },
    defaultVariants: {
      variant: 'info'
    }
  });
  let activeToast = $derived($toasts[0]);
</script>

{#snippet icon(type: ToastType)}
  {#if type === 'info'}
    <Info class="size-5" />
  {:else if type === 'error'}
    <TriangleAlert class="size-5" />
  {:else if type === 'success'}
    <CheckCheck class="size-5" />
  {/if}
{/snippet}

{#if $toasts.length > 0}
  <div class={cn(buttonVariants({ variant:activeToast.type }))} transition:slide={{ axis:'y' }}>
    <button onclick={() => (toast.remove(activeToast.id))}>
      <X class="size-5" />
    </button>
    {#each $toasts.slice(0, 1) as activeToast (activeToast.id)}
      <div class="flex h-8 flex-row transition-all grow items-center justify-center gap-2" in:fade>
        {@render icon(activeToast.type)}
        <span class="text-base font-normal">
          {activeToast.message}
        </span>
        {#if activeToast.options.action}
          <Button size="sm" class="py-0 h-full px-3" onclick={() => {activeToast.options.action?.onClick({ dismiss: () => toast.remove(activeToast.id) })}}>
            {activeToast.options.action.label}
          </Button>
        {/if}
      </div>
    {/each}
    <div class="w-5">
      {#if $toasts.length > 1}
        <span class="text-lg shrink-0 font-medium" transition:scale={{ start:0 }}>
          +{$toasts.length - 1}
        </span>
      {/if}
    </div>
  </div>
{/if}
