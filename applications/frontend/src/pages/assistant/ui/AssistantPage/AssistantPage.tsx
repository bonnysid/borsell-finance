import { Button, bindStyles } from '@devbonnysid/ui-kit-default';
import {
  useAskAssistant,
  useDeleteChatSession,
  useGetAssistantDigest,
  useGetChatMessages,
  useGetChatSessions,
} from '@entities/assistant';
import { ChatMessageShape } from '@packages/types';
import { FC, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import styles from './AssistantPage.module.scss';

type LocalMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  isLoading?: boolean;
};

const cn = bindStyles(styles);

function fromRemote(m: ChatMessageShape): LocalMessage {
  return { id: m.id, role: m.role, content: m.content, createdAt: m.createdAt };
}

export const AssistantPage: FC = () => {
  const { t, i18n } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: sessions = [] } = useGetChatSessions();
  const { data: remoteMessages } = useGetChatMessages(activeSessionId);
  const askAssistant = useAskAssistant();
  const getDigest = useGetAssistantDigest();
  const deleteSession = useDeleteChatSession();

  const isLoading = messages.some((m) => m.isLoading);

  const QUICK_PROMPTS = useMemo(
    () => [
      t('assistant.prompts.improve'),
      t('assistant.prompts.risks'),
      t('assistant.prompts.rebalance'),
    ],
    [t],
  );

  const greeting: LocalMessage = useMemo(
    () => ({ id: 'greeting', role: 'assistant', content: t('assistant.greeting') }),
    [t],
  );

  useEffect(() => {
    if (remoteMessages && remoteMessages.length > 0) {
      setMessages(remoteMessages.map(fromRemote));
    } else if (!activeSessionId) {
      setMessages([greeting]);
    }
  }, [remoteMessages, activeSessionId]);

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([greeting]);
    }
  }, [i18n.language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([greeting]);
    textareaRef.current?.focus();
  };

  const selectSession = (sessionId: string) => {
    if (sessionId === activeSessionId) return;
    setActiveSessionId(sessionId);
    setMessages([]);
  };

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    await deleteSession.mutateAsync(sessionId);
    if (activeSessionId === sessionId) startNewChat();
  };

  const sendMessage = async (question: string) => {
    const text = question.trim();
    if (!text || isLoading) return;

    const userId = `${Date.now()}-u`;
    const botId = `${Date.now()}-a`;

    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      { id: userId, role: 'user', content: text, createdAt: now },
      { id: botId, role: 'assistant', content: '', isLoading: true },
    ]);
    setInputValue('');

    try {
      const result = await askAssistant.mutateAsync({
        question: text,
        sessionId: activeSessionId ?? undefined,
      });

      if (!activeSessionId) setActiveSessionId(result.sessionId);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, content: result.response, isLoading: false, createdAt: new Date().toISOString() } : m,
        ),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, content: t('assistant.error'), isLoading: false, createdAt: new Date().toISOString() } : m,
        ),
      );
    }
  };

  const handleDigest = async () => {
    if (isLoading) return;
    const botId = `${Date.now()}-digest`;

    setMessages((prev) => [
      ...prev,
      { id: botId, role: 'assistant', content: '', isLoading: true },
    ]);

    try {
      const response = await getDigest.mutateAsync();
      setMessages((prev) =>
        prev.map((m) => (m.id === botId ? { ...m, content: response, isLoading: false, createdAt: new Date().toISOString() } : m)),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, content: t('assistant.error_digest'), isLoading: false, createdAt: new Date().toISOString() } : m,
        ),
      );
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const fmtMsgTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' });
  };

  return (
    <div className={cn('page')}>
      {/* Sidebar */}
      <aside className={cn('sidebar')}>
        <div className={cn('sidebar-head')}>
          <Button type="button" onClick={startNewChat} isFullWidth>
            + {t('assistant.new_chat')}
          </Button>
        </div>
        <div className={cn('session-list')}>
          {sessions.map((s) => (
            <div
              key={s.id}
              className={cn('session-item', { active: s.id === activeSessionId })}
              onClick={() => selectSession(s.id)}
            >
              <div className={cn('session-title')}>{s.title}</div>
              <div className={cn('session-meta')}>
                <span>{fmtDate(s.updatedAt)}</span>
                <button
                  type="button"
                  className={cn('session-del')}
                  onClick={(e) => handleDelete(e, s.id)}
                  title={t('assistant.delete_chat')}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <div className={cn('chat')}>
        <div className={cn('chat-header')}>
          <div>
            <h1>{t('assistant.page_title')}</h1>
            <p>{t('assistant.page_description')}</p>
          </div>
        </div>

        <div className={cn('messages')}>
          {messages.map((msg) => (
            <div key={msg.id} className={cn('msg', msg.role)}>
              {msg.isLoading ? (
                <div className={cn('typing')}>
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
                <>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                  {msg.createdAt && (
                    <span className={cn('msg-time')}>{fmtMsgTime(msg.createdAt)}</span>
                  )}
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={cn('bottom')}>
          <div className={cn('quick-prompts')}>
            <button
              type="button"
              className={cn('digest-btn')}
              onClick={handleDigest}
              disabled={isLoading}
            >
              ✨ {t('assistant.get_digest')}
            </button>
            {QUICK_PROMPTS.map((p) => (
              <button key={p} type="button" disabled={isLoading} onClick={() => sendMessage(p)}>
                {p}
              </button>
            ))}
          </div>

          <form className={cn('form')} onSubmit={handleSubmit}>
            <div className={cn('textarea-wrap')}>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('assistant.placeholder')}
                rows={2}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={!inputValue.trim() || isLoading}>
              {t('assistant.send')}
            </Button>
          </form>
          <span className={cn('hint')}>{t('assistant.enter_hint')}</span>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
