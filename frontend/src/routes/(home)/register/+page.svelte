<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { toast } from 'svelte-sonner';

  const { form } = $props();

  $effect(() => {
    if (form?.error) {
      toast.error(form.error);
    }
  });
</script>

<Card.Root class="mx-auto max-w-sm">
  <Card.Header>
    <Card.Title class="text-2xl">Register</Card.Title>
    <Card.Description>Create an account</Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="POST" action="?/register" use:enhance class="grid gap-4">
      <div class="grid gap-2">
        <Label for="username">Username</Label>
        <Input id="username" name="username" type="username" placeholder="Your username" required />
      </div>
      <div class="grid gap-2">
        <Label for="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Your password" required />
      </div>
      <Button type="submit" class="w-full">Register</Button>
    </form>
    <div class="mt-4 text-center text-sm">
      Already have an account?
      <a href="/log-in" class="underline"> Log in </a>
    </div>
  </Card.Content>
</Card.Root>
