<script>
  import { Button } from '$lib/components/ui/button';

  const { hasARegisteredUser } = $props();
</script>

<footer class="grid grid-rows-2 overflow-hidden rounded-2xl bg-primary text-primary-foreground">
  <div class="relative flex flex-col items-center justify-center gap-8 py-20">
    <img src="/logos/Dark.svg" class="size-24" alt="Logify logo" />
    <Button href={hasARegisteredUser ? '/log-in' : '/register'} size="sm" variant="secondary"
      >Get started</Button
    >
    <div
      class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-primary to-card-foreground"
    ></div>
  </div>
  <div class="relative mx-auto grid max-w-screen-xl bg-card-foreground px-8 py-24 lg:grid-cols-3">
    <div class="flex flex-col gap-10">
      <div class="flex flex-row items-center gap-2">
        <img src="/logos/Dark.svg" class="size-6" alt="Logify logo" />
        <h5 class="text-lg font-bold">Logify</h5>
      </div>
      <p class="text-sm text-muted/50">
        Collect, analyze, and visualize your logs with our powerful, Docker-powered platform.
        Enterprise-grade features, completely free and open source.
      </p>
    </div>
  </div>
</footer>
