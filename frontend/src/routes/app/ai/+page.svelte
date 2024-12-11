<script>
  import * as Card from '$lib/components/ui/card';
  import { hasPermission, PERMISSIONS } from '@shared/roles';
  import Button from '$lib/components/ui/button/button.svelte';
  import { pageMetadata } from '$lib/stores';
  import { Plus } from 'lucide-svelte';

  pageMetadata.set({
    title: 'AI',
    description: 'Manage your AI',
    breadcrumbs: [{ name: 'AI' }]
  });

  const { data } = $props();
  const { conversations, user } = data;
</script>

<div class="flex w-full flex-col">
  <div class="p-4 sm:px-6 sm:py-0">
    <Card.Root>
      <Card.Header>
        <Card.Title>Your conversations</Card.Title>
        <Card.Description
          >Here you can gat an at-a-glance overview of your conversations with OwnLogs's AI
          assistant.</Card.Description
        >
      </Card.Header>
      <Card.Content class="space-y-8">
        {#if hasPermission(user?.role, PERMISSIONS.CREATE_AI_CONVERSATION)}
          <form action="?/createConversation" method="post">
            <Button type="submit">
              <Plus class="size-6" />
              Create a conversation
            </Button>
          </form>
        {/if}

        {#if hasPermission(user?.role, PERMISSIONS.READ_AI_CONVERSATION)}
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            {#each conversations as conversation}
              <a href="/app/ai/{conversation.id}">
                <Card.Root>
                  <Card.Header class="p-4">
                    <Card.Title>{conversation.title}</Card.Title>
                  </Card.Header>
                </Card.Root>
              </a>
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
</div>
