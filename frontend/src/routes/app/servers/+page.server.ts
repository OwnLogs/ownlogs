import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
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

    const newServer = await createServer(form.data);

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

    return {
      form,
      serverId: newServer.insertId
    };
  }
};
