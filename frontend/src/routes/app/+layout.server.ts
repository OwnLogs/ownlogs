import type { LayoutServerLoad } from './$types';
import { getAllServers } from '$lib/server/db/server';

export const load = (async () => {
  const servers = await getAllServers();
  return { servers };
}) satisfies LayoutServerLoad;
