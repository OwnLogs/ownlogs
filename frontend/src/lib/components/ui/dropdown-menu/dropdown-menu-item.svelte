<script lang="ts">
  import { cn } from '$lib/utils.js';
  import { tv } from 'tailwind-variants';
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

  let {
    ref = $bindable(null),
    class: className,
    variant = 'default',
    inset,
    ...restProps
  }: DropdownMenuPrimitive.ItemProps & {
    inset?: boolean;
    variant?: 'default' | 'destructive';
  } = $props();

  const itemVariants = tv({
    base: 'relative flex flex-row gap-2 items-center cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors',
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

<DropdownMenuPrimitive.Item
  bind:ref
  class={cn(itemVariants({ variant, className }), inset && 'pl-8', className)}
  {...restProps}
/>
