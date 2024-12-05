import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { updateDashboard } from '$lib/server/db/dashboard';

export const PUT: RequestHandler = async ({ request, locals: { user } }) => {
  const { dashboard } = await request.json();
  if (!user) {
    return json({ error: true, message: 'Unauthorized' });
  }
  try {
    const newDashboard = await updateDashboard(dashboard, user.id);
    return json({
      success: true,
      message: 'Successfully updated dashboard',
      dashboard: newDashboard
    });
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return json({ error: true, message: error.message });
    } else {
      return json({
        error: true,
        message: 'An unexpected error occurred!'
      });
    }
  }
};
