import { getDashboard } from '$lib/server/db/dashboard';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

export const load = (async ({
  params: { id: idDashboard },
  locals: {
    user: { id: userId }
  }
}) => {
  try {
    const dashboard = await getDashboard(idDashboard, userId);
    return { dashboard };
  } catch (e) {
    if (e instanceof Error) {
      throw error(404, e.message);
    } else {
      throw error(500, 'Dashboard not found');
    }
  }
}) satisfies PageServerLoad;
