<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import Nav from './Nav.svelte';
  import { HomeToaster } from '$lib/components/ui/sonner/index.js';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
  const { hasARegisteredUser } = data;
</script>

<HomeToaster />

<div class="flex min-h-svh flex-col">
  <Nav {hasARegisteredUser} />

  {@render children?.()}
</div>
