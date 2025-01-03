<script lang="ts">
  import type { Conversation } from '$lib/server/db/ai.js';
  import { pageMetadata } from '$lib/stores';
  import { init, ask } from './';
  import { onMount } from 'svelte';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Brain, Send, ChevronLeft, Settings, Trash2, Pencil } from 'lucide-svelte';
  import MessageComponent from './message.svelte';
  import { fade } from 'svelte/transition';
  import AIInput from './input.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import Title from './title.svelte';
  import { toast } from '$lib/stores';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { buttonVariants } from '$lib/components/ui/button/index.js';
  import { hasAtLeastOnePermission, hasPermission, PERMISSIONS } from '@shared/roles';
  import type { BuildingMessage } from '$lib/types';

  const { data } = $props();
  const user = data.user;

  let conversation = $state<Conversation>(data.conversation);
  // svelte-ignore state_referenced_locally
  let messages: BuildingMessage[] = $state(conversation.messages);
  let message: string = $state('');
  let pullProgress: { completed: number; total: number } | null = $state(null);
  let isAIWriting = $state<boolean>(false);
  let messagesContainer: HTMLElement | null = $state(null);
  let settingsModalVisible = $state<boolean>(false);
  let isSavingConversation = $state<boolean>(false);
  let deleteConversationConfirmVisible = $state<boolean>(false);
  let isDeletingConversation = $state<boolean>(false);
  // svelte-ignore state_referenced_locally
  let editedConversation = $state<Conversation>(conversation);

  // Set page metadata and updates the title when it changes
  $effect(() => {
    pageMetadata.set({
      title: conversation.title,
      description: 'Chat with OwnLogs AI',
      breadcrumbs: [{ name: 'AI', url: '/app/ai' }, { name: conversation.title }]
    });
  });

  async function saveLatestMessage() {
    if (messages.length === 0) return;
    const { content, error, role } = messages[messages.length - 1];
    const res = await fetch('/api/ai/createMessage', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, role, error, idConversation: conversation.id })
    });
    if (!res.ok) {
      toast.error('Error saving message');
    }
  }

  function scrollToBottom() {
    if (!messagesContainer) return;
    messagesContainer.scroll({
      top: messagesContainer.scrollHeight + 100,
      behavior: 'instant'
    });
  }

  async function askQuestion(e: SubmitEvent) {
    e.preventDefault();
    if (!message || isAIWriting || !messagesContainer) return;
    isAIWriting = true;
    messages.push({ content: message, role: 'user', error: null });
    message = '';
    saveLatestMessage();
    scrollToBottom();
    try {
      messages.push({ content: '', role: 'assistant', error: null });
      const completion = await ask(messages);
      let latestAIMessage = messages.at(-1);
      if (!latestAIMessage) return;
      scrollToBottom();
      for await (const chunk of completion) {
        const currentScroll = messagesContainer.scrollTop;
        const containerHeight = messagesContainer.scrollHeight - messagesContainer.clientHeight;
        const scrollBottomOffset = containerHeight - currentScroll;
        const triggerHeight = 30;
        if (scrollBottomOffset < triggerHeight) {
          scrollToBottom();
        }
        const hasError = chunk?.done_reason && chunk.done_reason !== 'stop';
        if (hasError) {
          latestAIMessage.error = 'Error in AI response';
          return;
        }
        latestAIMessage.content += chunk.message.content;
      }
    } catch (e) {
      if(messages.at(-1)?.role === 'assistant') {
        // Asked the AI and the error was thrown after inserting it's message so we replace it with an error
        messages.pop();
      }
      if(e instanceof Error) {
        messages.push({ content: 'Error in AI response', role: 'assistant', error: e.message });
      }else {
        messages.push({ content: 'Error in AI response', role: 'assistant', error: 'Error in AI response' });
      }
      scrollToBottom();
    }
    saveLatestMessage();
    isAIWriting = false;
  }

  async function saveConversation() {
    isSavingConversation = true;
    editedConversation.title = editedConversation.title.trim();
    const res = await fetch('/api/ai/saveConversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation: editedConversation })
    });
    isSavingConversation = false;
    if (!res.ok) {
      toast.error('Error saving conversation');
    } else {
      toast.success('Conversation saved');
      deleteConversationConfirmVisible = false;
      conversation = editedConversation;
    }
  }

  async function deleteConversation() {
    isDeletingConversation = true;
    const res = await fetch('/api/ai/deleteConversation', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idConversation: conversation.id })
    });

    isDeletingConversation = false;
    if (!res.ok) {
      toast.error('Error deleting conversation');
    } else {
      const data = await res.json();
      deleteConversationConfirmVisible = false;
      if (data.success) {
        toast.success('Conversation deleted');
        window.location.href = '/app/ai';
      } else {
        toast.error(data.message);
      }
    }
  }

  onMount(async () => {
    if (!messagesContainer) return;
    scrollToBottom();
    const initRes = await init();
    if (!initRes) return;
    for await (const res of initRes) {
      if (res.completed && res.total)
        pullProgress = {
          completed: res.completed,
          total: res.total
        };
    }
    pullProgress = null;
  });
