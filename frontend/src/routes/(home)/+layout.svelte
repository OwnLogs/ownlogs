<script lang="ts">
  import type { Snippet } from 'svelte';
  import { HomeToaster } from '$lib/components/ui/sonner/index.js';

  let { children }: { children: Snippet } = $props();
</script>

<HomeToaster />

<div class="flex min-h-svh flex-col">
  {@render children?.()}
</div>
