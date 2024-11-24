<script lang="ts">
  import NavMain from '$lib/components/nav-main.svelte';
  import NavUser from '$lib/components/nav-user.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { Command } from 'lucide-svelte';
  import { Settings2, Server as ServerIcon } from 'lucide-svelte';
  import { type Server } from '@shared/types';

  let { ref = $bindable(null), user, servers, ...restProps } = $props();

  const data = {
    navMain: [
      {
        title: 'Logs',
        url: '/app/logs',
        icon: Settings2,
        items: [
          {
            title: 'Overview',
            url: '/app/logs'
          },
          {
            title: 'Details',
            url: '/app/logs/details'
          }
        ]
      },
      {
        title: 'Servers',
        icon: ServerIcon,
        url: '/app/servers',
        items: servers.map((server: Server) => ({
          title: server.name,
          url: `/app/servers/${server.id}`
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
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <!-- TODO: Change this logo -->
                <Command class="size-4" />
              </div>
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
    <NavMain items={data.navMain} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser {user} />
  </Sidebar.Footer>
</Sidebar.Root>