</script>

<!-- When loading the page for the first time, pull the model and display loading screen -->
{#if pullProgress}
  <div class="absolute inset-0 z-10 flex flex-row items-center justify-center bg-primary/50">
    <Card.Root class="w-full max-w-screen-sm">
      <Card.Header>
        <Card.Title class="flex flex-row items-center gap-2">
          <Brain class="size-6" />
          Setting up your personal AI ...
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <Progress value={(pullProgress.completed / pullProgress.total) * 100} />
        <p class="mt-2 text-center">
          {((pullProgress.completed / pullProgress.total) * 100).toFixed(2)}%
        </p>
      </Card.Content>
    </Card.Root>
  </div>
{/if}

<!-- Edit conversation modal -->
<Dialog.Root bind:open={settingsModalVisible}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Are you sure absolutely suEdit conversation</Dialog.Title>
    </Dialog.Header>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <Label for="conversationName">Conversation name</Label>
        <Input id="conversationName" bind:value={editedConversation.title} />
      </div>

      <div class="flex flex-row items-center justify-end gap-2">
        <Button
          variant="outline"
          onclick={() => {
            settingsModalVisible = false;
            editedConversation = conversation;
          }}>Cancel</Button
        >
        <Button
          loading={isSavingConversation}
          disabled={isSavingConversation}
          onclick={saveConversation}>Save</Button
        >
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>

<!-- Delete conversation confirm modal -->
<AlertDialog.Root bind:open={deleteConversationConfirmVisible}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This action cannot be undone. This will permanently delete this conversation and all of it's
        messages.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <Button
        onclick={deleteConversation}
        loading={isDeletingConversation}
        disabled={isDeletingConversation}>Continue</Button
      >
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<div class="flex h-full w-full grow flex-col">
  <div class="flex shrink-0 flex-row items-center justify-between gap-4 border-y border-border p-2">
    <Button href="/app/ai" variant="outline" class="size-10 p-0 shrink-0">
      <ChevronLeft class="size-8" />
    </Button>
    <Title
      bind:conversation
      {saveConversation}
      canEdit={hasPermission(user?.role, PERMISSIONS.UPDATE_AI_CONVERSATION)}
    />
    {#if hasAtLeastOnePermission(user?.role, PERMISSIONS.UPDATE_AI_CONVERSATION, PERMISSIONS.DELETE_AI_CONVERSATION)}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          class={buttonVariants({ variant: 'outline', class: 'ml-auto size-10 p-0 shrink-0' })}
        >
          <Settings class="size-8" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.GroupHeading>Settings</DropdownMenu.GroupHeading>
            <DropdownMenu.Separator />
            {#if hasPermission(user?.role, PERMISSIONS.UPDATE_AI_CONVERSATION)}
              <DropdownMenu.Item onclick={() => (settingsModalVisible = true)}>
                <Pencil class="size-4" />
                Edit
              </DropdownMenu.Item>
            {/if}
            {#if hasPermission(user?.role, PERMISSIONS.DELETE_AI_CONVERSATION)}
              <DropdownMenu.Item
                variant="destructive"
                onclick={() => {
                  deleteConversationConfirmVisible = true;
                }}
              >
                <Trash2 class="size-4" />
                Delete
              </DropdownMenu.Item>
            {/if}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {/if}
  </div>
  <div
    class="no-scrollbar flex h-full grow flex-col gap-2 overflow-y-auto p-2 pb-2"
    bind:this={messagesContainer}
  >
    {#each messages as m}
      <div transition:fade={{ duration: 300 }}>
        <MessageComponent message={m} />
      </div>
    {:else}
    <div class="grow flex flex-col items-center justify-center text-3xl font-bold" out:fade>
      What can I help with?
    </div>
    {/each}
  </div>
  <form onsubmit={askQuestion} class="flex shrink-0 flex-row gap-2 bg-background p-2">
    <AIInput bind:value={message} onsubmit={askQuestion} placeholder="Message OwnLogs's AI" />
    <Button type="submit" class="h-full" disabled={isAIWriting}>
      <Send class="size-full" />
    </Button>
  </form>
</div>
