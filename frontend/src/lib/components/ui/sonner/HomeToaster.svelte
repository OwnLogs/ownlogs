<script lang="ts">
  import { toasts, toast, type ToastType } from '$lib/stores';
  import { fly } from 'svelte/transition';
  import { tv } from 'tailwind-variants';
  import { cn } from '$lib/utils';
  import { Info, TriangleAlert, CheckCheck, X } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import { flip } from 'svelte/animate';

  const buttonVariants = tv({
    base: 'flex flex-row px-4 relative py-4 rounded-lg items-center gap-4 w-full bg-background border border-border',
    variants: {
      variant: {
        info: 'text-blue-600',
        error: 'text-destructive',
        success: 'text-emerald-600'
      }
    },
    defaultVariants: {
      variant: 'info'
    }
  });
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
  <div class="fixed bottom-2 right-2 z-40 flex w-full max-w-md flex-col gap-4">
    {#each $toasts.slice(0, 4) as activeToast (activeToast.id)}
      <div
        class={cn(buttonVariants({ variant: activeToast.type }))}
        animate:flip
        transition:fly={{ x: '100%' }}
      >
        <button class="absolute right-2 top-2" onclick={() => toast.remove(activeToast.id)}>
          <X class="size-5 text-primary" />
        </button>
        {@render icon(activeToast.type)}
        <div class="flex flex-col gap-2">
          <span class="text-base font-normal">
            {activeToast.message}
          </span>
          {#if activeToast.options.action}
            <Button
              size="sm"
              class="h-8 w-fit px-3 py-0"
              onclick={() => {
                activeToast.options.action?.onClick({
                  dismiss: () => toast.remove(activeToast.id)
                });
              }}
            >
              {activeToast.options.action.label}
            </Button>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}
