<script lang="ts">
  import type { BuildingMessage } from '.';
  import { Brain, LoaderCircle } from 'lucide-svelte';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import { cn } from '$lib/utils';
  import { scale } from 'svelte/transition';

  interface Props {
    message: BuildingMessage;
  }
  let { message }: Props = $props();
</script>

{#snippet profilePicture(role: BuildingMessage['role'])}
  {#if role === 'system'}
    <div
      class="flex size-8 shrink-0 flex-col items-center justify-center overflow-hidden rounded-full border border-border p-1.5 text-primary"
    >
      <Brain class="size-full" />
    </div>
  {/if}
{/snippet}

{#if message.error}
  <Alert.Root
    class={cn('md:w-fit', message.role === 'system' ? '' : 'ml-auto mt-2')}
    variant="destructive"
  >
    <Brain class="size-4" />
    <Alert.Title>Error!</Alert.Title>
    <Alert.Description>{message.error} This is an error message</Alert.Description>
  </Alert.Root>
{:else}
  <div
    class={cn(
      'flex w-fit items-start gap-2.5 text-primary-foreground md:w-fit md:max-w-[70%]',
      message.role !== 'system' && 'ml-auto mt-2'
    )}
    in:scale={{ duration: 300 }}
  >
    {@render profilePicture(message.role)}
    {#if message.content === ''}
      <span in:scale={{ duration: 300 }}>
        <LoaderCircle class="mt-1 size-6 animate-spin text-primary" />
      </span>
    {:else}
      <div
        class={cn(
          'flex flex-col whitespace-pre-wrap rounded-xl border-border bg-primary px-4 py-2 text-base font-normal',
          message.role === 'system' ? 'rounded-tl-none' : 'rounded-tr-none'
        )}
      >
        {message.content}
      </div>
    {/if}
  </div>
{/if}
