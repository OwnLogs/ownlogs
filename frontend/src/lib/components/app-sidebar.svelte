<script lang="ts">
  import NavMain from '$lib/components/nav-main.svelte';
  import NavUser from '$lib/components/nav-user.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { ChartArea, Server as ServerIcon, Search, Database, ListCollapse } from 'lucide-svelte';
  import { type Server } from '@shared/types';
  import { mode } from 'mode-watcher';
  import { PERMISSIONS } from '@shared/roles';

  let { ref = $bindable(null), user, servers, ...restProps } = $props();

  const data = {
    navMain: [
      {
        title: 'Logs',
        url: '/app/logs',
        icon: ChartArea,
        permissions: [PERMISSIONS.READ_LOG],
        items: [
          {
            title: 'Overview',
            url: '/app/logs',
            permissions: [PERMISSIONS.READ_LOG],
            icon: ChartArea
          },
          {
            title: 'Details',
            url: '/app/logs/details',
            permissions: [PERMISSIONS.READ_LOG],
            icon: ListCollapse
          },
          {
            title: 'Querying',
            url: '/app/logs/querying',
            permissions: [PERMISSIONS.READ_LOG],
            icon: Database
          },
          {
            title: 'Search',
            url: '/app/logs/search',
            permissions: [PERMISSIONS.READ_LOG],
            icon: Search
          }
        ]
      },
      {
        title: 'Servers',
        icon: ServerIcon,
        url: '/app/servers',
        permissions: [PERMISSIONS.READ_SERVER],
        items: servers.map((server: Server) => ({
          title: server.name,
          url: `/app/servers/${server.id}`,
          permissions: [PERMISSIONS.READ_SERVER]
        }))
      }
    ]
  };
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg">
          {#snippet child({ props })}
            <a href="/app/logs" {...props}>
              {#if $mode === 'dark'}
                <img src="/logos/Dark.svg" class="size-8 rounded-md" alt="Logify logo" />
              {:else}
                <img src="/logos/Light.svg" class="size-8 rounded-md" alt="Logify logo" />
              {/if}
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Logify</span>
              </div>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain {user} items={data.navMain} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser {user} />
  </Sidebar.Footer>
</Sidebar.Root>
