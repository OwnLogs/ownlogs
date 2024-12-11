import { getConversation } from '$lib/server/db/ai';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
  const idConversation = params.id;
  try {
    const conversation = await getConversation(parseInt(idConversation));
    return { conversation };
  } catch (_err) {
    throw error(404, 'Conversation not found');
  }
}) satisfies PageServerLoad;
