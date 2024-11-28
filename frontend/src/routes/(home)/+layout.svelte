<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import Nav from './Nav.svelte';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
  const { hasARegisteredUser } = data;
</script>

<div class="flex min-h-svh flex-col">
  <Nav {hasARegisteredUser} />

  {@render children?.()}
</div>
