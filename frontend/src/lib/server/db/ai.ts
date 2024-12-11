import type { BuildingMessage, Message } from '$lib/ai';
import DB from './';

export interface Conversation {
  id: number;
  userId: number;
  title: string;
  messages: Message[];
}

export async function getConversations(userId: number): Promise<Conversation[]> {
  const sql = `
  SELECT c.*
  FROM conversation c
  LEFT JOIN message m ON c.id = m.conversationId
  GROUP BY c.id
  ORDER BY MAX(m.sentAt) DESC;
  `;
  const [conversations] = await DB.query(sql, [userId]);
  Promise.all(
    (conversations as Conversation[]).map(async (conversation: Conversation) => {
      conversation.messages = await getMessages(conversation.id);
      return conversation;
    })
  );

  return conversations as Conversation[];
}

export async function updateConversation(data: Conversation): Promise<Conversation> {
  const sql = `
  UPDATE conversation
  SET title = ?, description = ?
  WHERE id = ?
  `;
  await DB.query(sql, [data.title, data.description ?? null, data.id]);
  return data;
}

export async function getConversation(idConversation: number): Promise<Conversation> {
  const sql = `
  SELECT
    *
  FROM conversation
  WHERE id = ?
  `;
  const [conversations] = await DB.query(sql, [idConversation]);
  if ((conversations as Conversation[]).length === 0) {
    throw new Error('Conversation not found');
  }
  const conversation = (conversations as Conversation[])[0] as Conversation;
  conversation.messages = await getMessages(conversation.id);
  return conversation;
}

async function deleteMessage(idMessage: number): Promise<void> {
  const sql = `
  DELETE FROM message
  WHERE id = ?
  `;
  await DB.query(sql, [idMessage]);
}

export async function deleteConversation(idConversation: number, userId: number): Promise<void> {
  const conversation = await getConversation(idConversation);
  if (conversation.userId !== userId) {
    throw new Error('User not authorized to delete this conversation');
  }

  Promise.all(conversation.messages.map((message) => deleteMessage(message.id)));

  const sql = `
  DELETE FROM conversation
  WHERE id = ?
  `;

  await DB.query(sql, [idConversation]);
}

export async function getMessages(idConversation: number): Promise<Message[]> {
  try {
    const sql = `
    SELECT
      content,
      role,
      id
    FROM message
    WHERE conversationId = ?
    `;
    const [messages] = await DB.query(sql, [idConversation]);
    return messages as Message[];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

export async function createConversation(data: Conversation): Promise<Conversation> {
  const sql = `
  INSERT INTO conversation (userId, title)
  VALUES (?, ?)
  `;
  const [result] = await DB.query(sql, [data.userId, data.title]);
  data.id = result.insertId;
  return data;
}

export async function createMessage(
  data: BuildingMessage,
  idConversation: Conversation['id']
): Promise<Message> {
  const sql = `
  INSERT INTO message (conversationId, content, role)
  VALUES (?, ?, ?)
  `;
  const [result] = await DB.query(sql, [idConversation, data.content, data.role]);
  const newMessage = { ...data, id: result.insertId };
  return newMessage;
}
