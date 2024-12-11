<script lang="ts">
  import Chat from '$lib/ai/Chat.svelte';
  const { data } = $props();
  const { conversation, user } = data;
</script>

<Chat {conversation} {user} />
