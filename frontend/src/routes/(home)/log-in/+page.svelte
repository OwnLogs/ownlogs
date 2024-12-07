<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { enhance } from '$app/forms';
  import { pageMetadata, toast } from '$lib/stores';
  import { mode } from 'mode-watcher';
  import logInImageDark from '$lib/assets/logInImageDark.jpg?enhanced';
  import logInImageLight from '$lib/assets/logInImageLight.jpg?enhanced';

  const { form, data } = $props();
  let isLoading: boolean = $state(false);

  pageMetadata.set({
    title: 'Log-in',
    description: 'Log into your OwnLogs account',
    breadcrumbs: []
  });

  $effect(() => {
    if (form?.error) {
      toast.error(form.error);
    }
  });
</script>

<div
  class="container relative grid grow flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0"
>
  {#if !data.hasARegisteredUser}
    <Button href="/register" variant="ghost" class="absolute right-4 top-4 md:right-8 md:top-8">
      Register
    </Button>
  {/if}
  <div class="relative hidden h-full flex-col bg-muted dark:border-r lg:block">
    <div class="absolute inset-0">
      {#if $mode === 'dark'}
        <enhanced:img src={logInImageDark} alt="" class="size-full object-cover" />
      {:else}
        <enhanced:img src={logInImageLight} alt="" class="size-full object-cover" />
      {/if}
    </div>
  </div>
  <div class="lg:p-8">
    <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div class="flex flex-col space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">Log In</h1>
        <p class="text-sm text-muted-foreground">
          Enter your username and password below to log in to your account
        </p>
      </div>

      <div class="grid gap-6">
        <form
          method="POST"
          action="?/login"
          use:enhance={() => {
            isLoading = true;
            return async ({ update }) => {
              isLoading = false;
              update({ reset: false });
            };
          }}
        >
          <div class="grid gap-2">
            <div class="grid gap-1">
              <Label class="sr-only" for="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Username"
                type="text"
                autocapitalize="none"
                autocomplete="username"
                autocorrect="off"
              />
            </div>
            <div class="grid gap-1">
              <Label class="sr-only" for="password">Password</Label>
              <Input
                id="password"
                name="password"
                placeholder="Password"
                type="password"
                autocapitalize="none"
                autocomplete="current-password"
                autocorrect="off"
              />
            </div>
            <Button type="submit" loading={isLoading} disabled={isLoading}>Log In</Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
