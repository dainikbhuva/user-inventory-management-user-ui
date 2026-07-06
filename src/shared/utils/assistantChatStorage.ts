import type { AssistantChatMessage } from '../../services/assistant.service';

const STORAGE_PREFIX = 'app-assistant-chat';
const MAX_STORED_MESSAGES = 40;

export const getAssistantChatStorageKey = (userId?: string, companyId?: string): string =>
  `${STORAGE_PREFIX}:${companyId ?? 'company'}:${userId ?? 'user'}`;

const isValidMessage = (value: unknown): value is AssistantChatMessage =>
  typeof value === 'object' &&
  value !== null &&
  'role' in value &&
  'content' in value &&
  ((value as AssistantChatMessage).role === 'user' ||
    (value as AssistantChatMessage).role === 'assistant') &&
  typeof (value as AssistantChatMessage).content === 'string';

export const loadAssistantChat = (key: string): AssistantChatMessage[] | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const messages = parsed.filter(isValidMessage).slice(-MAX_STORED_MESSAGES);
    return messages.length > 0 ? messages : null;
  } catch {
    return null;
  }
};

export const saveAssistantChat = (key: string, messages: AssistantChatMessage[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
  } catch {
    // Ignore quota errors — chat still works in session
  }
};

export const clearAssistantChat = (key: string): void => {
  localStorage.removeItem(key);
};
