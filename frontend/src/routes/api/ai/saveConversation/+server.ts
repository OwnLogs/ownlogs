import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { updateConversation, type Conversation } from '$lib/server/db/ai';

export const POST: RequestHandler = async ({ request }) => {
  const { conversation }: { conversation: Conversation } = await request.json();

  await updateConversation(conversation);

  return json({ status: 'ok' });
};
