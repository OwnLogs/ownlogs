import type { PageServerLoad, Actions } from './$types';
import db from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
  runQuery: async ({ request }) => {
    const formData = Object.fromEntries(await request.formData());
    const { query } = formData as { query: string };

    try {
      const [rows] = await db.execute(query);

      return {
        success: true,
        message: 'Query ran successfully',
        rows
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return fail(500, { error: true, message: error.message });
      } else {
        return fail(500, { error: true, message: 'An unexpected error occurred!' });
      }
    }
  }
};
