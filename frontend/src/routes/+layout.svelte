<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import { Toaster } from '$lib/components/ui/sonner/index.js';
  import { pageMetadata } from '$lib/stores';
  import { page } from '$app/stores';

  let { children } = $props();
  const SITE_NAME = 'Logify';
</script>

<svelte:head>
  <link rel="canonical" href={$page.url.href.split('#')[0]} />
  <meta property="twitter:domain" content={$page.url.hostname} />
  <meta property="twitter:url" content={$page.url.href.split('#')[0]} />
  <meta property="og:url" content={$page.url.href.split('#')[0]} />
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content={SITE_NAME} />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content="@logify" />
  <meta name="twitter:creator" content="@logify" />
  <meta name="twitter:domain" content={$page.url.hostname} />
  <meta name="twitter:url" content={$page.url.href.split('#')[0]} />

  <!-- Dynamic data -->
  <title>{$pageMetadata.title} | {SITE_NAME}</title>
  <meta property="og:title" content="{$pageMetadata.title} | {SITE_NAME}" />
  <meta property="twitter:title" content="{$pageMetadata.title} | {SITE_NAME}" />

  <meta name="description" content={$pageMetadata.description} />
  <meta property="og:description" content={$pageMetadata.description} />
  <meta property="twitter:description" content={$pageMetadata.description} />
</svelte:head>

<ModeWatcher />
<Toaster />

{@render children?.()}
