<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';
  import { tv } from 'tailwind-variants';

  let {
    ref = $bindable(null),
    class: className,
    variant = 'default',
    inset,
    ...restProps
  }: ContextMenuPrimitive.ItemProps & {
    inset?: boolean;
    variant?: 'default' | 'destructive';
  } = $props();

  const itemVariants = tv({
    base: 'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors',
    variants: {
      variant: {
        default: 'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        destructive: 'data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  });
</script>

<ContextMenuPrimitive.Item
  bind:ref
  class={cn(itemVariants({ variant, className }), inset && 'pl-8', className)}
  {...restProps}
/>
