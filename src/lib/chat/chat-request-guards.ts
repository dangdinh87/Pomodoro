import {
  CHAT_MAX_ASSISTANT_MESSAGE_CHARS,
  CHAT_MAX_HISTORY_CHARS,
  CHAT_MAX_HISTORY_MESSAGES,
  CHAT_MAX_MESSAGE_CHARS,
} from '@/config/constants';

export interface UpstreamChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TextPart {
  type: 'text';
  text: string;
}

const isTextPart = (part: unknown): part is TextPart =>
  !!part &&
  typeof part === 'object' &&
  (part as { type?: unknown }).type === 'text' &&
  typeof (part as { text?: unknown }).text === 'string';

/**
 * Plain text of a client chat message: either a `content` string or the text
 * parts of an assistant-ui / AI SDK `parts` array. Anything else yields ''.
 */
export function getMessageText(message: unknown, separator = '\n'): string {
  if (!message || typeof message !== 'object') return '';
  const { content, parts } = message as { content?: unknown; parts?: unknown };
  if (typeof content === 'string') return content;
  if (Array.isArray(parts)) {
    return parts.filter(isTextPart).map((part) => part.text).join(separator);
  }
  return '';
}

/**
 * Converts client messages into the OpenAI-style payload sent upstream.
 * - Only `user`/`assistant` roles survive: any other role (e.g. a client-sent
 *   `system`) is downgraded to `user`, so clients cannot spoof the system prompt.
 * - Messages without text (e.g. attachment-only) are dropped.
 * - Each message is truncated (assistant replies get a larger cap so long
 *   answers stay intact in later turns), then the newest messages are kept
 *   within a count and total-size budget. This bounds the cost of a single
 *   request regardless of what the client sends.
 */
export function toUpstreamMessages(messages: unknown[]): UpstreamChatMessage[] {
  const normalized = messages
    .filter((message) => !!message && typeof message === 'object')
    .map((message): UpstreamChatMessage => {
      const role = (message as { role?: unknown }).role === 'assistant' ? 'assistant' : 'user';
      const maxChars = role === 'assistant' ? CHAT_MAX_ASSISTANT_MESSAGE_CHARS : CHAT_MAX_MESSAGE_CHARS;
      return { role, content: getMessageText(message).slice(0, maxChars) };
    })
    .filter((message) => message.content.trim().length > 0);

  const kept: UpstreamChatMessage[] = [];
  let totalChars = 0;
  for (let i = normalized.length - 1; i >= 0 && kept.length < CHAT_MAX_HISTORY_MESSAGES; i--) {
    const message = normalized[i];
    // Always keep the newest message; stop once older history exceeds the budget
    if (kept.length > 0 && totalChars + message.content.length > CHAT_MAX_HISTORY_CHARS) break;
    kept.unshift(message);
    totalChars += message.content.length;
  }
  return kept;
}
