<script lang="ts">
  import type { Conversation } from '$lib/server/db/ai';
  import { Input } from '$lib/components/ui/input/index.js';

  let {
    conversation = $bindable(),
    saveConversation,
    canEdit = true
  }: { conversation: Conversation; saveConversation: () => void; canEdit: boolean } = $props();

  let isEditing = $state<boolean>(false);
  let input = $state<HTMLInputElement | null>(null);

  function onKeyUp(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      saveConversation();
    }
  }

  // Focus the input when editing
  $effect(() => {
    isEditing && input?.focus();
  });
</script>

{#if isEditing || (conversation.title === '' && canEdit)}
  <Input
    placeholder="Conversation name"
    id="conversationName"
    bind:value={conversation.title}
    bind:ref={input}
    onkeyup={onKeyUp}
    onblur={() => {
      isEditing = false;
      saveConversation();
    }}
  />
{:else}
  <h1 class="w-full text-2xl font-bold" ondblclick={() => (isEditing = true)}>
    {conversation.title}
  </h1>
{/if}
