import { getConversation } from '$lib/server/db/ai';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
  const idConversation = params.id;
  try {
    const conversation = await getConversation(parseInt(idConversation));
    return { conversation };
  } catch (err) {
    if(err instanceof Error) {
      throw error(500, err.message);
    }else {
      throw error(404, 'Conversation not found');
    }
  }
}) satisfies PageServerLoad;
