<script lang="ts">
  import type { User } from '$lib/server/db/user.js';
  import { toast } from 'svelte-sonner';
  import { pageMetadata } from '$lib/stores';
  import { enhance } from '$app/forms';
  import { buttonVariants } from '$lib/components/ui/button/index.js';
  import { MediaQuery } from 'runed';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import * as Card from '$lib/components/ui/card';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as Sheet from '$lib/components/ui/sheet/index.js';
  import * as Drawer from '$lib/components/ui/drawer/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { hasPermission, hasAtLeastOnePermission, PERMISSIONS, ROLES } from '@shared/roles';
  import { Ellipsis, Pencil, Trash2 } from 'lucide-svelte';

  pageMetadata.set({
    title: 'Settings',
    description: 'Your account settings.',
    breadcrumbs: [{ name: 'Account' }, { name: 'Settings' }]
  });

  const { data, form } = $props();
  const isDesktop = new MediaQuery('(min-width: 768px)');
  let allUsers = $state(data.allUsers);
  let user = $state(data.user);
  let isUpdatingUserDetails: boolean = $state(false);
  let isUpdatingPassword: boolean = $state(false);
  let usernameInputValue: string = $state(user?.username || '');
  let emailInputValue: string = $state(user?.email || '');
  let currentPasswordInputValue: string = $state('');
  let newPasswordInputValue: string = $state('');
  let isCreatingGuestAccount: boolean = $state(false);
  let deleteAccountModalConfirm: { visible: boolean; user: User | null } = $state({
    visible: false,
    user: null
  });
  let isDeleingUserAccount: boolean = $state(false);
  let editUserModal: { visible: boolean; user: User | null } = $state({
    visible: false,
    user: null
  });
  let isSavingUserAccount: boolean = $state(false);

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
        case 'createGuestAccount':
          allUsers.push(form.newUser as User);
          break;
        case 'deleteUserAccount':
          allUsers.splice(
            allUsers.findIndex((u) => u.id === deleteAccountModalConfirm?.user?.id),
            1
          );
          deleteAccountModalConfirm = { visible: false, user: null };
          break;
        case 'editUserAccount':
          if (editUserModal?.user) {
            const userIndex = allUsers.findIndex((u) => u.id === editUserModal.user?.id);
            if (userIndex === -1) return;
            if (!form.updatedUser) return;
            allUsers[userIndex].username = form.updatedUser?.username;
            allUsers[userIndex].role = form.updatedUser?.role as User['role'];
            editUserModal = { visible: false, user: null };
          }
          break;
      }
    } else if (form?.error) {
      toast.error(form.message);
    }

    // Reset form state to prevent infinite reactivity due to updating parent variables in here
    if (form?.success) form.success = false;
    if (form?.error) form.error = false;
  });
</script>

<!-- Confirm user account deletion modal -->
{#if hasPermission(user?.role, PERMISSIONS.DELETE_OTHER_ACCOUNTS)}
  <AlertDialog.Root bind:open={deleteAccountModalConfirm.visible}>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Confirm account deletion</AlertDialog.Title>
        <AlertDialog.Description>
          This action cannot be undone. This will permanently delete {deleteAccountModalConfirm.user
            ?.username}'s account.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <form
          action="?/deleteUserAccount"
          class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
          method="POST"
          use:enhance={(e) => {
            e.formData.append('userId', deleteAccountModalConfirm.user?.id?.toString() || '');
            isDeleingUserAccount = true;
            return async ({ update }) => {
              isDeleingUserAccount = false;
              update({ reset: false });
            };
          }}
        >
          <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
          <Button disabled={isDeleingUserAccount} loading={isDeleingUserAccount} type="submit"
            >Continue</Button
          >
        </form>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/if}

