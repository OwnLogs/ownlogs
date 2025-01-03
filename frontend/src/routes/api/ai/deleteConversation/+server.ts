import type { RequestHandler } from './$types';
import { deleteConversation } from '$lib/server/db/ai';
import { json } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ request, locals }) => {
  const {
    idConversation
  }: {
    idConversation: number;
  } = await request.json();

  const { user } = locals;
  if (!user) {
    return json({ success: false });
  }
  const userId = user.id;

  try {
    await deleteConversation(idConversation, userId);
    return json({ success: true });
  } catch (e) {
    if (e instanceof Error) {
      return json({ success: false, message: e.message });
    } else {
      return json({ success: false });
    }
  }
};
