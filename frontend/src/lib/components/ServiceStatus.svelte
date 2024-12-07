<script>
  import { cn } from '$lib/utils';
  import * as Tooltip from '$lib/components/ui/tooltip';

  let { isOnline = true, class: className = '' } = $props();
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    <div class={cn('relative size-3 shrink-0', className)}>
      <div
        class={cn(
          'absolute inset-0 animate-ping rounded-full',
          isOnline ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-red-400 dark:bg-red-600'
        )}
      ></div>
      <div
        class={cn('absolute inset-0 rounded-full', isOnline ? 'bg-emerald-400' : 'bg-red-500')}
      ></div>
    </div>
  </Tooltip.Trigger>
  <Tooltip.Content class="capitalize">
    {isOnline ? 'Online' : 'Offline'}
  </Tooltip.Content>
</Tooltip.Root>
