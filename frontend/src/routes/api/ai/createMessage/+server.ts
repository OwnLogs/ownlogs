import type { RequestHandler } from './$types';
import { type BuildingMessage, type Message } from '$lib/ai';
import { createMessage } from '$lib/server/db/ai';
import { json } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({ request }) => {
  const {
    content,
    error = null,
    role,
    idConversation
  }: {
    content: string;
    role: Message['role'];
    idConversation: number;
    error: string | null;
  } = await request.json();

  const message: BuildingMessage = { role, content, error };
  await createMessage(message, idConversation);

  return json({ success: true });
};