<!-- Edit user modal -->
{#if editUserModal?.user && hasPermission(user?.role, PERMISSIONS.UPDATE_OTHER_ACCOUNTS)}
  {#if isDesktop.matches}
    <!-- On desktop -->
    <Sheet.Root bind:open={editUserModal.visible}>
      <Sheet.Content class="w-full sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>Edit user</Sheet.Title>
        </Sheet.Header>

        <form
          action="?/editUserAccount"
          method="POST"
          class="space-y-4"
          use:enhance={(e) => {
            e.formData.append('userId', editUserModal.user?.id?.toString() || '');
            isSavingUserAccount = true;
            return async ({ update }) => {
              isSavingUserAccount = false;
              update({ reset: false });
            };
          }}
        >
          <div class="flex flex-col gap-1">
            <Label for="username">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="E-mail"
              value={editUserModal.user.email}
            />
          </div>

          <div class="flex flex-col gap-1">
            <Label for="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              value={editUserModal.user.username}
            />
          </div>

          <div class="flex flex-col gap-1">
            <Label for="role">Role</Label>
            <Select.Root type="single" name="role" value={editUserModal.user.role}>
              <Select.Trigger>{editUserModal.user.role}</Select.Trigger>
              <Select.Content>
                <Select.Item value="guest">Guest</Select.Item>
                <Select.Item value="admin">Admin</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>

          <Button type="submit" disabled={isSavingUserAccount} loading={isSavingUserAccount}
            >Save</Button
          >
        </form>
      </Sheet.Content>
    </Sheet.Root>
  {:else}
    <!-- On mobile -->
    <Drawer.Root bind:open={editUserModal.visible}>
      <Drawer.Content>
        <form
          action="?/editUserAccount"
          method="POST"
          class="mx-auto w-full max-w-screen-md"
          use:enhance={(e) => {
            e.formData.append('userId', editUserModal.user?.id?.toString() || '');
            isSavingUserAccount = true;
            return async ({ update }) => {
              isSavingUserAccount = false;
              update({ reset: false });
            };
          }}
        >
          <Drawer.Header>
            <Drawer.Title>Edit user</Drawer.Title>
          </Drawer.Header>

          <div class="space-y-4 px-4">
            <div class="flex flex-col gap-1">
              <Label for="username">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="E-mail"
                value={editUserModal.user.email}
              />
            </div>

            <div class="flex flex-col gap-1">
              <Label for="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Username"
                value={editUserModal.user.username}
              />
            </div>

            <div class="flex flex-col gap-1">
              <Label for="role">Role</Label>
              <Select.Root type="single" name="role" value={editUserModal.user.role}>
                <Select.Trigger>{editUserModal.user.role}</Select.Trigger>
                <Select.Content>
                  <Select.Item value="guest">Guest</Select.Item>
                  <Select.Item value="admin">Admin</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
          </div>

          <Drawer.Footer>
            <Button type="submit" disabled={isSavingUserAccount} loading={isSavingUserAccount}
              >Save</Button
            >
            <Drawer.Close type="button" class={buttonVariants({ variant: 'outline' })}
              >Close</Drawer.Close
            >
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer.Root>
  {/if}
{/if}

<div class="mx-auto flex w-full max-w-screen-md flex-col gap-4 p-4 md:gap-8 md:p-8">
  <Tabs.Root value="account">
    <!-- Panel selector -->
    <Tabs.List class="grid w-full grid-cols-2">
      <Tabs.Trigger value="account">Your Account Settings</Tabs.Trigger>
      {#if hasAtLeastOnePermission(user?.role, PERMISSIONS.READ_OTHER_ACCOUNTS, PERMISSIONS.CREATE_OTHER_ACCOUNTS, PERMISSIONS.DELETE_OTHER_ACCOUNTS, PERMISSIONS.UPDATE_OTHER_ACCOUNTS)}
        <Tabs.Trigger value="guestAccounts">Guest Accounts</Tabs.Trigger>
      {/if}
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
              isUpdatingUserDetails = true;
              return async ({ update }) => {
                isUpdatingUserDetails = false;
                update({ reset: false });
              };
            }}
          >
            <h3 class="text-lg font-medium">Account</h3>
            <div class="flex flex-col gap-1">
              <Label for="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Your e-mail"
                bind:value={emailInputValue}
              />
            </div>

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
              disabled={isUpdatingUserDetails ||
                usernameInputValue === user?.username ||
                emailInputValue === user?.email}
              loading={isUpdatingUserDetails}
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
                update({ reset: false });
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
    <!-- Guest accounts panel -->
    {#if hasAtLeastOnePermission(user?.role, PERMISSIONS.READ_OTHER_ACCOUNTS, PERMISSIONS.CREATE_OTHER_ACCOUNTS, PERMISSIONS.DELETE_OTHER_ACCOUNTS, PERMISSIONS.UPDATE_OTHER_ACCOUNTS)}
      <Tabs.Content value="guestAccounts">
        <!-- Create a guest account -->
        {#if hasPermission(user?.role, PERMISSIONS.CREATE_OTHER_ACCOUNTS)}
          <Card.Root>
            <Card.Header>
              <Card.Title>Create an account</Card.Title>
              <Card.Description
                >Enter an e-mail, username and password below to create a guest account</Card.Description
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
                      update({ reset: false });
                    };
                  }}
                >
                  <div class="grid gap-4">
                    <div class="grid gap-1">
                      <Label class="sr-only" for="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        placeholder="E-mail"
                        type="text"
                        autocapitalize="none"
                        autocomplete="email"
                        autocorrect="off"
                      />
                    </div>
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
                    <div class="grid gap-1">
                      <Label class="sr-only" for="role">Role</Label>
                      <Select.Root type="single" name="role">
                        <Select.Trigger>Role</Select.Trigger>
                        <Select.Content>
                          <Select.Item value="guest">Guest</Select.Item>
                          <Select.Item value="admin">Admin</Select.Item>
                        </Select.Content>
                      </Select.Root>
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
        {/if}

        <!-- Guests accounts managent -->
        {#if hasPermission(user?.role, PERMISSIONS.READ_OTHER_ACCOUNTS)}
          <Card.Root class="mt-8">
            <Card.Header>
              <Card.Title>Guest accounts</Card.Title>
              <Card.Description
                >All of the accounts that have access to the Logify service dashboard.</Card.Description
              >
            </Card.Header>
            <Card.Content class="space-y-8">
              <div class="flex flex-col gap-4">
                {#if allUsers.length === 0}
                  <p class="font-medium text-muted-foreground">
                    No guest accounts have been created yet.
                  </p>
                {:else}
                  <div class="grid gap-4 md:grid-cols-2">
                    {#each allUsers as u}
                      <!-- If the displayed user is the owner -->
                      <Card.Root>
                        <Card.Header class="p-6">
                          <div class="flex flex-row items-center justify-between">
                            <div class="flex flex-col gap-2">
                              <Card.Title
                                >{u.username} {user?.id === u.id ? '(You)' : ''}</Card.Title
                              >
                              <Card.Description>{u.role}</Card.Description>
                            </div>
                            {#if u?.role !== ROLES.OWNER && hasAtLeastOnePermission(user?.role, PERMISSIONS.UPDATE_OTHER_ACCOUNTS, PERMISSIONS.DELETE_OTHER_ACCOUNTS)}
                              <DropdownMenu.Root>
                                <DropdownMenu.Trigger>
                                  <Ellipsis class="size-6 text-muted-foreground" />
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content>
                                  <DropdownMenu.Group>
                                    <DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
                                    <DropdownMenu.Separator />
                                    {#if hasPermission(user?.role, PERMISSIONS.UPDATE_OTHER_ACCOUNTS)}
                                      <DropdownMenu.Item
                                        onclick={() => {
                                          if (user) editUserModal = { visible: true, user: u };
                                        }}
                                      >
                                        <Pencil class="mr-2 size-4" />
                                        Edit
                                      </DropdownMenu.Item>
                                    {/if}
                                    {#if hasPermission(user?.role, PERMISSIONS.DELETE_OTHER_ACCOUNTS)}
                                      <DropdownMenu.Item
                                        onclick={() => {
                                          if (user)
                                            deleteAccountModalConfirm = { visible: true, user: u };
                                        }}
                                      >
                                        <Trash2 class="mr-2 size-4 text-red-600" />
                                        Delete
                                      </DropdownMenu.Item>
                                    {/if}
                                  </DropdownMenu.Group>
                                </DropdownMenu.Content>
                              </DropdownMenu.Root>
                            {/if}
                          </div>
                        </Card.Header>
                      </Card.Root>
                    {/each}
                  </div>
                {/if}
              </div>
            </Card.Content>
          </Card.Root>
        {/if}
      </Tabs.Content>
    {/if}
  </Tabs.Root>
</div>
