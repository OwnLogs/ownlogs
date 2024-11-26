import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import { createServer } from '$lib/server/db/server';
import { API_URL } from '$lib/constants';

export const load: PageServerLoad = async () => {
  return {
    newServerForm: await superValidate(zod(formSchema))
  };
};

export const actions: Actions = {
  createServer: async (event) => {
    const form = await superValidate(event, zod(formSchema));
    if (!form.valid) {
      return fail(400, {
        form
      });
    }

    if (!event.locals?.user?.id) {
      return fail(401, {
        error: true,
        message: 'You must be logged in to create a server'
      });
    }
    const newServer = await createServer(event.locals.user.id, form.data);

    // Notify the backend that a new server was created to update the cache
    const res = await fetch(API_URL + '/createdServer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId: newServer.insertId })
    });

    if (!res.ok) {
      return fail(500, {
        error: true,
        message: 'Failed to create server',
        form
      });
    }

    throw redirect(303, `/app/servers/${newServer.insertId}`);
  }
};
