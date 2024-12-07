import type { PageServerLoad } from './$types';
import { getDashboards } from '$lib/server/db/dashboard';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals: { user }}) => {
  if(!user) throw error(401, 'Unauthorized');
  const dashboards = await getDashboards(user?.id);
  return { dashboards };
}) satisfies PageServerLoad;
