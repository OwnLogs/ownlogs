<script>
  import Bento from './Bento/Bento.svelte';
  import Hero from './Hero/Hero.svelte';
  // import Features from './Features/Features.svelte';
  import Footer from './Footer.svelte';
  import { pageMetadata } from '$lib/stores';

  pageMetadata.set({
    title: 'Home',
    description:
      'OwnLogs is a platform that allows you to log your data and get insights in minutes.',
    breadcrumbs: []
  });

  const { data } = $props();
  const { hasARegisteredUser } = data;
</script>

<div class="mx-auto w-full max-w-screen-xl p-1">
  <!-- Hero -->
  <main class="w-full space-y-[200px]">
    <Hero {hasARegisteredUser} />

    <Bento />

    <!-- <Features /> -->

    <Footer />
  </main>
</div>
