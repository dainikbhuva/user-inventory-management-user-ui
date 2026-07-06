import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Send, Trash2, X } from 'lucide-react';
import { assistantService, type AssistantChatMessage } from '../../services/assistant.service';
import { getApiErrorMessage } from '../../shared/utils/apiError';
import { cn } from '../../shared/utils/cn';
import { useAuth } from '../../shared/auth/useAuth';
import {
  clearAssistantChat,
  getAssistantChatStorageKey,
  loadAssistantChat,
  saveAssistantChat,
} from '../../shared/utils/assistantChatStorage';

const WELCOME_MESSAGE: AssistantChatMessage = {
  role: 'assistant',
  content:
    'Hi! I answer questions about this portal only (leave, attendance, inventory, purchase, sales, etc.). No external AI key is required — answers come from the built-in app guide. What would you like to know?',
};

const SUGGESTIONS = [
  'How does attendance work?',
  'How does GRN work from purchase order?',
  'Where is export CSV?',
  'How to set role permissions?',
];

const hasUserMessages = (messages: AssistantChatMessage[]) =>
  messages.some((m) => m.role === 'user');

export const AppAssistantWidget = () => {
  const { user } = useAuth();
  const storageKey = useMemo(
    () => getAssistantChatStorageKey(user?.id, user?.companyId),
    [user?.id, user?.companyId]
  );

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantChatMessage[]>([WELCOME_MESSAGE]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hydratedKeyRef = useRef<string | null>(null);

  // Restore chat when user / storage key is available (survives page refresh)
  useEffect(() => {
    if (!user?.id) return;
    if (hydratedKeyRef.current === storageKey) return;

    const saved = loadAssistantChat(storageKey);
    setMessages(saved && saved.length > 0 ? saved : [WELCOME_MESSAGE]);
    hydratedKeyRef.current = storageKey;
  }, [storageKey, user?.id]);

  // Persist chat after each update
  useEffect(() => {
    if (!user?.id || hydratedKeyRef.current !== storageKey) return;

    if (!hasUserMessages(messages)) {
      clearAssistantChat(storageKey);
      return;
    }

    saveAssistantChat(storageKey, messages);
  }, [messages, storageKey, user?.id]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, isSending]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 200);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [open]);

  const clearChat = useCallback(() => {
    clearAssistantChat(storageKey);
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    setInput('');
  }, [storageKey]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      const userMessage: AssistantChatMessage = { role: 'user', content: trimmed };
      const historyForApi = messages.filter((m) => m.content !== WELCOME_MESSAGE.content);
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setError(null);
      setIsSending(true);

      try {
        const result = await assistantService.chat(trimmed, historyForApi);
        setMessages((prev) => [...prev, { role: 'assistant', content: result.answer }]);
      } catch (err) {
        const msg = getApiErrorMessage(err, 'Failed to get an answer. Please try again.');
        setError(msg);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, I could not process that right now. Please try again in a moment.',
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [isSending, messages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const showSuggestions = !hasUserMessages(messages);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-5 right-5 z-[100] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition',
          'bg-primary text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          open && 'scale-95'
        )}
        aria-label={open ? 'Close app assistant' : 'Open app assistant'}
        title="App help assistant"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      <div
        className={cn(
          'fixed inset-0 z-[99] transition-opacity duration-300',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-hidden />

        <aside
          className={cn(
            'theme-scrollbar absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-base bg-surface shadow-2xl transition-transform duration-300',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
          aria-label="App assistant chat"
        >
          <header className="flex items-start justify-between border-b border-base px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-body">App Assistant</h2>
                <p className="mt-0.5 text-xs text-muted">Answers about this portal only · saved on this device</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {hasUserMessages(messages) ? (
                <button
                  type="button"
                  onClick={clearChat}
                  className="rounded-sm p-1.5 text-muted transition hover:bg-surface-2 hover:text-red-500"
                  aria-label="Clear chat history"
                  title="Clear chat"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-sm p-1.5 text-muted transition hover:bg-surface-2 hover:text-body"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}-${msg.content.slice(0, 24)}`}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[88%] rounded-sm px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-base bg-surface-2 text-body'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending ? (
              <div className="flex justify-start">
                <div className="rounded-sm border border-base bg-surface-2 px-3 py-2 text-sm text-muted">
                  Thinking...
                </div>
              </div>
            ) : null}
          </div>

          {showSuggestions ? (
            <div className="flex flex-wrap gap-2 border-t border-base px-4 py-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void sendMessage(s)}
                  className="rounded-full border border-base bg-surface px-3 py-1 text-xs text-muted transition hover:border-primary hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          {error ? <p className="px-4 pb-1 text-xs text-red-500">{error}</p> : null}

          <form onSubmit={handleSubmit} className="border-t border-base p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(input);
                  }
                }}
                rows={2}
                placeholder="Ask about leave, stock, purchase, sales..."
                className="theme-scrollbar min-h-[44px] flex-1 resize-none rounded-sm border border-base bg-surface px-3 py-2 text-sm text-body placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isSending}
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              Chat is saved in your browser until you clear it or log out from this device.
            </p>
          </form>
        </aside>
      </div>
    </>
  );
};
