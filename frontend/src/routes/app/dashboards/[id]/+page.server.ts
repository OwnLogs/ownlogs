import { getDashboard } from '$lib/server/db/dashboard';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

export const load = (async ({
  params: { id: idDashboard },
  locals: {
    user
  }
}) => {
  if(!user) {
    throw error(401, 'Unauthorized');
  }
  
  try {
    const dashboard = await getDashboard(idDashboard, user?.id);
    return { dashboard };
  } catch (e) {
    if (e instanceof Error) {
      throw error(404, e.message);
    } else {
      throw error(500, 'Dashboard not found');
    }
  }
}) satisfies PageServerLoad;
