<script lang="ts">
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import { page } from '$app/stores';
  import { urlStartsWith } from '$lib/utils';
  import { hasAtLeastOnePermission } from '@shared/roles';
  import type { User } from '$lib/server/db/user';
  import { cn } from '$lib/utils';

  let {
    items,
    user
  }: {
    items: {
      title: string;
      url: string;
      permissions: string[];
      // This should be `Component` after lucide-svelte updates types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon: any;
      items?: {
        title: string;
        url: string;
        permissions: string[];
        icon: any;
      }[];
    }[];
    user: User;
  } = $props();
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each items as mainItem (mainItem.title)}
      {#if hasAtLeastOnePermission(user.role, ...mainItem.permissions)}
        <Collapsible.Root open={urlStartsWith($page.url.pathname, mainItem.url)}>
          {#snippet child({ props })}
            <Sidebar.MenuItem {...props}>
              <Sidebar.MenuButton>
                {#snippet tooltipContent()}
                  {mainItem.title}
                {/snippet}
                {#snippet child({ props })}
                  <a href={mainItem.url} {...props}>
                    <mainItem.icon />
                    <span>{mainItem.title}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
              {#if mainItem.items?.length && mainItem.items.some( (item) => hasAtLeastOnePermission(user.role, ...item.permissions) )}
                <Collapsible.Trigger>
                  {#snippet child({ props })}
                    <Sidebar.MenuAction {...props} class="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span class="sr-only">Toggle</span>
                    </Sidebar.MenuAction>
                  {/snippet}
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <Sidebar.MenuSub>
                    {#each mainItem.items as subItem (subItem.title)}
                      {@const isActive = $page.url.pathname === subItem.url}
                      <Sidebar.MenuSubItem>
                        <Sidebar.MenuSubButton href={subItem.url}>
                          {#if subItem.icon}
                            <subItem.icon />
                          {/if}
                          <span
                            class={cn(
                              subItem.icon
                                ? isActive
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                                : 'text-primary'
                            )}>{subItem.title}</span
                          >
                        </Sidebar.MenuSubButton>
                      </Sidebar.MenuSubItem>
                    {/each}
                  </Sidebar.MenuSub>
                </Collapsible.Content>
              {/if}
            </Sidebar.MenuItem>
          {/snippet}
        </Collapsible.Root>
      {/if}
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
