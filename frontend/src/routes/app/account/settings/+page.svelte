<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { toast } from 'svelte-sonner';
  import { pageMetadata } from '$lib/stores';
  import { enhance } from '$app/forms';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import * as Tabs from '$lib/components/ui/tabs/index.js';

  pageMetadata.set({
    title: 'Settings',
    description: 'Your account settings.',
    breadcrumbs: [{ name: 'Account' }, { name: 'Settings' }]
  });

  const { data, form } = $props();
  let user = $state(data.user);
  let isUpdatingUsername: boolean = $state(false);
  let isUpdatingPassword: boolean = $state(false);
  let usernameInputValue: string = $state(user?.username || '');
  let currentPasswordInputValue: string = $state('');
  let newPasswordInputValue: string = $state('');
  let isCreatingGuestAccount: boolean = $state(false);

  $effect(() => {
    if (form?.success) {
      toast.success(form.message);
      switch (form.action) {
        case 'updateUsername':
          if (user) user.username = form.username as string;
          break;
        case 'updatePassword':
          currentPasswordInputValue = '';
          newPasswordInputValue = '';
          break;
      }
    } else if (form?.error) {
      toast.error(form.message);
    }
  });
</script>

<div class="mx-auto flex max-w-screen-md flex-col gap-4 p-4 md:gap-8 md:p-8">
  <Tabs.Root value="account">
    <!-- Panel selector -->
    <Tabs.List class="grid w-full grid-cols-2">
      <Tabs.Trigger value="account">Your Account Settings</Tabs.Trigger>
      <Tabs.Trigger value="guestAccounts">Guest Accounts</Tabs.Trigger>
    </Tabs.List>
    <!-- Account settings panel -->
    <Tabs.Content value="account">
      <Card.Root>
        <Card.Header>
          <Card.Title>Settings</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-8">
          <form
            action="?/updateUsername"
            method="POST"
            class="space-y-4"
            use:enhance={() => {
              isUpdatingUsername = true;
              return async ({ update }) => {
                isUpdatingUsername = false;
                update();
              };
            }}
          >
            <h3 class="text-lg font-medium">Account</h3>
            <div class="flex flex-col gap-1">
              <Label for="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Your username"
                bind:value={usernameInputValue}
              />
            </div>

            <Button
              class="mt-4"
              type="submit"
              color="primary"
              disabled={isUpdatingUsername || usernameInputValue === user?.username}
              loading={isUpdatingUsername}
            >
              Save
            </Button>
          </form>

          <Separator />

          <form
            action="?/updatePassword"
            method="POST"
            class="space-y-4"
            use:enhance={() => {
              isUpdatingPassword = true;
              return async ({ update }) => {
                isUpdatingPassword = false;
                update();
              };
            }}
          >
            <h3 class="text-lg font-medium">Password</h3>
            <div class="flex flex-col gap-1">
              <Label for="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Your current password"
                bind:value={currentPasswordInputValue}
              />
            </div>

            <div class="flex flex-col gap-1">
              <Label for="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Your new password"
                bind:value={newPasswordInputValue}
              />
            </div>

            <Button
              class="mt-4"
              type="submit"
              color="primary"
              disabled={isUpdatingPassword ||
                newPasswordInputValue === '' ||
                currentPasswordInputValue === ''}
              loading={isUpdatingPassword}
            >
              Update
            </Button>
          </form>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>
    <!-- Create guest accounts panel -->
    <Tabs.Content value="guestAccounts">
      <Card.Root>
        <Card.Header>
          <Card.Title>Create an account</Card.Title>
          <Card.Description
            >Enter a username and password below to create a guest account</Card.Description
          >
        </Card.Header>
        <Card.Content class="space-y-8">
          <div class="grid gap-6">
            <form
              method="POST"
              action="?/createGuestAccount"
              use:enhance={() => {
                isCreatingGuestAccount = true;
                return async ({ update }) => {
                  isCreatingGuestAccount = false;
                  update();
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
                  <Label class="sr-only" for="email">Password</Label>
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
                <Button
                  type="submit"
                  loading={isCreatingGuestAccount}
                  disabled={isCreatingGuestAccount}>Create</Button
                >
              </div>
            </form>
          </div>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>
</div>
