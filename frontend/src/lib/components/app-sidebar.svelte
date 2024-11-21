<script lang="ts">
  import NavMain from '$lib/components/nav-main.svelte';
  import NavUser from '$lib/components/nav-user.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import Command from 'lucide-svelte/icons/command';
  import { Settings2 } from 'lucide-svelte';

  let { ref = $bindable(null), user, ...restProps } = $props();

  const data = {
    navMain: [
      {
        title: 'Logs',
        url: '/app',
        icon: Settings2,
        items: [
          {
            title: 'Overview',
            url: '/app'
          },
          {
            title: 'All',
            url: '/app/logs'
          }
        ]
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
            <a href="/app" {...props}>
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
