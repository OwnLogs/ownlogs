<script lang="ts">
  import Chat from '$lib/ai/Chat.svelte';
  import type { Conversation } from '$lib/server/db/ai.js';
  import { pageMetadata } from '$lib/stores';

  const { data } = $props();
  const user = data.user;

  let conversation = $state<Conversation>(data.conversation);

  $effect(() => {
    pageMetadata.set({
      title: conversation.title,
      description: 'Chat with OwnLogs AI',
      breadcrumbs: [{ name: 'AI', url: '/app/ai' }, { name: conversation.title }]
    });
  })
</script>

<Chat bind:conversation {user} />
