<script lang="ts">
  import { cn } from '$lib/utils';

  let { class: className, children }: { class?: string; children?: any } = $props();
</script>

<div
  class={cn(
    'flex size-14 items-center justify-center rounded-full border-2 bg-background p-2 shadow-lg transition-colors hover:border-primary hover:bg-primary/20 relative overflow-hidden',
    className
  )}
>
  <div class="absolute inset-0 bg-background -z-10"></div>
  {@render children?.()}
</div>
