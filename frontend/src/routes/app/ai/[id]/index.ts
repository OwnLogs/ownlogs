import type { AIConfig, BuildingMessage, Message } from '$lib/types';
import { Ollama } from 'ollama/browser';
import Context from '$lib/assets/ai/context.md?raw';
import { env } from '$env/dynamic/public';

const ollama = new Ollama({ host: env.PUBLIC_OLLAMA_URL });

interface MessageForModel {
  role: Message['role'];
  content: Message['content'];
}

export const DEFAULT_CONFIG: AIConfig = {
  model: 'llama3.2:3b'
};

export async function getModels() {
  return await ollama.list();
}

export async function init() {
  const models = await getModels();
  if (!models.models.map((m) => m.name).includes(DEFAULT_CONFIG.model)) {
    return ollama.pull({ model: DEFAULT_CONFIG.model, stream: true });
  }
}

export async function ask(messages: BuildingMessage[]) {
  // First message sent to the model
  const contextMessage: MessageForModel = {
    role: 'system',
    content: Context
  };
  // Adds the system prompt with project context. The slice is here because on the page, we create an empty message to display a loading state but the AI does not need it.
  const messagesForModel: MessageForModel[] = [contextMessage, ...messages]
    .slice(0, -1)
    .map((m) => ({
      role: m.role,
      content: m.content
    }));
  // TODO: Fix the dumb ass AI not being able to recall the first message as context
  const completion = await ollama.chat({
    model: DEFAULT_CONFIG.model,
    stream: true,
    messages: messagesForModel,
    options: {
      num_ctx: 4096
    }
  });
  return completion;
}
